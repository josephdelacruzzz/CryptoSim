require('dotenv').config()
const express = require('express')
const axios = require('axios')
const cors = require('cors')
const mongoose = require('mongoose')
const authRoutes = require('./routes/auth')
const transactionRoutes = require('./routes/transactions')
const User = require('./models/User')

const app = express()
const PORT = 5001

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)


app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`)
})

mongoose.connect(process.env.ATLAS_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err))


let cryptoCache = null
let lastFetchTime = 0

//fetches realtime crypto data from CoinGecko
app.get('/api/crypto', async (req, res) => {
    try {

        if (cryptoCache && Date.now() - lastFetchTime < 60000) {
            return res.json(cryptoCache)
        }

        await new Promise(resolve => setTimeout(resolve, 1000))

        const response = await axios.get ('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=false')

        const crypto = response.data.map(coin => ({
            id: coin.id,
            name: coin.name,
            current_price: coin.current_price,
            market_cap: coin.market_cap,
            price_change_percentage_24h: coin.price_change_percentage_24h
        }))

        cryptoCache = crypto
        lastFetchTime = Date.now()

        res.json(crypto)
    } catch (error) {
        console.error('Error receiving data from CoinGecko:', error.message)
        res.status(500).json({error: 'Failed to receive data from CoinGecko'})
    }
})

//test mongo connection
app.get('/api/test', async (req,res) => {
    try {
        const db = mongoose.connection.db
        const result = await db.collection('test').insertOne({message: "test", date: new Date()})

        res.json({
            status: "success",
            insertedId: result.insertedId,
            atlas: true
        })
    }catch (error) {
        res.status(500).json({error: error.message})
    }
})

app.get('/api/auth/me', async (req,res) => {
    try {
        const {username} =req.query
        const user = await User.findOne({username}).select('-password')
        if (!user) 
            return res.status(404).json({error: "user not found"})
        res.json(user)
    } catch (error) {
        console.error('Auth error:', error)
        res.status(500).send("server error")
    }
})
