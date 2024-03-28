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





let addProduct = async (req, res) => {
    // console.log('products');
    try {
        const products = await Admin.find({});
        let categories = [];
        products.forEach(product => {
            categories = categories.concat(product.categories);
        });
        // console.log(categories);
        res.render('admin/addProduct', { categories, error: ' ' });
    } catch (error) {
        console.log('Error fetching categories:', error);
        res.render('admin/addProduct', { error: 'Error fetching categories' });
    }
};




// adding product details on the database

// let addProductPost = async (req, res) => {
//     try {
//         const { productName, category, description, variant, price,stock } = req.body;
//         const image = req.files; // Access uploaded files via req.files
//         console.log("req.files :",image);  
//         const imageUrl = []; 

        
//         for (const file of image) {
//             const result = await cloudinary.uploader.upload(file.path);
//             imageUrl.push(result.secure_url);
//           }
//           console.log(imageUrl);
//             const newProduct = new Product({
//             productName,
//             category,
//             description,
//             variant,
//             price,
//             stock,
//             imageUrl: imageUrl,
            
//         });
//         // console.log(imageUrl);
//         // console.log(newProduct);
//         await newProduct.save();
//         console.log('Product added successfully');
//         res.redirect('/admin/productList')
//         // res.status(201).json({ message: 'Image uploaded successfully' });
//     } catch (error) {
//         console.error('Error uploading image:', error);
//         res.status(500).render('admin/addProduct', { error: 'Error adding product', categories: [] });
//     }
// };



let addProductPost = async (req, res) => {
    try {
        const { productName, category, description } = req.body;
        const images = req.files;
        const variants = req.body.variant;
        const prices = req.body.price;
        const stocks = req.body.stock;

        // Upload images to cloudinary
        const imageUrl = [];
        for (const file of images) {
            const result = await cloudinary.uploader.upload(file.path);
            imageUrl.push(result.secure_url);
        }

        // Construct array of variant objects
        const stockDetails = variants.map((variant, index) => ({
            variant,
            price: prices[index],
            stock: stocks[index]
        }));

        // Create a new product instance
        const newProduct = new Product({
            productName,
            category,
            description,
            stock: stockDetails,
            imageUrl
        });

        // Save the new product to the database
        await newProduct.save();

        console.log('Product added successfully');
        res.redirect('/admin/productList');
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).render('admin/addProduct', { error: 'Error adding product', categories: [] });
    }
};





// product listing section

let productList=async(req,res)=>{
    try {
        const products = await Product.find({});
        
        res.render('admin/productList', { products });
    } catch (error) {
        console.log('Product list pge error:', error);
        res.status(201).json({ message: 'error showing product list' })
        // res.render('admin/catagoryList', { error: 'Error fetching categories' });
    }
}

let deleteProduct = async (req, res) => {
    const productId = req.params.id;
    console.log(productId);
    try {
        const deletedProduct = await Product.findOneAndDelete({ _id: productId });
        if (!deletedProduct) {
            return res.status(404).send('Product not found');
        }
        console.log('Product deleted successfully');
        return res.redirect('/admin/productList');
    } catch (error) {
        console.log('Error deleting product:', error);
        return res.status(500).send('Internal server error');
    }
}


// const enableProduct = async (req, res) => {
//     const productId = req.params.id;
//     try {
//         let product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).send('Product not found');
//         }
//         product.enabled = true; 
        
//         // Update the stock status based on the product's stock
//         product.stockStatus = product.stock > 0 ? `${product.stock} ` : 'Out of stock';
//         console.log(product.stockStatus);
//         await product.save();
//         console.log('Product enabled successfully');

//         return res.redirect('/admin/productList');
        
//     } catch (error) {
//         console.log('Error enabling product:', error);
//         return res.status(500).send('Internal server error');
//     }
// };


// let disableProduct = async (req, res) => {
//     const productId = req.params.id; // Get product id from route parameters
//     console.log(productId);
//     try {
//         const product = await Product.findById(productId);
//         console.log(product);
//         if (!product) {
//             return res.status(404).send('Product not found');
//         }
//         console.log('isDisabled:', product.isDisabled); 
//         // Toggle the isDisabled field
//         product.isDisabled = !product.isDisabled;
//         await product.save(); // Save the changes

//         // Redirect back to the product list page
//         res.redirect('/admin/productList');
//     } catch (error) {
//         console.error('Error while checking status:', error);
//         res.status(500).send('Internal Server Error');
//     }
// }



let disableProduct = async (req, res) => {
    const productId = req.body.productid;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        if(product.isDisabled){
            product.isDisabled = !product.isDisabled;
        }
        else{
            product.isDisabled = true; 
        }
        
        await product.save();

        return res.redirect('/admin/productList');
    } catch (error) {
        console.error('Error while toggling product status:', error);
        return res.status(500).send('Internal Server Error');
    }
};




let editProduct = async (req, res) => {
    try {
        let productId = req.params.id;
        // console.log(productId);
        let product = await Product.findById(productId);

        if (!product) {
            console.log('Product not found');
            return res.status(404).send('Product not found');
        }

        res.render('admin/editProduct', { product: product });
    } catch (error) {
        console.log('Error finding product:', error);
        res.status(500).send('Internal server error');
    }
}




// let editProductPost = async (req, res) => {
//     try {
//         let productId = req.params.id;
//         let newProduct = req.body;

//         let product = await Product.findOne({ _id: productId });

//         if (!product) {
//             console.log('Product not found');
//             return res.status(404).send('Product not found');
//         }
//         product.productName = newProduct.productName;
//         product.category = newProduct.category;
//         product.description = newProduct.description;
//         product.variant = newProduct.variant;
//         product.stock=newProduct.stock;
//         product.price = newProduct.price;

        

        
//         if (req.files && req.files.length > 0) {
//             const file = req.files[0]; 
//             const result = await cloudinary.uploader.upload(file.path); 
//             product.imageUrl = result.secure_url; 
//         }
//         await product.save();

//         return res.redirect('/admin/productList');
//     } catch (error) {
//         console.log('Error updating product:', error);
//         return res.status(500).send('Internal server error');
//     }
// }


let editProductPost = async (req, res) => {
    try {
        const productId = req.params.id;
        const newProduct = req.body;

        let product = await Product.findById(productId);

        if (!product) {
            console.log('Product not found');
            return res.status(404).send('Product not found');
        }

        // Update basic product details
        product.productName = newProduct.productName;
        product.category = newProduct.category;
        product.description = newProduct.description;

        // Update product image if a new one is provided
        if (req.files && req.files.length > 0) {
            const file = req.files[0];
            const result = await cloudinary.uploader.upload(file.path);
            product.imageUrl = result.secure_url;
        }

        // Update stock details
        if (newProduct.stock && newProduct.stock.length > 0) {
            product.stock = newProduct.stock.map(item => ({
                variant: item.variant,
                stock: item.stock,
                price: item.price
            }));
        }

        await product.save();
        return res.redirect('/admin/productList');
    } catch (error) {
        console.log('Error updating product:', error);
        return res.status(500).send('Internal server error');
    }
};
























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
    deleteProduct,
    disableProduct,
    // enableProduct,
    editProduct,
    editProductPost,
    adminLogOut
};