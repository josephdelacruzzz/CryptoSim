const express = require('express')
const router = express.Router();
const User = require('../models/User')
const Portfolio = require('../models/Portfolio')
const axios = require('axios')

router.post('/buy', async (req, res) => {
    try {
        const {username, cryptoId, amount } = req.body;

        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).json({error: "User not found"})
        }

        console.log(`Fetching price for cryptoId: ${cryptoId}`)
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`)

        const currentPrice = response.data[cryptoId].usd
        const totalCost = amount * currentPrice;
        if (user.balance < totalCost) {
            return res.status(400).json({error: "Insufficient funds"})
        }

        user.balance -= totalCost
        await user.save();

        let portfolioItem = await Portfolio.findOne({userId: user._id, cryptoId})

        if (portfolioItem) {
            const newTotalAmt = portfolioItem.amount + amount
            portfolioItem.avgBuyPrice = ((portfolioItem.amount * portfolioItem.avgBuyPrice) + totalCost) / newTotalAmt
            portfolioItem.amount = newTotalAmt
        } else {
            portfolioItem = new Portfolio({userId: user._id, cryptoId, amount, avgBuyPrice: currentPrice})
        }

        await portfolioItem.save()

        res.json({
            success: true,
            crypto: cryptoId,
            amountPurchased: amount,
            pricePerCoin: currentPrice,
            totalSpent: totalCost,
            newBalance: user.balance
        })
    } catch (error) {
        res.status(500).json({error: "Purchase failed", details: error.message})
    }
})

router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({username: req.params.username})
        if (!user)
            return res.status(404).json({error: "User not found"})

        const portfolio = await Portfolio.find({userId: user._id})
        res.json(portfolio)
    } catch (error) {
        res.status(500).json({error: "Failed to fetch portfolio"})
    }
})

module.exports = router;