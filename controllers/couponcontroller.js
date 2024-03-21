const coupondata = require('../model/couponcollection')

module.exports = {
    couponget: async (req, res) => {
        try {
            const coupon = await coupondata.find({})
            res.render('admin/coupon', { coupon })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },

    addcouponget: (req, res) => {
        res.render('admin/addcoupon')
    },

    addcouponpost: async (req, res) => {
        try {
            const { couponCode, discount, MinOrderAmount, MaxOrderAmount } = req.body

            const coupondats = new coupondata({
                couponCode,
                discount,
                MinOrderAmount,
                MaxOrderAmount
            })

            await coupondats.save()

            res.redirect('/admin/dashboard')
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    },
    editcoupenget: async (req, res) => {
        try {
            const couponId = req.query.id;
            const existingCoupon = await coupondata.findById(couponId);
            if (!existingCoupon) {
                return res.status(404).json({ message: 'Coupon not found' });
            }
            res.render('admin/editcoupon', { existingCoupon });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    editCouponPost: async (req, res) => {
        try {
            const { couponCode, discount, MinOrderAmount, MaxOrderAmount } = req.body;
            const couponId = req.query.id; // Retrieve coupon ID from query parameters
            const existingCoupon = await coupondata.findById(couponId);

            if (!existingCoupon) {
                return res.status(404).json({ message: 'Coupon not found' });
            }

            // Update the coupon data with new values
            existingCoupon.couponCode = couponCode;
            existingCoupon.discount = discount;
            existingCoupon.MinOrderAmount = MinOrderAmount;
            existingCoupon.MaxOrderAmount = MaxOrderAmount;

            // Save the updated coupon
            await existingCoupon.save();

            res.status(200).json({ message: 'Coupon updated successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteCoupon:async (req, res) => {
        try {
            const couponId = req.query.id;
            const deletedCoupon = await coupondata.findByIdAndDelete(couponId);
            if (!deletedCoupon) {
                return res.status(404).json({ success: false, message: 'Coupon not found' });
            }
            res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }



}
