const Cart = require('../model/cartmodel');

module.exports = {
    addtocart: async (req, res) => {
        try {
            if (req.session.user) {
                const userId = req.session.user;
                const productId = req.query.id;
                console.log(userId);
                console.log(productId);

                // Find the cart for the current user
                let cartData = await Cart.findOne({ userId });

                // If the cart doesn't exist, create a new one
                if (!cartData) {
                    cartData = new Cart({ userId, productId: [{ id: productId, quantity: 1 }] });
                    await cartData.save();
                    return res.json({ success: true, count: 1 });
                }

                // Check if the product already exists in the cart
                const existingProduct = cartData.productId.find(product => product.id.equals(productId));

                if (existingProduct) {
                    // If the product exists, increment its quantity
                    existingProduct.quantity += 1;
                } else {
                    // If the product doesn't exist, add it to the cart
                    cartData.productId.push({ id: productId, quantity: 1 });
                }

                // Save the updated cart
                await cartData.save();
                return res.status(200).json({ success: true, count: cartData.productId.length });
            } else {
                 return res.status(202).json({ success: false });

            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    },

    showcart: async (req, res) => {
        try {
            if (req.session.user) {
                const userid = req.session.user;
                const cartdetail = await Cart.findOne({ userId: userid }).populate('productId.id');
                let cartCount = 0;
    
                if (cartdetail && cartdetail.productId) {
                    cartCount = cartdetail.productId.length;
                  
    
                    const subtotal = cartdetail.productId.reduce((acc, index) => {
                        return (acc += index.id.prices * index.quantity);
                    }, 0);

    
                    const discountTotal = cartdetail.productId.reduce((acc, index) => {
                        return (acc += index.id.discount * index.quantity);
                    }, 0);

                    const total = subtotal-discountTotal
    
                    res.render('user/cart', { cartdetail, subtotal, discountTotal,total, cartCount });
                } else {
                    res.render('user/cart', { cartdetail: null, subtotal: 0, discountTotal: 0,total:0, cartCount });
                }
            } else {
                res.redirect('/');
            }
        } catch (error) {
            console.error('Error in showcart:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    updatecartquantity: async (req, res) => {
        try {
            const userId = req.session.user;
    
            const productId = req.body.proid;
    
            const quantity = req.body.qty;

    
            const cartdata = await Cart.updateOne(
                { userId: userId, 'productId.id': productId },
                { $set: { 'productId.$.quantity': quantity } }
            );
    
            if (!cartdata) {
                return res.status(404).json({ success: false, message: 'Cart not found' });
            }
    
            const cartdetail = await Cart.findOne({ userId: userId }).populate('productId.id');
    
            if (cartdetail && cartdetail.productId) {

                const subtotal = cartdetail.productId.reduce((acc, item) => {
                    return acc + (item.id.prices * item.quantity);
                }, 0);
                
                const discountTotal = cartdetail.productId.reduce((acc, index) => {
                    return (acc += index.id.discount * index.quantity);
                }, 0);

             const total = subtotal-discountTotal

             const cart = await Cart.updateOne(
                { userId: userId },
                { total:total }
            );
           
                return res.status(200).json({ success: true, message: 'Quantity updated', subtotal,discountTotal,total });
            } else {
                return res.status(404).json({ success: false, message: 'Cart not found' });
            }
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    cartdelete:async (req, res) => {
        try {
            const userId = req.session.user;
            const productId = req.query.id;
    
            // Remove the specified product from the user's cart
            await Cart.updateOne(
                { userId: userId },
                { $pull: { productId: { id: productId } } }
            );
    
            // Retrieve updated cart details
            const cartdetail = await Cart.findOne({ userId: userId }).populate('productId.id');
    
            let cartCount = 0;
            let subtotal = 0;
            let discountTotal = 0;
            let total = 0;
    
            if (cartdetail && cartdetail.productId) {
                // Calculate cart count
                cartCount = cartdetail.productId.length;
    
                // Calculate subtotal and discount total
                subtotal = cartdetail.productId.reduce((acc, item) => {
                    return acc + (item.id.prices * item.quantity);
                }, 0);
                
                discountTotal = cartdetail.productId.reduce((acc, index) => {
                    return (acc += index.id.discount * index.quantity);
                }, 0);
    
                // Calculate total after discounts
                total = subtotal - discountTotal;
            }
    
            // Respond with updated cart details
            res.status(200).json({
                message: "Product deleted from cart successfully",cartCount,subtotal,discountTotal,total});
        } catch (err) {
            console.error("Error deleting product from cart:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    
    
    
    
    
};
