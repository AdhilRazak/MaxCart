const buyone = require('../model/singleproductbuy')
const product = require('../model/productcollection')
const cart = require('../model/cartmodel')
const { Types } = require('mongoose');


module.exports = {
    buyoneget: async (req, res) => {
        try {
            if (req.session.user) {

                const productid = req.query.id
                req.session.buy = false


                const productexist = await product.findOne({ _id: productid })
                if (!productexist) {
                    return res.status(404).json({ success: false, error: "Product not found" });
                }

                res.render('user/buyone', { productexist })
            } else {
                res.redirect('/')

            }
        }
        catch (error) {
            console.error(error);
        }
    },

    buyoneupdate: async (req, res) => {
        try {
            if (req.session.user) {
                // Extracting userid, productid, and quantity from request
                const userid = req.session.user;
                const productid = req.body.id;
                const quantity = req.body.qty;

                let subtotal, discountTotal, total

                // Validate input data
                if (!quantity) {
                    return res.status(400).json({ error: "Quantity is required" });
                }

                req.session.buy = true


                console.log(req.session.buy);
                // Attempt to find existing purchase data for the user
                const buydata = await buyone.findOne({ userId: userid }).populate('productId.id');

                if (buydata) {
                    // Check if the product already exists in the user's cart
                    const exitbuy = await buyone.findOne({ userId: userid, 'productId.id': productid });

                    if (exitbuy) {
                        // Update the quantity of the existing product in the cart
                        await buyone.updateOne(
                            { userId: userid, 'productId.id': productid },
                            { $set: { 'productId.$.quantity': quantity } }
                        );

                        // Calculate total price based on products in the cart and update the total price
                        const buyingprice = await product.findById(productid)

                        if (buyingprice) {

                            subtotal = buyingprice.prices * quantity

                            discountTotal = buyingprice.discount * quantity

                            total = subtotal - discountTotal;

                            await buyone.updateOne(
                                { userId: userid },
                                { total: total }
                            );
                        }
                        return res.status(200).json({ success: true, message: "Document updated successfully", subtotal, discountTotal, total });

                    } else {
                        await buyone.updateOne(
                            { userId: userid },
                            { $push: { productId: { id: productid, quantity: quantity } } }
                        );
                    }
                } else {
                    // Create a new document with user ID and product ID and quantity
                    const cartData = new buyone({ userId: userid, productId: [{ id: productid, quantity: quantity }] });
                    await cartData.save();
                    return res.status(200).json({ success: true, message: "New document created successfully" });
                }
            } else {
                res.redirect('/')
            }

        } catch (error) {
            // Catch and log errors
            console.error("Error in buyoneupdate:", error);
            // Send a 500 Internal Server Error status code and an error message as JSON response
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    checkoutget: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: "User session not found. Please log in." });
            }
    
            const userId = req.session.user;
            let total = 0;
            let subtotal = 0;
            let discountTotal = 0;
    
            const id = req.params.id;
    
            if (id === 'cart') {
                const carts = await cart.findOne({ userId }).populate('productId.id');
    
                if (!carts) {
                    return res.status(400).json({ error: "Cart not found" });
                }
    
                total = carts.total;
            } else if (req.session.buy === true && id) {
                const buy = await buyone.findOne({ userId }).populate('productId.id');
    
                if (!buy) {
                    return res.status(400).json({ error: "Product not found" });
                }
    
                const buyingPrice = await product.findById(id);
    
                if (!buyingPrice) {
                    return res.status(400).json({ error: "Product not found" });
                }
                subtotal = buyingPrice.prices * buy.quantity;
                    discountTotal = buyingPrice.discount * buy.quantity;
                    total = subtotal - discountTotal; // Adjust total based on discounts
            } else {
                log('dshjch')
                const buyer = await product.findById(id);
                if (!buyer) {
                    return res.status(400).json({ error: "Product not found" });
                }
                subtotal = buyer.prices;
                console.log(subtotal);
                discountTotal = buyer.discount;
                total = subtotal - discountTotal; // Adjust total based on discounts
            }
    
            return res.render('user/checkout', { total, subtotal, discountTotal });
        } catch (error) {
            console.error("Error in checkoutget:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    

}



