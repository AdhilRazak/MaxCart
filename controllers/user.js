const categorydata = require('../model/categorycollection')
const bannerdata = require('../model/bannercollection')
const ProductModel = require('../model/productcollection')
const userdatacollection = require('../model/userdatacollection')
const addressdata = require('../model/addresscollection')
const order = require('../model/ordercollection')
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
                return res.status(401).json({ error: 'Username already exists' });
            }
    
            if (!emailregex.test(email)) {
                return res.status(401).json({ error: 'Invalid email format' });
            }
    
            if (email.split('@')[1] !== 'gmail.com') {
                return res.status(401).json({ error: 'Email must end with gmail.com' });
            }
    
            const emailExist = await userdatacollection.findOne({ email });
            if (emailExist && emailExist._id.toString() !== userId) {
                return res.status(401).json({ error: 'Email already exists' });
            }
    
            if (!phoneregex.test(phone)) {
                return res.status(401).json({ error: 'Phone number must contain 10 digits' });
            }
    
            const phoneExist = await userdatacollection.findOne({ phone });
            if (phoneExist && phoneExist._id.toString() !== userId) {
                return res.status(401).json({ error: 'Phone number already exists' });
            }
    
            const passwordLength = password.length;
            const hasLowerCase = /[a-z]/.test(password);
            const hasUpperCase = /[A-Z]/.test(password);
            const hasDigit = /\d/.test(password);
            
            if (passwordLength < 8 || !hasLowerCase || !hasUpperCase || !hasDigit) {
                const errorMessage = 'Password must contain at least 8 characters, one lowercase letter, one uppercase letter, and one digit';
                return res.status(401).json({ error: errorMessage });
            }
            
    
            const oldPasswordMatch = await bcrypt.compare(oldpasse, userdats.password);
            if (!oldPasswordMatch) {
                return res.status(401).json({ error: 'Old password and entered password do not match' });
            }
    
            if (password !== cpass) {
                return res.status(401).json({ error: 'Password and confirmation password do not match' });
            }
    
            if (!username || !email || !phone || !password || !cpass) {
                return res.status(401).json({ error: 'All details should be filled' });
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);
    
            userdats.username = username;
            userdats.email = email;
            userdats.phone = phone;
            userdats.password = hashedPassword;
    
            await userdats.save();
    
            res.redirect('/userprofile');
        } catch (error) {
            console.error('Error updating user account:', error);
            res.status(500).json({ error: 'Internal error' });
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


    },

    userordercancel: async (req, res) => {

        try {
            const orderid = req.query.id;
            const user = req.query.userid.trim()
            const orders = await order.findById(user)

            if (!orders) {
                return res.status(404).send("Order not found.");
            }

            const orderListItem = orders.orderlist.find(item => item._id.equals(orderid));

            if (!orderListItem) {
                return res.status(404).send("Order list item not found.");
            }

            let state;

            if (orderListItem.status === 'pending' || orderListItem.status === 'completed') {
                orderListItem.status = 'cancelled';
                await orders.save();
                state = true;
            }

            const status = orderListItem.status

            res.status(200).send({ state, status });
        } catch (error) {
            console.error("Error updating delivery:", error);
            res.status(500).send("Internal Server Error.");
        }
    }


}