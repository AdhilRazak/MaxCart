const mongoose = require('mongoose')

const bannerdats = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    offer:{
        type:String,
        required:true
    }
})

const bannerdata = mongoose.model('banner',bannerdats)

module.exports=bannerdata