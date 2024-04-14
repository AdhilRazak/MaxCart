const mongoose = require('mongoose')

const review = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId
    },
    reviews: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        rating: {
            type: Number
        },
        title: {
            type: String
        },
        comment: {
            type: String
        }
    }]
})

const reviews = mongoose.model('reviews', review)

module.exports = reviews