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
                let addressdats = null;

                const addressData = await addressdata.findOne({ user: userid });
                if (addressData) {
                    addressdats = addressData;
                }

                res.render('user/address', { addressdats, user });
            } else {
                res.redirect('/');
            }
        } catch (error) {
            console.error('Error retrieving address data:', error);
            res.status(500).send('Internal Server Error');
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
            const userId = req.session.user;

            const { locality, country, district, state, city, houseno, pincode } = req.body;
            const data = { locality, country, district, state, city, houseno, pincode };

            if (!locality || !country || !district || !state || !city || !houseno || !pincode) {
                return res.status(400).json({ error: 'All details must be filled' });
            }


            try {
                let address = await addressdata.findOne({ user: userId });

                if (!address) {
                    address = new addressdata({ user: userId, address: [data] });
                } else {
                    address.address.push(data);
                }

                await address.save();

                res.redirect('/useraddress')
            } catch (error) {
                console.error('Error adding address:', error);
                res.redirect('/useraddress')
            }
        } else {
            res.status(401).json({ error: 'Unauthorized' });
        }
    },

    editaddressget: async (req, res) => {
        try {
            const addId = req.query.id;
            const user = req.session.user;

            const address = await addressdata.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(user)
                    }
                },
                {
                    $unwind: "$address"
                },
                {
                    $match: {
                        "address._id": new mongoose.Types.ObjectId(addId)

                    }
                }

            ]);

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
            const addId = req.query.id;

            const user = req.session.user;

            const { locality, country, district, state, city, houseno, pincode } = req.body;

            if (!locality || !country || !district || !state || !city || !houseno || !pincode) {
                return res.status(400).json({ error: 'All details must be filled' });
            }

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


            if (addresses.length === 0) {
                return res.status(404).json({ error: 'Address not found' });
            }

            res.redirect('/useraddress')
        } catch (error) {
            console.error('Error fetching address for editing:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    deleteaddress: async (req, res) => {
        try {
            const addId = req.query.id;

            const user = req.session.user;

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

            res.status(200).json({ message: "Address deleted successfully" });
        } catch (error) {
            console.error("Error deleting address:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

}
