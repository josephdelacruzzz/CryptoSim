const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Portfolio = require('../models/Portfolio')
const Transaction = require('../models/Transaction')
const axios = require('axios')

router.post('/buy', async (req, res) => {
    try {
        const {username, cryptoId, amount } = req.body
        const parsedAmount = parseFloat(amount)

        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).json({error: "User not found"})
        }

        console.log(`Fetching price for cryptoId: ${cryptoId}`)
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`)

        const currentPrice = response.data[cryptoId].usd
        const totalCost = parsedAmount * currentPrice
        if (user.balance < totalCost) {
            return res.status(400).json({error: "Insufficient funds"})
        }

        user.balance -= totalCost
        await user.save()

        let portfolioItem = await Portfolio.findOne({userId: user._id, cryptoId})

        if (portfolioItem) {
            const newTotalAmt = portfolioItem.amount + amount
            portfolioItem.avgBuyPrice = ((portfolioItem.amount * portfolioItem.avgBuyPrice) + totalCost) / newTotalAmt
            portfolioItem.amount = newTotalAmt
        } else {
            portfolioItem = new Portfolio({userId: user._id, cryptoId, amount, avgBuyPrice: currentPrice})
        }

        await portfolioItem.save()

        const newTransaction = new Transaction({
            userId: user._id,
            cryptoId: cryptoId,
            type: 'buy',
            amount: parsedAmount,
            price: currentPrice,
            totalValue: totalCost,
            timestamp: new Date()
        })

        await newTransaction.save()

        res.json({
            success: true,
            crypto: cryptoId,
            amountPurchased: parsedAmount,
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

console.log('Sell route registered')
router.post('/sell', async (req, res) => {
    try {
        const {username, cryptoId, amount} = req.body
        const amountToSell = parseFloat(amount)

        const user = await User.findOne({username})

        if (!user) {
            return res.status(400).json({error: "User not found"})
        }

        let portfolioItem = await Portfolio.findOne({
            userId: user._id, cryptoId    
        })

        if (!portfolioItem || portfolioItem.amount < amount) {
            return res.status(400).json({error: "Insufficient amount to sell"})
        }

        const priceResponse = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`)
        const currentPrice = priceResponse.data[cryptoId].usd
        const totalValue = amountToSell * currentPrice

        user.balance += totalValue
        portfolioItem.amount -= amount
        
        if (portfolioItem.amount <= 0) {
            await Portfolio.deleteOne({ _id: portfolioItem._id })
        } else {
            await portfolioItem.save()
        }

        await user.save()

        const newTransaction = new Transaction({
            userId: user._id,
            cryptoId: cryptoId,
            type: 'sell',
            amount: amountToSell,
            price: currentPrice,
            totalValue: totalValue,
            timestamp: new Date()
        })
        await newTransaction.save()

        res.json({
            success: true,
            message: "Sale completed",
            amountSold: amountToSell,
            pricePerCoin: currentPrice,
            totalValue,
            newBalance: user.balance
        })

    } catch (error) {
        res.status(500).json({error: "Sale failed", details: error.message})
    }
})

router.get('/history/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const history = await Transaction.find({ userId: user._id })
                                        .sort({ timestamp: -1 }) 
                                        .select('-userId') 
                                        // .lean()

        res.json(history)
    } catch (error) {
        console.error('Error fetching transaction history:', error)
        res.status(500).json({ error: "Failed to fetch transaction history", details: error.message })
    }
})

module.exports = router