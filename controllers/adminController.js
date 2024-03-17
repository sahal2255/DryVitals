const Admin=require('../models/admin')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
require('dotenv').config()


let adminLogin=(req,res)=>{
    res.render('admin/login',{error:''})
}





module.exports={
    adminLogin
}