const admindatacollection = require('../model/admindatacollection')

const userdata = require('../model/userdatacollection')

module.exports = {

    admindashboardget: (req, res) => {
        res.render('admin/adminboard')

    },
    
    adminuserlistget:async(req,res)=>{
      const user = await userdata.find({})
      res.render('admin/adminuserlist',{user})
    },

    Blockuser: async (req, res) => {
      try {
          const userID = req.query.id;
          const user = await userdata.findOne({ _id: userID });

          if (!user) {
              return res.status(404).json({ message: "Product not found" });
          }

          let state;

          if (user.otpVerified) {
              await userdata.updateOne({ _id: userID }, { $set: { otpVerified: false } });
              state = false;
          } else {
              await userdata.updateOne({ _id: userID }, { $set: { otpVerified: true } });
              state = true;
          }
          res.json({ state });
      } catch (error) {
          console.error("Error in blocking/unblocking product:", error);
          res.status(500).json({ message: "Internal Server Error" });
      }
  },

}