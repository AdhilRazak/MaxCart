const admindatacollection = require('../model/admindatacollection')

module.exports ={

    adminlogin:(req,res)=>{
        res.render('admin/adminlogin')
    },

    adminloginpost:async(req,res)=>{
      
        const {username,password,secretkey}= req.body

        const userexist = await admindatacollection.findOne({username})

        if(!userexist){
            return res.status(401).send('not an existing admin')
        }

        const passwordog = userexist.password

        if(passwordog !== password){
            return res.status(401).send('password is not correct')
        }

        const scretkeyog = userexist.secretkey
        console.log(scretkeyog);
        if(scretkeyog !== secretkey){
            return res.status(401).send('scret key is wrong')
        }

        res.send('admin he tho ')
    }
}