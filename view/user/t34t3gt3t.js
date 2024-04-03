updateQuantity:async(req,res)=>{

  try {
     const userID = req.session.email?._id
     const userid=new mongoose.Types.ObjectId(userID)
     const productid = req.body.productid;
     const id = new mongoose.Types.ObjectId(productid)
     const qty = req.body.qty;
     const CartData=  await cartSchema.updateOne(
     { userID: userid, "productID.id": id },
     { $set: { "productID.$.quantity": qty } },
       );

     const totalData = await cartSchema.findOne({ userID: userID }).populate('productID.id');

        const subtotal = totalData.productID.reduce((acc, index) => {
            return (acc += index.id.price * index.quantity);
        }, 0);



     res.status(200).json({success:true,message:'quantity updated',Total:subtotal})
   } catch (err) {
     console.log("cart quantity Update", err);
   }

}
