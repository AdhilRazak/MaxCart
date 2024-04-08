const mongoose = require('mongoose')

const order = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId
    },
    productId: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductData'
        },
        quantity: {
            type: String
        }

    }],
    subtotal: {
        type: String,
    },
    address: {
        type: String
    },
    paymentmethod: {
        type: String
    },
    status: {
        type: String,
        default: 'pending'
    }
})

const orders = mongoose.model('orders',order)

module.exports = orders