const admindatacollection = require('../model/admindatacollection')

const userdata = require('../model/userdatacollection')
const productModel = require('../model/productcollection')
const orderModel = require('../model/ordercollection')

module.exports = {

    admindashboardget: async (req, res) => {
        const products = await productModel.find()
        const userDetails = await userdata.find()
        userCount = await userdata.countDocuments()
        totalOrders = await orderModel.find()
        let orderCount = 0;
        let totalSubtotal = 0;

        totalOrders.forEach(order => {
            orderCount += order.orderlist.length;
            order.orderlist.forEach(item => {
                totalSubtotal += parseFloat(item.subtotal);
            });
        });
        let completedCount = 0;
        const result =await orderModel.aggregate([
            {
                $unwind: "$orderlist"
            },
            {
                $match: {
                    "orderlist.status": "completed"
                }
            },
            {
                $count: "completedCount"
            }
        ])
        completedCount = result.length > 0 ? result[0].completedCount : 0;
        console.log(completedCount)
        res.render('admin/adminboard', { products, userDetails, userCount, orderCount, completedCount,totalSubtotal })

    },

    adminuserlistget: async (req, res) => {
        const user = await userdata.find({})
        res.render('admin/adminuserlist', { user })
    },

    Blockuser: async (req, res) => {
        try {
            const userID = req.query.id;
            const user = await userdata.findOne({ _id: userID });

            if (!user) {
                return res.status(404).json({ message: "Product not found" });
            }

            let state;

            if (user.otpVerified) {
                await userdata.updateOne({ _id: userID }, { $set: { otpVerified: false } });
                state = false;
            } else {
                await userdata.updateOne({ _id: userID }, { $set: { otpVerified: true } });
                state = true;
            }
            res.json({ state });
        } catch (error) {
            console.error("Error in blocking/unblocking product:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

}