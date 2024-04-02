const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    productId: [{
        id: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductData' // Make sure to use quotes for the model name
        },
        quantity:{
            type:Number,
            required:true
        }
    }]
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
