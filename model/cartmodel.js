const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
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
            type: Number,
            required: true
        }
    }],
    total: {
        type: String,
    }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
