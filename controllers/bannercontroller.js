const bannerdata = require('../model/bannercollection')

module.exports = {
    bannerget: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        const banner = await bannerdata.find({})
        res.render('admin/banners', { banner })
    },

    addbannerget: (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        res.render('admin/addbanner')
    },

    addbannerpost: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ message: "Please provide at least one image", success: false });
            }

            const images = req.files.map(file => file.filename);
            const { name, title, offer } = req.body;

            const newBanner = new bannerdata({
                name,
                title,
                offer,
                image: images,
            });

            await newBanner.save();
            res.redirect('/admin/product');
        } catch (error) {
            console.error("Error saving data to the database:", error);
            res.status(500).json({ message: "Internal Server Error", success: false });
        }
    },



    bannerdelete: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            const deleteid = req.query.id;

            const deletedBanner = await bannerdata.findByIdAndDelete(deleteid);

            if (!deletedBanner) {
                return res.status(404).json({ message: "Banner not found" });
            }

            res.status(200).json({ success: true, message: ' deleted successfully' });
        } catch (error) {
            console.error("Error deleting banner:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    editbannerget: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            const id = req.query.id
            const existingbanner = await bannerdata.findById(id)
            if (!existingbanner || existingbanner.length === 0) {
                throw new Error("No banners found");
            }
            res.render('admin/editbanner', { existingbanner });
        } catch (error) {
            console.error("Error fetching banners for editing:", error);
            res.status(500).json({ message: "Internal Server Error", success: false });
        }
    },

    editbannerpost: async (req, res) => {
        if(!req.session.admin){
            return res.redirect('/admin')
        }
        try {
            if (!req.file) {
                return res.status(400).json({ message: "Please provide an image", success: false });
            }

            const editid = req.query.id;
            const image = req.file.filename;
            const { name, title, offer } = req.body;

            const editdata = await bannerdata.findById(editid);

            if (!editdata) {
                return res.status(404).json({ message: 'Banner not found' });
            }

            editdata.name = name;
            editdata.title = title;
            editdata.offer = offer;
            editdata.image = image;

            await editdata.save();

            res.status(200).json({ message: "Banner updated successfully", success: true });
        } catch (error) {
            console.error("Error editing banner:", error);
            res.status(500).json({ message: "Internal server error", success: false });
        }
    }

}


