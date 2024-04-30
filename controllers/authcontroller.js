const admindatacollection = require('../model/admindatacollection')
const userdatacollection = require('../model/userdatacollection');
const bcrypt = require('bcrypt');
const { sendPhoneOtp, resendPhoneOtp } = require('../utilities/twilio')
const { sendEmail } = require('../utilities/nodemailer')
const otpgen = Math.floor(Math.random() * 900000) + 100000;
const client = require('twilio')(process.env.Acountsid, process.env.Acountauthtoken);
const passwordregex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = {

    adminlogin: (req, res) => {
        res.render('admin/adminlogin')
    },

    adminloginpost: async (req, res) => {
        try {
            const { username, password, secretkey } = req.body;
            const userexist = await admindatacollection.findOne({ username });

            if (!userexist) {
                return res.status(401).json({ error: 'User does not exist' });
            }

            const passwordog = userexist.password;

            if (passwordog !== password) {
                return res.status(401).json({ error: 'Incorrect password' });
            }

            const secretkeyog = userexist.secretkey;
            if (secretkeyog !== secretkey) {
                return res.status(401).json({ error: 'Incorrect secret key' });
            }

            req.session.admin = userexist._id;
            res.status(200).json({ success: true, adminId: userexist._id }); 
        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({ error: 'Internal error' });
        }
    },



    loginget: (req, res) => {
        res.render('user/login');
    },


    loginpost: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await userdatacollection.findOne({ username });

            if (!user) {
                return res.status(401).json({ error: 'Invalid user' });
            }

            const passMatch = await bcrypt.compare(password, user.password);

            if (!passMatch) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            if (user.otpVerified !== true) {
                return res.status(201).json({ error: 'Invalid password' });

            }

            req.session.user = user._id;

            // Send success response
            return res.status(200).json({ success: true, userId: user._id });
        } catch (error) {
            console.error('Login error:', error);
            // Send internal server error response
            return res.status(500).json({ error: 'Internal error' });
        }
    },



    signupget: (req, res) => {
        res.render('user/signup');
    },


    signuppost: async (req, res) => {
        try {
            const phoneregex = /^\d{10}$/;
            const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const passwordregex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

            const { username, email, phone, password, confirmpassword } = req.body;

            const userExist = await userdatacollection.findOne({ username });

            if (userExist) {
                return res.status(401).json({ error: 'User already exists' });
            }

            if (!emailregex.test(email)) {
                return res.status(401).json({ error: 'Invalid email format' });
            }

            if (email.split('@')[1] !== 'gmail.com') {
                return res.status(401).json({ error: 'Email must end with gmail.com' });
            }

            const emailExist = await userdatacollection.findOne({ email });

            if (emailExist) {
                return res.status(401).json({ error: 'Email already exists' });
            }

            if (!phoneregex.test(phone)) {
                return res.status(401).json({ error: 'Phone number must contain 10 digits' });
            }

            const phoneExist = await userdatacollection.findOne({ phone });

            if (phoneExist) {
                return res.status(401).json({ error: 'Phone number already exists' });
            }

            if (!passwordregex.test(password)) {
                return res.status(401).json({ error: 'Password must contain at least 8 characters, one lowercase letter, one uppercase letter, and one digit' });
            }

            if (password !== confirmpassword) {
                return res.status(401).json({ error: 'Password and confirmation password do not match' });
            }

            if (!username || !email || !phone || !password || !confirmpassword) {
                return res.status(401).json({ error: 'All details should be filled' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            let newUser = new userdatacollection({
                username,
                email,
                phone,
                password: hashedPassword,
            });

            await newUser.save();

            req.session.phone = phone;
            const phoneo = req.session.phone;
            //   await sendPhoneOtp(phoneo);

            //    res.redirect('/login')
            //    res.redirect('/verifynumber')

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Internal error' });
        }
    },



    verificationget: (req, res) => {
        res.render('user/otp verification');
    },


    verificationpost: async (req, res) => {

        const { otp } = req.body;
        const phone = req.session.phone;

        const verificationCheck = await client.verify.services(process.env.servicesid)
            .verificationChecks
            .create({
                to: `+91${req.session.phone}`,
                code: otp,
            });

        if (verificationCheck.status !== 'approved') {
            return res.status(401).json({ error: 'OTP verification failed' });

        }

        try {

            const user = await userdatacollection.findOneAndUpdate(
                { phone: phone },
                { $set: { otpVerified: true } },
                { new: true }
            );



            res.redirect('/login');

        } catch (error) {
            console.error('Verification error:', error);
            res.status(401).json({ error: 'Invalid OTP' });

        }
    },

    resendOtp: async (req, res) => {
        try {
            const phone = req.session.phone;
            if (!phone) {
                return res.status(401).json({ error: 'Phone number not found' });

            }


            await resendPhoneOtp(phone);
        } catch (error) {
            console.error('Resend OTP error:', error);
            res.status(500).send('Internal error');
        }
    },

    otpVerifiedget: (req, res) => {
        res.render('user/otpVerified')
    },

    otpVerifiedpost: async (req, res) => {
        try {

            const phoneregex = /^\d{10}$/;

            const { phone } = req.body;

            if (!phoneregex.test(phone)) {
                return res.status(401).json({ error: 'Phone number must contain 10 digits' });

            }

            const phoneExist = await userdatacollection.findOne({ phone });

            if (phoneExist) {

                req.session.phone = phone
                const phoneo = req.session.phone

                await sendPhoneOtp(phoneo);

                res.redirect('/verify')
            }
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).send('Internal error');
        }
    },

    forgotpasswordEget: (req, res) => {
        res.render('user/forgotE')
    },

    forgotpasswordEpost: async (req, res) => {
        try {
            const { email } = req.body;

            req.session.email = email

            await sendEmail(email, otpgen);

            res.redirect('/forgototp')
        } catch (error) {
            console.error('Error in sending email:', error);
            res.status(500).send('Internal error');
        }
    },


    forgotpasswordOget: (req, res) => {
        if (req.session.email) {
            res.render('user/forgotO')
        } else {
            res.redirect('/forgotemail')
        }
    },

    forgotpasswordOpost: async (req, res) => {
        const { otp } = req.body;

        if (otpgen != otp) {
            return res.status(401).json({ error: 'OTP verification failed' });


        }
        try {

            res.redirect('/resetpassword');
        } catch (error) {
            console.error('OTP verification error:', error);
            return res.status(401).json({ error: 'OTP verification failed. Please try again' });


        }
    },

    resendOtpToEmail: async (req, res) => {
        try {
            const email = req.session.email

            if (!email) {
                return res.status(401).json({ error: 'Email not found in session' });


            }


            await sendEmail(email, otpgen);

        } catch (error) {
            console.error('Resend OTP to Email error:', error);
            res.status(500).send('Internal error');
        }
    },

    resetpassordget: (req, res) => {
        if (req.session.email) {
            res.render('user/resetpassword')
        } else {
            res.redirect('/forgototp')
        }
    },

    resetpassordpost: async (req, res) => {
        try {
            const { username, password, confirmpassword } = req.body;
            const userExist = await userdatacollection.findOne({ username });

            if (!userExist) {
                return res.status(401).json({ error: 'User does not exist' });
            }

            const passwordLength = password.length;
            const hasLowerCase = /[a-z]/.test(password);
            const hasUpperCase = /[A-Z]/.test(password);
            const hasDigit = /\d/.test(password);

            if (passwordLength < 8 || !hasLowerCase || !hasUpperCase || !hasDigit) {
                const errorMessage = 'Password must contain at least 8 characters, one lowercase letter, one uppercase letter, and one digit';
                return res.status(401).json({ error: errorMessage });
            }

            if (password !== confirmpassword) {
                return res.status(401).json({ error: 'Password and confirmation password do not match' });
            }

            const newPassword = await bcrypt.hash(password, 10);
            await userdatacollection.updateOne({ username }, {
                $set: {
                    password: newPassword,
                }
            }, { upsert: true });

            res.redirect('/login');
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ error: 'Internal error' });
        }
    },




}