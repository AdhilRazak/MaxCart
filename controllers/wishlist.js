const Cart = require('../model/cartmodel');
const wish = require('../model/wishlist')

module.exports = {

    addtowishlist: async (req, res) => {
        try {
            if (req.session.user) {
                const userId = req.session.user;
                const productId = req.query.id;
                let state;
                let message;
    
                let wishData = await wish.findOne({ userId: userId });
    
                if (!wishData) {
                    const wishing = new wish({
                        userId: userId,
                        productId: [{ id: productId }]
                    });
                    await wishing.save();
                    state = true;
                    message = "Product added to wishlist.";
                    return res.status(200).json({ success: true, state, message });
                }
    
                const existingProduct = await wish.findOne(
                    { userId: userId, 'productId.id': productId })
                if (existingProduct) {
                    const existWishlist = await wish.findByIdAndUpdate(
                        { _id: wishData._id },
                        { $pull: { productId: { id: productId } } },
                        { new: true }
                    );
                    state = false;
                    message = "Product removed from wishlist.";
                    return res.status(200).json({ success: false, state, message });
                } else {
                    wishData.productId.push({ id: productId });
                    await wishData.save();
                    state = true;
                    message = "Product added to wishlist.";
                    return res.status(200).json({ success: true, state, message });
                }
            } else {
                return res.status(202).json({ success: false, error: 'User not authenticated' });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    },
    
    wishlistget: async (req, res) => {
        try {
            if (req.session.user) {
                const userid = req.session.user;
                let count;
                const wishlist = await wish.findOne({ userId: userid }).populate('productId.id');

                if (wishlist && wishlist.productId) {
                    count = wishlist.productId.length;
                }
                res.render('user/wishlist', { wishlist, count });
            } else {
                res.redirect('/');
            }
        } catch (error) {
            console.error("Error retrieving wishlist:", error);
            res.status(500).render('error', { message: 'An error occurred while retrieving the wishlist. Please try again later.' });
        }
    },
    deletewishlist: async (req, res) => {
        try {
            const userid = req.session.user;
            const productid = req.query.id;

            const wishlist = await wish.updateOne(
                { userId: userid },
                { $pull: { productId: { id: productid } } }
            );

            if (wishlist) {
                const wishexist = await wish.findOne({ userId: userid }).populate('productId.id');
                let count = 0
                if (wishexist && wishexist.productId) {
                    count = wishexist.productId.length;
                }
                res.json({ success: true, count });
            } else {
                res.json({ success: false, message: "Failed to delete product from wishlist" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }





}