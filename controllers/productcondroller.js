const CategoryModel = require('../model/categorycollection');
const ProductModel = require('../model/productcollection');
const fs = require('fs')

module.exports = {
    productget: async (req, res) => {
        try {
            const productdat = await ProductModel.find({});
            res.render('admin/product', { productdat }); // Pass productData to the template
        } catch (error) {
            console.error('Error in fetching product data:', error);
            res.status(500).json({ message: 'Error in fetching product data' });
        }
    },

    addproductget: async (req, res) => {
        try {
            const categorydata = await CategoryModel.find({});
            res.render('admin/addproduct', { categorydata });
        } catch (error) {
            console.error('Error in fetching category data:', error);
            res.status(500).json({ message: 'Error in fetching category data' });
        }
    },

    addproductspost: async (req, res) => {
        try {
            if (!req.files || req.files.length > 5) {
                return res.status(400).json({ message: "Please provide up to 5 images", success: false });
            }

            const productImages = req.files.map(file => file.filename);
            const { productName, prices, discount, stock, category, subCategory, deliveryDate, description, color, size,title,write} = req.body;

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
        try {
            const productId = req.params.id;
            const productImages = req.files.map(file => file.filename);
            const { productName, prices, discount, stock, category, subCategory, deliveryDate, description, color, size ,title,write} = req.body;

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
        const product = await ProductModel.find({ status: false })
        res.render('user/showallproduct', { product })
    },
    viewsingleproducts: async (req, res) => {
        try {
            const productid = req.query.id;
            const product = await ProductModel.findById(productid);
            
            if (!product) {
                // If product is not found, handle the error accordingly
                return res.status(404).send("Product not found");
            }
            console.log(product);
            
            res.render('user/viewsinglecart', { product});
        } catch (error) {
            // Handle any other errors that might occur during execution
            console.error("Error occurred in viewsingleproducts:", error);
            res.status(500).send("Internal Server Error");
        }
    }
    

};
