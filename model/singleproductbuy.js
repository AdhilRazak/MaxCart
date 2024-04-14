const mongoose = require('mongoose')

const buyone = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    productId: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductData'
        },
        quantity: {
            type: String,
            required: true
        }
    }],

    total: {
        type: String,

    }


})

const onebuy = mongoose.model('buyOne', buyone)

module.exports = onebuy