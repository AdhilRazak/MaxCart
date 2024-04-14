const categorydata = require('../model/categorycollection');
const ProductModel = require('../model/productcollection');

module.exports = {
    categoryget: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            const categoryData = await categorydata.find({});
            res.render('admin/category', { categoryData });
        } catch (error) {
            console.error('Error loading category page:', error);
            res.status(500).json({ message: 'Error in loading category page.' });
        }
    },

    categorypost: async (req, res) => {
         if(!req.session.admin){
            return res.redirect('/admin')
        }
        const { categoryName, subcategoryName } = req.body;

        try {
            let category = await categorydata.findOne({ category: categoryName });

            if (!category) {
                category = new categorydata({
                    category: categoryName,
                    subCategory: [subcategoryName]
                });
            } else {
                res.status(500).send('category already exist you can edit it')
            }
            await category.save();

            res.redirect('/admin/categories');
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).json({ message: 'Error in creating category.' });
        }
    },
    Editcategoryget: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        const categoryId = req.query.id;
        try {
            const categoryDats = await categorydata.findById(categoryId);
            if (!categoryDats) {
                return res.status(404).send("Category not found");
            }
            res.render('admin/editcategory', { categoryDats });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    editcategorypost: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            const id = req.query.id;
            const { categoryName, subcategoryName } = req.body;

            const category = await categorydata.findById(id);

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            if (categoryName) {
                category.category = categoryName;
            }

            if (subcategoryName) {
                category.subCategory.push(subcategoryName);
            }

            await category.save();

            res.status(200).json({ message: 'Category updated successfully', category });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    deleteCategory: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        const categoryID = req.query.id;
        try {
            const deletedCategory = await categorydata.findByIdAndDelete(categoryID);
            if (!deletedCategory) {
                return res.status(404).send('Category not found');
            }
            res.status(200).json({ success: true, message: 'Category deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error in deleting category' });
        }
    },

    subCategorydelete: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            const { categoryId, subcategoryName } = req.query;

            const category = await categorydata.findById(categoryId);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            const index = category.subCategory.indexOf(subcategoryName);
            if (index !== -1) {
                category.subCategory.splice(index, 1);
                await category.save();
                return res.status(200).json({ success: true, message: 'Subcategory deleted successfully' });
            } else {
                return res.status(404).json({ error: 'Subcategory not found in the category' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    categoryfilterget: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            const category = req.query.category;
            const product = await ProductModel.find({ category: category, status: false });
            res.render('user/showallproduct', { product });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }

}