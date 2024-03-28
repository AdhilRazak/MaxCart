const categorydata = require('../model/categorycollection')
const bannerdata = require('../model/bannercollection')
const ProductModel = require('../model/productcollection')
const userdatacollection = require('../model/userdatacollection')
const { Redirect } = require('twilio/lib/twiml/VoiceResponse')
const passwordregex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/;
const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneregex = /^\d{10}$/;
const bcrypt = require('bcrypt');



module.exports={
    userhomeget:async(req,res)=>{
        const banner = await bannerdata.find({})
        const category = await categorydata.find({})
        const product = await ProductModel.find({status:false}).limit(4)
        res.render('user/userhome',{banner,category,product})
    },

    useraccountget: async (req, res) => {
        try {
            const userID = req.session.user;
            
            if (!userID) {
                return res.redirect('/');
            }
            
            const userdata = await userdatacollection.findById(userID);
            
            if (!userdata) {
                return res.status(404).send('User data not found');
            }
    
            res.render('user/userprofile', { userdata: [userdata] }); // Ensure userdata is passed as an array
            
        } catch (error) {
            console.error('Error fetching user account data:', error);
            res.status(500).send('Internal error');
        }
    },

    useraccounteditget: async (req, res) => {
        try {
            const userID = req.session.user;
            
            if (!userID) {
                return res.redirect('/');
            }
            // Find user by ID
            const user = await userdatacollection.findById(userID);
            console.log(user);
            if (!user) {
                return res.status(404).send('User not found');
            }
            
            // Render the user profile edit page with the user data
            res.render('user/userprofiledit', { user: [user] });
        } catch (error) {
            console.error('Error fetching user account data:', error);
            res.status(500).send('Internal error');
        }
    },

    useraccounteditpost: async (req, res) => {
        try {
            const { username, email, phone, oldpasse, password, cpass } = req.body;
            const userId = req.session.user;

            console.log(oldpasse);
    
            // Find the user by ID
            const userdats = await userdatacollection.findById(userId);
    
            // Check if the username already exists
            const existuser = await userdatacollection.findOne({ username });
            if (existuser && existuser._id.toString() !== userId) {
                return res.status(401).send('Username already exists');
            }
    
            // Validate email format
            if (!emailregex.test(email)) {
                return res.status(401).send('Invalid email format');
            }
    
            // Validate email domain
            if (email.split('@')[1] !== 'gmail.com') {
                return res.status(401).send('Email must end with gmail.com');
            }
    
            // Check if email already exists
            const emailExist = await userdatacollection.findOne({ email });
            if (emailExist && emailExist._id.toString() !== userId) {
                return res.status(401).send('Email already exists');
            }
    
            // Validate phone number format
            if (!phoneregex.test(phone)) {
                return res.status(401).send('Phone number must contain 10 digits');
            }
    
            // Check if phone number already exists
            const phoneExist = await userdatacollection.findOne({ phone });
            if (phoneExist && phoneExist._id.toString() !== userId) {
                return res.status(401).send('Phone number already exists');
            }
    
            // Validate password format
            if (!passwordregex.test(password)) {
                return res.status(401).send('Password must contain at least 8 characters, one lowercase letter, one uppercase letter, and one digit');
            }
    
            // Validate old password
            const oldPasswordMatch = await bcrypt.compare(oldpasse, userdats.password);
            if (!oldPasswordMatch) {
                return res.status(401).send('Old password and entered password do not match');
            }
    
            // Validate password confirmation
            if (password !== cpass) {
                return res.status(401).send('Password and confirmation password do not match');
            }
    
            // Ensure all fields are filled
            if (!username || !email || !phone || !password || !cpass) {
                return res.status(401).send('All details should be filled');
            }
    
            // Hash the new password
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Update user data
            userdats.username = username;
            userdats.email = email;
            userdats.phone = phone;
            userdats.password = hashedPassword;
    
            // Save updated user data
            await userdats.save();
    
            // Redirect or send response as needed
            res.send('User data updated successfully');
        } catch (error) {
            console.error('Error updating user account:', error);
            res.status(500).send('Internal error');
        }
    }
    
    
    
  
}