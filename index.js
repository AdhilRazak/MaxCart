const express = require('express')
const path = require('path')
const nocache = require('nocache')
const mongoose = require('mongoose')
const ejs = require('ejs')
const session = require('express-session')

const app = express()

require('dotenv').config()

const port = process.env.port

mongoose.connect('mongodb://localhost:27017/mongoecommerce')
    .then(() => {
        console.log('mongodb connected');
        startserver()
    })
    .catch((err) => {
        console.log(err);
    })

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'view'))
app.use(express.static("public"))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

const user = require('./router/user')
const admin = require('./router/admin')

app.use('/', user)
app.use('/admin', admin)

function startserver() {
    app.listen(port, () => {
        console.log('running on 4516');
    })
}



