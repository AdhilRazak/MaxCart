const admindatacollection = require('../model/admindatacollection')
const userdatacollection = require('../model/userdatacollection');
const bcrypt = require('bcrypt');
const {sendPhoneOtp,resendPhoneOtp}=require('../middleware/twilio')
const  {sendEmail}= require('../middleware/nodemailer')
const otpgen = Math.floor(Math.random() * 900000) + 100000; 
const client = require('twilio')(process.env.Acountsid, process.env.Acountauthtoken);
const passwordregex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/;
const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports ={

    adminlogin:(req,res)=>{
        res.render('admin/adminlogin')
    },

    adminloginpost:async(req,res)=>{
      
        const {username,password,secretkey}= req.body

        const userexist = await admindatacollection.findOne({username})

        if(!userexist){
            return res.status(401).send('not an existing admin')
        }

        const passwordog = userexist.password

        if(passwordog !== password){
            return res.status(401).send('password is not correct')
        }

        const scretkeyog = userexist.secretkey
        console.log(scretkeyog);
        if(scretkeyog !== secretkey){
            return res.status(401).send('scret key is wrong')
        }

        res.redirect('/dashboard')
    },

    
    loginget: (req, res) => {
        res.render('user/login');
    },
    

    loginpost: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await userdatacollection.findOne({ username });

            if (!user) {
                return res.send('Invalid user');
            }

            const passMatch = await bcrypt.compare(password, user.password);

            if (!passMatch) {
                return res.send('Invalid password');
            }
            
            req.session.username = username
            

            if(user.otpVerified !== true ){
                return res.redirect('/v');
                
            }
            res.send('welcome'); 

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).send('Internal error');
        }
    },


    signupget: (req, res) => {
        res.render('user/signup');
    },


    signuppost: async (req, res) => {
        try {
           
            const phoneregex = /^\d{10}$/;

            const { username, email, phone, password, confirmpassword } = req.body;

            const userExist = await userdatacollection.findOne({ username });

            if (userExist) {
                return res.status(401).send('User already exists')
            }

            if (!emailregex.test(email)) {
                return res.status(401).send('Invalid email format');
            }

            if (email.split('@')[1] !== 'gmail.com') {
                return res.status(401).send('Email must end with gmail.com');
            }

            const emailExist = await userdatacollection.findOne({ email });

            if(emailExist){
                return res.status(401).send('email already exists')
                
            }

            if (!phoneregex.test(phone)) {
                return res.status(401).send('Phone number must contain 10 digits');
            }

            const phoneExist = await userdatacollection.findOne({ phone });

            if(phoneExist){
                return res.status(401).send('phone already exists')

            }
            if (!passwordregex.test(password)) {
                return res.status(401).send('Password must contain at least 8 characters, one lowercase letter, one uppercase letter, and one digit');
            }

            if (password !== confirmpassword) {
                return res.status(401).send('Password and confirmation password do not match');
            }

            if (!username || !email || !phone || !password || !confirmpassword) {
                return res.status(401).send('All details should be filled');
            }

            const hashedPassword = await bcrypt.hash(password, 10);


            let newUser = new userdatacollection({
                username,
                email,
                phone,
                password: hashedPassword,
            });
            
            await newUser.save();

            req.session.phone = phone
           const phoneo = req.session.phone

        //    await sendPhoneOtp(phoneo);

          res.redirect('/verify')        
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).send('Internal error');
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
            throw new Error('OTP verification failed');
        }

try{
        
        const user = await userdatacollection.findOneAndUpdate(
            { phone : phone},
            { $set: { otpVerified: true } },
            { new: true }
        );

        

         res.redirect('/');
        
    } catch (error) {
        console.error('Verification error:', error);
        res.status(401).send('Invalid OTP');
    }
    },

    resendOtp: async (req, res) => {
        try {
            const phone = req.session.phone; 
            if (!phone) {
                return res.status(404).send('Phone number not found');
            }

        
            await resendPhoneOtp(phone);
        } catch (error) {
            console.error('Resend OTP error:', error);
            res.status(500).send('Internal error');
        }
    },
    
    otpVerifiedget:(req,res)=>{
     res.render('user/otpVerified')
    },

    otpVerifiedpost:async(req,res)=>{
        try {
           
            const phoneregex = /^\d{10}$/;

            const {phone} = req.body;           

            if (!phoneregex.test(phone)) {
                return res.status(401).send('Phone number must contain 10 digits');
            }

            const phoneExist = await userdatacollection.findOne({ phone });

            if(phoneExist){
               
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

    forgotpasswordEget:(req,res)=>{
        res.render('user/forgotE')
    },

    forgotpasswordEpost: async (req, res) => {
        try {
            const { email } = req.body;

            req.session.email = email

            await sendEmail(email, otpgen); 

            res.redirect('/forgototp');
        } catch (error) {
            console.error('Error in sending email:', error);
            res.status(500).send('Internal error');
        }
    },
    

    forgotpasswordOget:(req,res)=>{
        if(req.session.email){
      res.render('user/forgotO')
        }else{
            res.redirect('/forgotemail')
        }
    },

    forgotpasswordOpost: async (req, res) => {
            console.log('hai');
            const { otp } = req.body;
            console.log(otpgen);
            console.log(otp)

            if (otpgen != otp) {
                throw new Error('OTP verification failed');
            }
        try{

            res.redirect('/resetpassword');
        } catch (error) {
            console.error('OTP verification error:', error);
            res.status(401).send('OTP verification failed. Please try again.');
        }
    },
    
     resendOtpToEmail : async (req, res) => {
        try {
            const email = req.session.email
    
            if (!email) {
                return res.status(404).send('Email not found in session');
            }
    
           
            await sendEmail(email, otpgen); 
    
    
            res.send('OTP has been resent to your email');
        } catch (error) {
            console.error('Resend OTP to Email error:', error);
            res.status(500).send('Internal error');
        }
    },

    resetpassordget:(req,res)=>{
        if(req.session.email){
        res.render('user/resetpassword')
      }else{
        res.redirect('/forgototp')
      }
    },

    resetpassordpost:async(req,res)=>{

        const {username,password,confirmpassword} = req.body

        const userexist = await userdatacollection.findOne({username})

        if(!userexist){
            return res.status(401).send(`not exiting user`)

        }
     if(!passwordregex.test(password)){
        return res.status(401).send('Password must contain at least 5 characters, one lowercase letter, one uppercase letter, and one digit')
     }

     if(password !== confirmpassword){
        return res.status(401).send(`password and confirmpassword does'nt match`)
     }
     try {
        const newPassword = await bcrypt.hash(password,10)
        await userdatacollection.updateOne({username}, {
            $set: {
                password: newPassword, 
            }
        }, { upsert: true });

        res.redirect('/')
    }
    catch(err) {
        res.send(err)
    }

}


}