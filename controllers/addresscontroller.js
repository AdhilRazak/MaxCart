const userdata = require('../model/userdatacollection')
const addressdata = require('../model/addresscollection')
const { Redirect } = require('twilio/lib/twiml/VoiceResponse')

module.exports = {
    addressget: async (req, res) => {
        try {
            if (req.session.user) {
                const userid = req.session.user;
                const addressdats = await addressdata.findOne({user:userid});
                const user = await userdata.findById(userid)
                res.render('user/address', { addressdats,user});
                console.log(addressdats);
            } else {
                res.redirect('/');
            }
        } catch (error) {
            console.error('Error retrieving address data:', error);
            res.status(500).send('Internal Server Error'); // Sending a generic error response
        }
    },

    addaddressget: async (req, res) => {
        try {
            if (req.session.user) {
                res.render('user/addaddress');
            } else {
                res.redirect('/');
            }
        } catch (error) {
            console.error('Error rendering add address page:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    addaddresspost: async (req, res) => {
        if (req.session.user) {
            const userId = req.session.user; // Assuming req.session.user contains the user ID
            const { locality, country, district, state, city, houseno, pincode } = req.body;
            const data = { locality, country, district, state, city, houseno, pincode };

            try {
                // Find the address data for the user
                let address = await addressdata.findOne({ user: userId });

                if (!address) {
                    // If user's address data doesn't exist, create a new one
                    address = new addressdata({ user: userId, address: [data] });
                } else {
                    // If user's address data exists, push the new address data into the existing array
                    address.address.push(data);
                }

                // Save the updated address data
                await address.save();

                // Respond with success
                res.status(200).json({ message: 'Address added successfully' });
            } catch (error) {
                // Handle any errors that occur during the process
                console.error('Error adding address:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        } else {
            // If user is not logged in, respond with unauthorized status
            res.status(401).json({ error: 'Unauthorized' });
        }
    },

    editaddress:async(req,res)=>{
        
    }

}