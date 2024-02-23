const mongoose = require('mongoose')

const admindatacollection = mongoose.connection.collection('admin')

module.exports=admindatacollection