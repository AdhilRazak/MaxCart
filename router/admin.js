const express = require('express')
const router = express.Router()

const {adminlogin,adminloginpost}=require('../controllers/admin')

router.get('/',adminlogin)
router.post('/',adminloginpost)

module.exports = router