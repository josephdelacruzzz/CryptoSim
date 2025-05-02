require('dotenv').config()
const express = require('express')
const axios = require('axios')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express();
const PORT = 5001

app.use(cors())
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
})

mongoose.connect(process.env.ATLAS_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err))


//fetches realtime crypto data from CoinGecko
app.get('/api/crypto', async (req, res) => {
    try {
        const response = await axios.get (
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false'
        );
        res.json(response.data);
    } catch (error) {
        console.error('Error receiving data from CoinGecko:', error.message);
        res.status(500).json({error: 'Failed to receive data from CoinGecko'})
    }
})

//test mongo connection
app.get('/api/test', async (req,res) => {
    try {
        const db = mongoose.connection.db;
        const result = await db.collection('test').insertOne({message: "test", date: new Date()});

        res.json({
            status: "success",
            insertedId: result.insertedId,
            atlas: true
        });
    }catch (error) {
        res.status(500).json({error: error.message});
    }
})
