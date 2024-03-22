const Admin = require('../models/admin');
const Product=require('../models/products')
const bcrypt = require('bcrypt');
const { application } = require('express')
const cloudinary=require('../config/cloudinary')
const jwt = require('jsonwebtoken');
const fs=require('fs')
const path=require('path')

// const cloudinary=require('../config/cloudinary')
const upload=require('../config/multer')
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

let addCatagoryPost = async (req, res) => {
    try {
        let { catagoryName } = req.body;
        if (!req.admin) {
            throw new Error('Admin is not authenticated');
        }


        let product = await Admin.findOne();
        if (!product) {
            product = new Admin({});
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
    
// catagory list


let catagoryList = async (req, res) => {
    try {
        const products = await Admin.find({});
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
        let product = await Admin.findOne();
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
        let product=await Admin.findOne({'categories._id':categoryId})

        // let catagory=product.categories._id(categoryId)
        let catagory=product.categories.find(category=>category._id.toString()===categoryId)

        res.render('admin/editCatagory',{catagory})
    }
    catch(error){
        console.log('not finding catagory');
        res.status(400).send('not find catagory id ')
    }
}


let editCatagoryPost = async (req, res) => {
    try {
        let categoryId = req.params.id;
        // console.log(categoryId);
        let newName = req.body.editCatagoryName;

        let product = await Admin.findOne({ 'categories._id': categoryId });
        // console.log(product);
        
        if (!product) {
            console.log('Product not found');
            return res.status(404).send('Product not found');
        }

        let category = product.categories.id(categoryId);
        if (!category) {
            console.log('Category not found in product');
            return res.status(404).send('Category not found in product');
        }

        category.catagoryName = newName;
        await product.save();
        return res.redirect('/admin/catagoryList');
    } catch (error) {
        console.log('Error updating category:', error);
        return res.status(500).send('Internal server error');
    }
};




// let addProduct=async(req,res)=>{
//     res.render('admin/addProduct',{error:' '})
// }


let addProduct = async (req, res) => {
    try {
        const products = await Admin.find({});
        let categories = [];
        products.forEach(product => {
            categories = categories.concat(product.categories);
        });
        res.render('admin/addProduct', { categories, error: ' ' });
    } catch (error) {
        console.log('Error fetching categories:', error);
        res.render('admin/addProduct', { error: 'Error fetching categories' });
    }
};




// adding product details on the database

let addProductPost = async (req, res) => {
    try {
        const { productName, category, description, variant, price } = req.body;
        const image = req.files; // Access uploaded files via req.files
        console.log("req.files :",image);  
        const imageUrl = []; 

        // Upload each image to Cloudinary and collect their URLs
        // await Promise.all(image.map(async (image) => {
        //     const result = await cloudinary.uploader.upload(image.path);
        //     imageUrl.push(result.secure_url);
        // }));
        for (const file of image) {
            const result = await cloudinary.uploader.upload(file.path);
            imageUrl.push(result.secure_url);
          }
          console.log(imageUrl);
        // Create a new product instance with the collected image URLs
        const newProduct = new Product({
            productName,
            category,
            description,
            variant,
            price,
            imageUrl: imageUrl,
            // imageUrl: imageUrl.map((url) => url)
        });
        // console.log(imageUrl);
        // console.log(newProduct);

        // Save the new product to the database
        await newProduct.save();
        console.log('image upload successfully');
        res.status(201).json({ message: 'Image uploaded successfully' });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Error uploading image' });
    }
};





// const addProductPost = async (req, res) => {
//     try {
//         console.log('req file',req.file);
//         const result = await cloudinary.uploader.upload(req.file.path);
//         console.log('Cloudinary upload result:', result); 
//         const { productName, category, description, variant, price } = req.body;

//         const newProduct = new Product({
//             productName,
//             category,
//             description,
//             variant,
//             price,
//             // imageUrl: result.secure_url
//         });

//         // Save the new product to the database
//         await newProduct.save();

//         res.status(201).json({ message: 'Product added successfully' });
//     } catch (error) {
//         console.error('Error adding product:', error);
//         res.status(500).json({ message: 'Error adding product' });
//     }
// };


let productList=async(req,res)=>{
    res.redirect('/admin/productList')
}




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
    editCatagoryPost,
    addProduct,
    addProductPost,
    productList,
    adminLogOut
};
