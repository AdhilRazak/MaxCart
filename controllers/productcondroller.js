const { json } = require('express');
const CategoryModel = require('../model/categorycollection');
const ProductModel = require('../model/productcollection');
const review = require('../model/review')
const orders = require('../model/ordercollection')
const wish = require('../model/wishlist')
const fs = require('fs')


module.exports = {
    productget: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            const productdat = await ProductModel.find({});
            res.render('admin/product', { productdat });
        } catch (error) {
            console.error('Error in fetching product data:', error);
            res.status(500).json({ message: 'Error in fetching product data' });
        }
    },

    addproductget: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            const categorydata = await CategoryModel.find({});
            res.render('admin/addproduct', { categorydata });
        } catch (error) {
            console.error('Error in fetching category data:', error);
            res.status(500).json({ message: 'Error in fetching category data' });
        }
    },

    addproductspost: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            if (!req.files || req.files.length > 5) {
                return res.status(400).json({ message: "Please provide up to 5 images", success: false });
            }

            const productImages = req.files.map(file => file.filename);
            const { productName, prices, discount, stock, category, subCategory, deliveryDate, description, color, size, title, write } = req.body;

            const disamount = (prices * discount) / 100
            const disprice = prices - disamount
            const newProduct = new ProductModel({
                productName,
                prices,
                discount,
                stock,
                category,
                subCategory,
                deliveryDate,
                description,
                size,
                color,
                title,
                write,
                discounted: disprice,
                productImage: productImages,
            });

            await newProduct.save();
            res.redirect('/admin/product');
        } catch (error) {
            console.error("Error saving data to the database:", error);
            res.status(500).json({ message: "Internal Server Error", success: false });
        }
    },

    blockproductvisibility: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            const proID = req.query.id;
            const product = await ProductModel.findOne({ _id: proID });

            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            let state;

            if (product.status) {
                await ProductModel.updateOne({ _id: proID }, { $set: { status: false } });
                state = false;
            } else {
                await ProductModel.updateOne({ _id: proID }, { $set: { status: true } });
                state = true;
            }

            res.json({ state });
        } catch (error) {
            console.error("Error in blocking/unblocking product:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    producteditget: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            const productId = req.params.id;
            const productData = await ProductModel.findById(productId);
            if (!productData) {
                return res.status(404).json({ message: "Product not found" });
            }
            const categoryData = await CategoryModel.find({});
            res.render('admin/Editproduct', { productData, categoryData });
        } catch (error) {
            console.error('Error in fetching product data:', error);
            res.status(500).json({ message: 'Error in fetching product data' });
        }
    },

    producteditpost: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            const productId = req.params.id;
            const productImages = req.files.map(file => file.filename);
            const { productName, prices, discount, stock, category, subCategory, deliveryDate, description, color, size, title, write } = req.body;

            const disamount = (prices * discount) / 100
            const disprice = prices - disamount

            const productUpdated = await ProductModel.findByIdAndUpdate(
                productId,
                {
                    productName,
                    prices,
                    discount,
                    stock,
                    category,
                    subCategory,
                    deliveryDate,
                    description,
                    size,
                    color,
                    title,
                    write,
                    discounted: disprice,
                    productImage: productImages
                },
                { new: true, upsert: true }
            );

            if (!productUpdated) {
                return res.status(404).json({ message: "Product not found" });
            }

            res.redirect('/admin/product');
        } catch (error) {
            console.error("Error updating product:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },

    productdelete: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            const proID = req.params.id;
            const product = await ProductModel.findOne({ _id: proID });

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            product.productImage.forEach(element => {
                const imagePath = './public/images/' + element;
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });

            await ProductModel.findByIdAndDelete(proID);
            res.status(200).json({ message: true })

        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    userallproducts: async (req, res) => {
        try {
            const searchWord = req.query.search ? req.query.search.toString() : '';

            const product = await ProductModel.find(
                { status: false, productName: { $regex: searchWord, $options: "i" } }
            );

            res.render('user/showallproduct', { product });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },



    filterProduct: async (req, res) => {
        const minimum = req.query.min;
        const maximum = req.query.max;

        try {
            const product = await ProductModel.find({
                prices: { $gte: minimum, $lte: maximum }
            });
            res.render('user/showallproduct', { product });
        } catch (error) {
            console.error("Error filtering products:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    sort: async (req, res) => {
        const sortvalue = JSON.parse(req.query.sort)
        try {
            const product = await ProductModel.find().sort({ prices: sortvalue })
            res.render('user/showallproduct', { product })
        } catch (error) {
            console.error("Error filtering products:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    viewsingleproducts: async (req, res) => {
        try {
            const productid = req.query.id;
            let isWishlist, proreview = ''


            proreview = await review.findOne({ productId: productid })


            const product = await ProductModel.findById(productid);

            if (!product) {
                return res.status(404).send("Product not found");
            }

            if (req.session.user) {
                const userid = req.session.user;
                isWishlist = false


                const wishlist = await wish.findOne({ userId: userid });


                if (wishlist) {
                    const existingProduct = await wish.findOne(
                        { userId: userid, 'productId.id': productid }
                    );
                    if (existingProduct) {
                        isWishlist = true
                    }
                }
            }
            res.render('user/viewsinglecart', { product, isWishlist, proreview });

        } catch (error) {
            console.error("Error occurred in viewsingleproducts:", error);
            res.status(500).send("Internal Server Error");
        }
    },

    reviewget: async (req, res) => {
        if (!req.session.user) {
            return res.redirect('/');
        }

        const userId = req.session.user;
        const productId = req.query.id;
        const ordId = req.query.ordid;

        try {
            const order = await orders.findOne({ userId: userId });

            if (!order) {
                return res.status(404).send("Order not found.");
            }

            const orderListItem = order.orderlist.find(item => item._id.equals(ordId));

            if (!orderListItem) {
                return res.status(404).send("Order list item not found.");
            }

            if (orderListItem.status == 'cancelled') {
                return res.status(404).send("You are not able to review on this product.");
            }

            const productExist = orderListItem.productId.some(product => product.id.equals(productId));

            if (!productExist) {
                return res.status(404).send("Product ID does not match.");
            }

            const product = await ProductModel.findById(productId);

            res.render('user/review', { product });
        } catch (err) {
            console.error("Error:", err);
            return res.status(500).send("Internal Server Error");
        }
    },


    reviewpost: async (req, res) => {
        if (!req.session.user) {
            return res.redirect('/');
        }
        const { rating, description, title } = req.body;
        const userId = req.session.user;
        const productId = req.query.id;

        try {

            let productReview = await review.findOne({ productId: productId })



            if (!productReview) {
                const newReview = new review({
                    productId: productId,
                    reviews: [{
                        userId: userId,
                        rating: rating,
                        title: title,
                        comment: description
                    }]
                });
                await newReview.save();
                res.redirect('/orderlist')
            } else {
                productReview.reviews.push({
                    userId: userId,
                    rating: rating,
                    title: title,
                    comment: description
                });
                await productReview.save();
                res.redirect('/orderlist')
            }
        } catch (error) {
            return res.status(500).json(error);
        }

    }




};
