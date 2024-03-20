const categorydata = require('../model/categorycollection');

module.exports = {
    categoryget: async (req, res) => {
        try {
            const categoryData = await categorydata.find({});
            res.render('admin/category', { categoryData });
        } catch (error) {
            console.error('Error loading category page:', error);
            res.status(500).json({ message: 'Error in loading category page.' });
        }
    },

    categorypost: async (req, res) => {
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

            res.redirect('/admin/categories'); // Redirect to the categories page after successful creation
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).json({ message: 'Error in creating category.' });
        }
    },
    Editcategoryget: async (req, res) => {
        console.log('haisrdcfghbjm');
        const categoryId = req.query.id; // Adjusted variable name for clarity
        console.log(categoryId);
        try {
            const categoryDats = await categorydata.findById(categoryId);
            if (!categoryDats) {
                // If category data is not found, render an error view or handle it appropriately
                return res.status(404).send("Category not found");
            }
            res.render('admin/editcategory', { categoryDats });
        } catch (error) {
            console.error("Error:", error);
            // Handle the error, perhaps by sending an error response
            res.status(500).send("Internal Server Error");
        }
    },
    editcategorypost: async (req, res) => {
        try {
            const id = req.query.id;
            console.log("Category ID:", id); // Debugging console log
            const { categoryName, subcategoryName } = req.body;
    
            // Assuming categorydata is your model
            const category = await categorydata.findById(id);
    
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
    
            // Update categoryName if provided
            if (categoryName) {
                category.category = categoryName; // Corrected assignment
            }
    
            // Add subcategoryName if provided
            if (subcategoryName) {
                category.subCategory.push(subcategoryName);
            }
    
            // Save the updated category
            await category.save();
    
            res.status(200).json({ message: 'Category updated successfully', category });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    deleteCategory: async (req, res) => {
        console.log('hoooi');
        const categoryID = req.query.id;
        console.log(categoryID);
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

   // In your category controller
subCategorydelete: async (req, res) => {
    try {
      const { categoryId, subcategoryName } = req.query;
  
      // Assuming categorydata is your model
      const category = await categorydata.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
  
      // Remove the subcategory from the category's subCategory array
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
  }
  
}