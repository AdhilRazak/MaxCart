const express = require('express');
const router = express.Router();

const { loginget, loginpost, signupget, signuppost, verificationget, verificationpost,
    resendOtp, forgotpasswordEget, forgotpasswordEpost, forgotpasswordOget,
    forgotpasswordOpost, resetpassordget, resetpassordpost,
    resendOtpToEmail, otpVerifiedget, otpVerifiedpost } = require('../controllers/authcontroller');

const { userhomeget, useraccountget, useraccounteditget, useraccounteditpost,logout } = require('../controllers/user')

const { categoryfilterget } = require('../controllers/categorycondroller')

const { userallproducts, viewsingleproducts, filterProduct, sort, reviewget, reviewpost } = require('../controllers/productcondroller')

const { addressget, addaddressget, addaddresspost, editaddress, editaddressget, deleteaddress } = require('../controllers/addresscontroller')

const { addtocart, showcart, updatecartquantity, cartdelete } = require('../controllers/cartcont')

const { addtowishlist, wishlistget, deletewishlist } = require('../controllers/wishlist')

const { buyoneget, buyoneupdate, checkoutget, applyCoupon,
    checkoutpost, completeOrder, completed, orderlist,
    ordersummary, ordercancel } = require('../controllers/payment')

router.get('/', loginget);
router.post('/', loginpost);
router.get('/signup', signupget);
router.post('/signup', signuppost);

router.get('/verify', verificationget);
router.post('/verify', verificationpost);

router.post('/resendotp', resendOtp);

router.get('/verifynumber', otpVerifiedget)
router.post('/verifynumber', otpVerifiedpost)


router.get('/forgotemail', forgotpasswordEget)
router.post('/forgotemail', forgotpasswordEpost)
router.get('/forgototp', forgotpasswordOget)
router.post('/forgototp', forgotpasswordOpost)
router.post('/resentotpemail', resendOtpToEmail)

router.get('/resetpassword', resetpassordget)
router.post('/resetpassword', resetpassordpost)

router.get('/home', userhomeget)

router.get('/allproduct', userallproducts)
router.get('/filterproduct', filterProduct)
router.get('/sort', sort)


router.get('/category', categoryfilterget)

router.get('/userprofile', useraccountget)
router.get('/userprofiledit', useraccounteditget)
router.post('/userprofiledit', useraccounteditpost)

router.get('/useraddress', addressget)
router.get('/addaddress', addaddressget)
router.post('/addaddress', addaddresspost)
router.get('/editaddress', editaddressget)
router.post('/editaddress', editaddress)

router.post('/deleteaddress', deleteaddress)

router.get('/viewsingleproduct', viewsingleproducts)

router.post('/addtocart', addtocart)
router.get('/usercart', showcart)
router.post('/updatecart', updatecartquantity)
router.post('/cartdelete', cartdelete)

router.post('/addtowishlist', addtowishlist)
router.get('/userwishlist', wishlistget)
router.post('/deletewhislist', deletewishlist)

router.get('/buyone', buyoneget)
router.post('/buyoneupdate', buyoneupdate)

router.get('/checkout/:id', checkoutget)
router.post('/applycoupon', applyCoupon)
router.post('/checkpost', checkoutpost)
router.get('/completeOrder', completeOrder)
router.get('/completed', completed)

router.get('/orderlist', orderlist)
router.get('/ordersummary', ordersummary)
router.post('/ordercancel', ordercancel)

router.get('/productreview', reviewget)
router.post('/productreview', reviewpost)

router.get('/logout',logout)












module.exports = router;
