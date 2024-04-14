const categorydata = require('../model/categorycollection')
const bannerdata = require('../model/bannercollection')
const ProductModel = require('../model/productcollection')
const userdatacollection = require('../model/userdatacollection')
const addressdata = require('../model/addresscollection')
const { Redirect } = require('twilio/lib/twiml/VoiceResponse')
const passwordregex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/;
const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneregex = /^\d{10}$/;
const bcrypt = require('bcrypt');


module.exports = {
    userhomeget: async (req, res) => {
        const banner = await bannerdata.find({})
        const category = await categorydata.find({})
        const product = await ProductModel.find({ status: false }).limit(4)
        res.render('user/userhome', { banner, category, product })
    },

    useraccountget: async (req, res) => {
        try {
            const userID = req.session.user;

            if (!userID) {
                return res.redirect('/');
            }

            const userdata = await userdatacollection.findById(userID);
            let addr = null;

            const addres = await addressdata.findOne({ user: userID });
            if (addres && addres.address.length > 0) {
                addr = addres.address[0];
            }

            if (!userdata) {
                return res.status(404).send('User data not found');
            }

            res.render('user/userprofile', { userdata, addr });

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
            const user = await userdatacollection.findById(userID);
            if (!user) {
                return res.status(404).send('User not found');
            }

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

            const userdats = await userdatacollection.findById(userId);

            const existuser = await userdatacollection.findOne({ username });
            if (existuser && existuser._id.toString() !== userId) {
                return res.status(401).send('Username already exists');
            }

            if (!emailregex.test(email)) {
                return res.status(401).send('Invalid email format');
            }

            if (email.split('@')[1] !== 'gmail.com') {
                return res.status(401).send('Email must end with gmail.com');
            }

            const emailExist = await userdatacollection.findOne({ email });
            if (emailExist && emailExist._id.toString() !== userId) {
                return res.status(401).send('Email already exists');
            }

            if (!phoneregex.test(phone)) {
                return res.status(401).send('Phone number must contain 10 digits');
            }

            const phoneExist = await userdatacollection.findOne({ phone });
            if (phoneExist && phoneExist._id.toString() !== userId) {
                return res.status(401).send('Phone number already exists');
            }

            if (!passwordregex.test(password)) {
                return res.status(401).send('Password must contain at least 8 characters, one lowercase letter, one uppercase letter, and one digit');
            }

            const oldPasswordMatch = await bcrypt.compare(oldpasse, userdats.password);
            if (!oldPasswordMatch) {
                return res.status(401).send('Old password and entered password do not match');
            }

            if (password !== cpass) {
                return res.status(401).send('Password and confirmation password do not match');
            }

            if (!username || !email || !phone || !password || !cpass) {
                return res.status(401).send('All details should be filled');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            userdats.username = username;
            userdats.email = email;
            userdats.phone = phone;
            userdats.password = hashedPassword;

            await userdats.save();

            res.send('User data updated successfully');
        } catch (error) {
            console.error('Error updating user account:', error);
            res.status(500).send('Internal error');
        }
    },

    logout: (req, res) => {
        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).send("Internal Server Error");
            }
            res.redirect('/');
        });


    }

}