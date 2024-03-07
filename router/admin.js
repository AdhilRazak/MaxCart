const express = require('express')
const router = express.Router()

const {admindashboardget}=require('../controllers/admin')
const {adminlogin,adminloginpost}=require('../controllers/authcontroller')

router.get('/',adminlogin)
router.post('/',adminloginpost)
router.get('/d',admindashboardget)

module.exports = router