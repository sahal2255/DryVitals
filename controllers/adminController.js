const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const { application } = require('express')
const jwt = require('jsonwebtoken');
// const admin = require('../models/admin');
require('dotenv').config();




// admin dashboard

let adminDash=async(req,res)=>{
    console.log("req.admin :",req.admin);
    res.render('admin/index',{admin:req.admin});
}




// Admin login page
const adminLogin = (req, res) => {
    res.render('admin/login', { error: '' });
};




// login post section

let adminLoginPost=async(req,res)=>{
    const {email,password}=req.body;
    console.log(email,password);
    if(email&&password){
        try{
            const admin=await Admin.findOne({email})
            console.log(admin);
            if (!admin){
                return res.status(400).send({error:'admin is not found'})
            }
            if(password!=admin.password){
                return res.status(400).send({error:'password not matching'})
            }else{

                const token=jwt.sign(
                    {
                        id:admin._id,
                        email:admin.email
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn:"24h"
                    }
                );
                res.cookie('admin_jwt',token,{httpOnly:true,maxAge:86400000})
                    
                console.log('admin logged woth email and password');
                return res.redirect('/admin/index')
            }
        }
        
        catch(error){
        console.log('this is admin error');
        return res.status(500).json({ error: "Internal server error" });
    }
    
    }
    else{
        return res.render('admin/login',{error:'please complete the details'})
    }

}


// profilepage

let profile=async(req,res)=>{
    let adminId=req.admin.id;
    let admin= await Admin.findOne({_id:adminId})
    console.log(admin);
    if(!admin){
        return res.status(400).send('admin not found')
    }
    return res.render('/admin/adminProfile')
}

// let profile = async (req, res) => {
//     try {
//         let adminId = req.admin.id; // Assuming your admin ID is stored in 'id' field
//         let foundAdmin = await Admin.findOne({ _id: adminId }); // Renamed variable to 'foundAdmin'
//         console.log('Admin:', foundAdmin);
//         if (!foundAdmin) {
//             return res.status(400).send('Admin not found');
//         }
//         // Render the admin profile page
//         return res.render('admin/adminProfile', { admin: foundAdmin }); // Passing 'foundAdmin' data to the profile page
//     } catch (error) {
//         console.error('Error fetching admin profile:', error);
//         return res.status(500).send('Internal server error');
//     }
// }



let adminLogOut=async(req,res)=>{
    res.clearCookie('admin_jwt')
    console.log('logout success');
    res.redirect('/admin/login')
}


module.exports = {
    adminDash,
    adminLogin,
    adminLoginPost,
    profile,
    adminLogOut
};
