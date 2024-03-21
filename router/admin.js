const express = require('express')
const router = express.Router()

const {admindashboardget,adminuserlistget,Blockuser}=require('../controllers/admin')
const {adminlogin,adminloginpost}=require('../controllers/authcontroller')
const{productget,addproductget, addproductspost,blockproductvisibility,producteditget,producteditpost,productdelete}=require('../controllers/productcondroller')
const{categoryget,categorypost,Editcategoryget,deleteCategory, editcategorypost,subCategorydelete}=require('../controllers/categorycondroller')
const {couponget,addcouponget,addcouponpost,editcoupenget,editCouponPost,deleteCoupon}=require('../controllers/couponcontroller')

const multer=require('../middleware/multer')


const uploadProducts = multer.productimage()


router.get('/',adminlogin)
router.post('/',adminloginpost)

router.get('/dashboard',admindashboardget)

router.get('/product',productget)

router.get('/addproduct',addproductget)
router.post('/addproduct',uploadProducts.array('productImage',5),addproductspost)

router.post('/productvisiblity',blockproductvisibility)

router.get('/Editproduct/:id',producteditget)

router.post('/Editproduct/:id',uploadProducts.array('productImage',5),producteditpost)

router.delete('/productdelete/:id',productdelete)

router.get('/categories',categoryget);
router.post('/categories',categorypost);
router.get('/editcategory',Editcategoryget)
router.post('/editcategory',editcategorypost)


router.delete('/deletecategory',deleteCategory)

router.delete('/subcategorydelete',subCategorydelete)

router.get('/coupon',couponget)

router.get('/addcoupon',addcouponget)
router.post('/addcoupon',addcouponpost)

router.get('/editcoupon', editcoupenget);
router.post('/editcoupon', editCouponPost);

router.delete('/deletecoupon', deleteCoupon);

router.get('/adminuserlist',adminuserlistget)
router.post('/blockuser',Blockuser)










module.exports = router