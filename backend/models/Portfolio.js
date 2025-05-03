const mongoose = require('mongoose')

const portfolioSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    cryptoId: {type: String, required: true},
    amount: {type: Number, required: true},
    avgBuyPrice: {type: Number, required: true},
    timestamp: {type: Date, default: Date.now}
});
module.exports = mongoose.model ('Portfolio', portfolioSchema)