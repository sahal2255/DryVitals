const Admin = require('../models/admin');
const Product=require('../models/products')
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
    // console.log(email,password);
    if(email&&password){
        try{
            const admin=await Admin.findOne({email})
            // console.log(admin);
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


// get catagory page

let addCatagory=async(req,res)=>{
    res.render('admin/addCatagory',{error:''})
    // console.log('error');
}



// catagory post

// catagory post

let addCatagoryPost = async (req, res) => {
    try {
        let { catagoryName } = req.body;
        if (!req.admin) {
            throw new Error('Admin is not authenticated');
        }


        let product = await Product.findOne();
        if (!product) {
            product = new Product({});
        }

        product.categories.push({ catagoryName: catagoryName });
            await product.save();
            console.log('Category adding success');
        return res.redirect('/admin/catagoryList');

        } catch (error) {
            console.log('addCatagory error:', error);
            return res.render('admin/addCatagory', { error: 'Error adding category' });
    }
};

// let addCatagoryPost = async (req, res) => {
//     try {
//         const { catagoryName } = req.body;

//         if (!req.admin) {
//             throw new Error('Admin is not authenticated');
//         }
//         console.log('check admin ',req.admin);
//         console.log('found admin id',req.admin.id);
//         const admin = await Admin.findByIdAndUpdate(req.admin.id, {
//             $push: { categories: { catagoryName } }
//         });

//         console.log('Admin:', admin);
//         if (!admin) {
//             return res.status(404).json({ error: 'Admin not found' });
//         }

//         console.log('Category added successfully');
//         return res.redirect('/admin/addCatagory');
//     } catch (error) {
//         console.log('addCatagory error:', error);
//         // return res.render('admin/addCatagory', { error: 'Error adding category' });
//         return res.status(500).json({ error: 'Failed to add category' });
//     }
// };



// added catagory listing section

// let catagoryList=async(req,res)=>{
//     res.render('admin/catagoryList',{error:''})
// }


let catagoryList = async (req, res) => {
    try {
        const products = await Product.find({});
        let categories = [];
        products.forEach(product => {
            categories = categories.concat(product.categories);
        });
        res.render('admin/catagoryList', { categories });
    } catch (error) {
        console.log('Error fetching categories:', error);
        res.render('admin/catagoryList', { error: 'Error fetching categories' });
    }
};



// adminController.js



const deleteCategory = async (req, res) => {
    const categoryId = req.params.id;
    console.log(categoryId);
    try {
        let product = await Product.findOne();
        if (!product) {
          return res.status(400).send('product not found');
        }
        product.categories = product.categories.filter(category => category._id.toString() !== categoryId);
        await product.save();
        return res.redirect('/admin/catagoryList');
    } catch (error) {
      console.log('Error deleting category:', error);
      return res.status(500).send('Internal server error');
    }
  };




let editCatagory=async(req,res)=>{
    try{
        let categoryId=req.params.id
        console.log(categoryId);
        let product=await Product.findOne({'categories._id':categoryId})

        // let catagory=product.categories._id(categoryId)
        let catagory=product.categories.find(category=>category._id.toString()===categoryId)

        res.render('admin/editCatagory',{catagory})
    }
    catch(error){
        console.log('not finding catagory');
        res.status(400).send('not find catagory id ')
    }
}


let editCatagoryPost=async(req,res)=>{
    try{
        let categoryId=req.params.id
        console.log(categoryId);

        let product=await Product.findOne({'categories._id':categoryId})
    }
}


// let catagoryEdit = async (req, res) => {
//     try {
//         const categoryId = req.params.id;
//         if (!categoryId) {
//             return res.status(400).send('Category ID not found');
//         }

//         const product = await Product.findOne({ categories: { $elemMatch: { _id: categoryId } } });
//         if (!product) {
//             return res.status(404).send('Product not found');
//         }

//         const editCategory = product.categories.find(category => category._id.toString() === categoryId);
//         if (!editCategory) {
//             return res.status(404).send('Category not found');
//         }

//         res.render('admin/catagoryEdit', { editCategory });
//     } catch (error) {
//         console.log('Error editing category:', error);
//         return res.status(500).send('Internal server error');
//     }
// };




// logout section

let adminLogOut=async(req,res)=>{
    res.clearCookie('admin_jwt')
    console.log('logout success');
    res.redirect('/admin/login')
}


module.exports = {
    adminDash,
    adminLogin,
    adminLoginPost,
    addCatagory,
    addCatagoryPost,
    catagoryList,
    deleteCategory,
    editCatagory,
    adminLogOut
};
