const categorydata = require('../model/categorycollection');

module.exports = {
    categoryget: async (req, res) => {
        try {
            const categories = await categorydata.find({});
            res.render('admin/category', { categories });
        } catch (error) {
            console.error('Error loading category page:', error);
            res.status(500).json({ message: 'Error in loading category page.' });
        }
    },

    categorypost: async (req, res) => {
        const { categoryName, subcategoryName } = req.body;

        try {
            let category = await categorydata.findOne();

            if (!category) {
                category = new categorydata({
                    category: categoryName,
                    subCategory: [subcategoryName]
                });
            } else if (!category.subCategory.includes(subcategoryName)) {
                category.subCategory.push(subcategoryName);
            }

            await category.save();

            res.redirect('/admin/categories'); // Redirect to the categories page after successful creation
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).json({ message: 'Error in creating category.' });
        }
    }
};
