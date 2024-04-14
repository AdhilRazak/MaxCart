const mongoose = require('mongoose')

const coupondata = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    MinOrderAmount: {
        type: Number,
        required: true
    },
    MaxOrderAmount: {
        type: Number,
        required: true
    }
})

const coupon = mongoose.model('coupon', coupondata)

module.exports = coupon