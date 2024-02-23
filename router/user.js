const express = require('express');
const router = express.Router();
const { loginget, loginpost, signupget, signuppost, verificationget, verificationpost ,resendOtp,forgotpasswordEget,
    forgotpasswordEpost,forgotpasswordOget,forgotpasswordOpost,resetpassordget,resetpassordpost,resendOtpToEmail} = require('../controllers/user');

router.get('/', loginget);
router.post('/', loginpost);
router.get('/signup', signupget);
router.post('/signup', signuppost);

router.get('/verify', verificationget);
router.post('/verify', verificationpost);
router.post('/resendotp',resendOtp);

router.get('/forgotemail',forgotpasswordEget)
router.post('/forgotemail',forgotpasswordEpost)
router.get('/forgototp',forgotpasswordOget)
router.post('/forgototp',forgotpasswordOpost)
router.post('/resentotpemail',resendOtpToEmail)

router.get('/resetpassword',resetpassordget)
router.post('/resetpassword',resetpassordpost)



module.exports = router;
