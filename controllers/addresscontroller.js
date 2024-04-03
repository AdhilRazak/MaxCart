const userdata = require('../model/userdatacollection')
const addressdata = require('../model/addresscollection')
const { Redirect } = require('twilio/lib/twiml/VoiceResponse');
const { default: mongoose } = require('mongoose');

module.exports = {
    addressget: async (req, res) => {
        try {
            if (req.session.user) {
                const userid = req.session.user;
                const user = await userdata.findById(userid);
                let addressdats = null; // Initialize addressdats variable
    
                // Check if the user has an address
                const addressData = await addressdata.findOne({ user: userid });
                if (addressData) {
                    addressdats = addressData; // Assign address data if it exists
                }
    
                res.render('user/address', { addressdats, user });
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

    editaddressget: async (req, res) => {
        try {
            const addId = req.query.id;
            const user = req.session.user;
            console.log(`lohgftyfgoo${addId}`);

            // Find the address based on the user and address ID
            const address = await addressdata.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(user)
                    }
                },
                {
                    $unwind: "$address" // unwind the address array
                },
                {
                    $match: {
                        "address._id": new mongoose.Types.ObjectId(addId)

                    }
                }

            ]);

            console.log(address);
            if (!address) {
                return res.status(404).json({ error: 'Address not found' });
            }

            res.render('user/editaddress', { address });
        } catch (error) {
            console.error('Error fetching address for editing:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },


    editaddress: async (req, res) => {
        try {
            // Extract address ID from request query
            const addId = req.query.id;
            console.log(`Address ID: ${addId}`);

            // Get user information from session
            const user = req.session.user;
            console.log('User:', user);

            // Extract the locality from the request body
            const { locality, country, district, state, city, houseno, pincode } = req.body;

            // Find the address based on the user and address ID
            const addresses = await addressdata.findOneAndUpdate(
                {
                    user,
                    "address._id": addId
                },
                {
                    $set: {
                        'address.$.locality': locality,
                        'address.$.country': country,
                        'address.$.state': state,
                        'address.$.district': district,
                        'address.$.city': city,
                        'address.$.houseno': houseno,
                        'address.$.pincode': pincode

                    }
                }
            );


            // Check if any addresses were found
            if (addresses.length === 0) {
                // If no address matches the criteria, return a 404 error
                return res.status(404).json({ error: 'Address not found' });
            }



            // Handle the address data as needed (e.g., update it with the new locality)

            // Send a success response
            res.status(200).send('Address updated successfully');
        } catch (error) {
            // If an error occurs, log it and send a 500 Internal Server Error response
            console.error('Error fetching address for editing:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    deleteaddress: async (req, res) => {

        console.log('hou');
        try {
            const addId = req.query.id;
            console.log(`Address ID: ${addId}`);

            // Get user information from session
            const user = req.session.user;
            console.log('User:', user);

            const addresses = await addressdata.findOneAndUpdate(
                {
                    user,
                    "address._id": addId
                },
                {
                    $pull: {
                        'address': { '_id': addId }
                    }
                }
            );

            if (!addresses) {
                return res.status(404).json({ error: "Address not found" });
            }

            // Address successfully deleted
            res.status(200).json({ message: "Address deleted successfully" });
        } catch (error) {
            console.error("Error deleting address:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

}
