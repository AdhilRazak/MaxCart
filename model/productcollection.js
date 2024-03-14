const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productImage: {
        type: Array, // Or String if you're storing a single image URL
        required: true
    },
    prices: {
        type: Number,
        required: true
    },
    discount: { // Adjusted to match the case
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    category: { // Adjusted to match the case
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
    }

});

const ProductData = mongoose.model('ProductData', productSchema);

module.exports = ProductData;
