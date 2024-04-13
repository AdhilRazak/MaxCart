const mongoose = require('mongoose')

const userdata = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    otpVerified: {
        type: Boolean,
        default: true // Indicates whether OTP is verified
    }
}, { timestamps: true });

const userdatacollection = mongoose.model('user', userdata);

module.exports = userdatacollection;
