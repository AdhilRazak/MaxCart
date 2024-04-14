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
        const result = await orderModel.aggregate([
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
        res.render('admin/adminboard', { products, userDetails, userCount, orderCount, completedCount, totalSubtotal })

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

    orders: async (req, res) => {
        const orders = await orderModel.find({})

        res.render('admin/orders', { orders })
    },

    deliveryupdation: async (req, res) => {
        try {
            const id = req.query.id;
            const user = req.query.userId.trim();

            const orders = await orderModel.findById(user)

            if (!orders) {
                return res.status(404).send("Order not found.");
            }

            const orderListItem = orders.orderlist.find(item => item._id.equals(id));

            if (!orderListItem) {
                return res.status(404).send("Order list item not found.");
            }

            let state
            if (orderListItem.delivery === 'not delivered') {
                orderListItem.delivery = 'delivered';
                await orders.save();
                state = true
            } else if (orderListItem.delivery === 'delivered') {
                orderListItem.delivery = 'not delivered';
                await orders.save();
                state = false

            }

            res.status(200).send(state);
        } catch (error) {
            console.error("Error updating delivery:", error);
            res.status(500).send("Internal Server Error.");
        }
    }


}