const mongoose = require('mongoose')

const address =new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"customer",
        required:true
    },
    address:[{
        locality:{
            type:String,
            required:true
        },
        country:{
            type:String,
            reuired:true
        },
        district:{
            type:String,
            reuired:true
        },
        state:{
            type:String,
            reuired:true
        },
        city:{
            type:String,
            reuired:true
        },
        houseno:{
            type:String,
            reuired:true
        },
        pincode:{
            type:String,
            reuired:true
        },

    }]
})

const addressdata = mongoose.model('address',address)

module.exports=addressdata