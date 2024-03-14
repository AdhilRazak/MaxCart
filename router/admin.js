const express = require('express')
const router = express.Router()

const {admindashboardget}=require('../controllers/admin')
const {adminlogin,adminloginpost}=require('../controllers/authcontroller')
const{productget,addproductget, addproductspost,blockproductvisility}=require('../controllers/productcondroller')
const{categoryget,categorypost}=require('../controllers/categorycondroller')
const multer=require('../middleware/multer')

const uploadProducts = multer.productimage()


router.get('/',adminlogin)
router.post('/',adminloginpost)

router.get('/dashboard',admindashboardget)

router.get('/product',productget)

router.get('/addproduct',addproductget)
router.post('/addproduct',uploadProducts.array('productImage',5),addproductspost)

router.post('/productvisiblity',blockproductvisility)


router.get('/category',categoryget)
router.post('/category',categorypost)



module.exports = router