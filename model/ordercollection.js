const mongoose = require('mongoose')

const order = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId
    },
    orderlist: [{
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
            type: Number,
        },
        total: {
            type: Number,
        },
        address: {
            type: String
        },
        paymentmethod: {
            type: String
        },
        discount: {
            type: Number
        },
        coupondiscount: {
            type: Number
        },
        status: {
            type: String,
            default: 'pending'
        },
        delivery: {
            type: String,
            default: 'not delivered'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }

    }]


})

const orders = mongoose.model('orders', order)

module.exports = orders