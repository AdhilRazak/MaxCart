cartGET: async (req, res) => {
   if (req.session.email) {
     try {
       let cartCount;
       const userID = req.session.email._id;
 
       const productview = await cartSchema.findOne({ userID: userID }).populate('productID.id');
       productview ? cartCount = productview.productID.length : cartCount = 0
        
       if (productview && productview.productID) {
         const subtotal = productview.productID.reduce((acc, index) => {
             return (acc += index.id.price * index.quantity);
         }, 0);

         let discountTotal = 0; // Initialize discountTotal here

         discountTotal = productview.productID.reduce((acc, index) => {
             return (acc += index.id.MRP * index.quantity);
         }, 0);

         res.render('UserSide/cart', { productview, subtotal, discountTotal , cartCount});

     } else {
         // Handle the case where productview or productview.productID is null or undefined
         res.render('UserSide/cart', { productview: null, subtotal: 0, discountTotal: 0 , cartCount });
     }
     } catch (error) {
       console.log(error);
     }
   }
 },