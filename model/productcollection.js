const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productImage: {
        type: Array,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    write: {
        type: String,
        required: true
    },
    prices: {
        type: Number,
        required: true
    },
    discount: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    deliveryDate: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false,
        required: true
    },
    discounted: {
        type: String,
    }

});

const ProductData = mongoose.model('ProductData', productSchema);

module.exports = ProductData;
