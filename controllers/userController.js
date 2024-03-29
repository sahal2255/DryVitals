const User =require('../models/user')
const bcrypt=require('bcrypt')
const { application } = require('express')
const jwt=require('jsonwebtoken')
const Product=require('../models/products')
const axios = require('axios');
const mongoose = require('mongoose');



require('dotenv').config()



//------- getting homepage -----
let homepage=async(req,res)=>{
    // res.render('user/index')
    try{
        const products=await Product.find({}).limit(3)
        res.render('user/index',{products})
    }
    catch(error){
        console.log('product page error',error);
        res.status(201).json({message:'error showing product'})
    }
}



//-------- getting loginPage ---------
let loginPage = async (req, res) => {
    if (req.user) {
        // User is already logged in, redirect to another page or the homepage
        return res.redirect('/');
    }
    console.log('loginpage get');
    res.render('user/login', { error: '' });
}




// user login section

let loginPostPage=async(req,res)=>{
    const {email,password} = req.body

    try{
        const user = await User.findOne({email})
        
        if(!user){
            return res.status(404).json({error:'user not found'})
        }
        const validPassword = await bcrypt.compare(password,user.password)
        if(!validPassword){
            return res.status(401).json({error:'invalid password'})
        }
        const token = jwt.sign( 
            {
                id:user._id,
                name:user.userName,
                email:user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn:'24h'
            }
        );
        // console.log(token);
        res.cookie("user_jwt", token, { httpOnly: true, maxAge: 86400000 }); // 24 hour expiry

        // res.status(200).json({ message: "Login successful", token });
        res.redirect('/')
        console.log("user logged in with email and password ");
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    };

// user logout section


let logOut=async(req,res)=>{
    res.clearCookie('user_jwt')
    console.log('logout success');
    res.redirect('/')
}


//--------- getting signUpPage ---------
let signUpPage=async(req,res)=>{
    res.render('user/sign')
}





// user signing section


let signUp=async(req,res)=>{
    try{
        const {userName,email,password,phoneNumber}= req.body;
        
        const hashPassword = await bcrypt.hash(password,10)
        const newUser = new User({
            userName,
            email,
            phoneNumber,
            password: hashPassword,
          });
        await newUser.save()

        const user=await User.findOne({email})

        const token = jwt.sign(
            {
                id:user._id,
                name:user.userName,
                email:user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h",
              }
        );
        res.cookie("jwt", token, { httpOnly: true, maxAge: 86400000 }); // 24 hour expiry

        console.log("New user created:", newUser);
        return res.redirect('/login')
      } 
     catch (error) {
      console.error("Verification failed:", error);
      res
        .status(500)
        .json({ error: "Verification failed. Please try again later." });
    }
  };


// product page get section

let productGet=async(req,res)=>{
    
    try{
        const products =await Product.find({})
        // const catagory=await Admin.distinct('catagories')
        // console.log(products);
        res.render('user/product',{products})
    }
    catch(error){
        console.log('product page error',error);
        res.status(201).json({message:'error showing product'})
    }
}




// single product get section

let singleProduct=async(req,res)=>{

    try{

    
    let productId=req.params.id;
    // console.log('product id',productId);
    let singlepro=await Product.findById(productId)
    // console.log('single product',singlepro);
    if(!singlepro){
        console.log('Product not found');
        return res.status(404).send('product nt found')
    }
    
    res.render('user/singleProduct',{product:singlepro})
    }catch(error){
        console.log('error finding product');
        res.status(500).send('internal server error')
    }
}




//cart page





// let cartAdd = async (req, res) => {
//     try {
        
        
//         const user = await User.findById(req.user.id);
//         console.log(user);
//         if (!user) {
//             return res.status(404).send({ error: 'User not found' });
//         }
//         const productId = req.params.id; 

//         console.log(productId);
//         const selectedVariant=req.body.variant
        
//         // Find the product by ID
//         const product = await Product.findById(productId);
//         console.log(product);
//         if (!product) {
//             return res.status(404).send({ error: 'Product not found' });
//         }
        
//         // Add the product to the user's cart
//         user.cart.product.push({
//             productId: product._id,
//             productImage: product.imageUrl,
//             productName: product.productName,
//             productPrice: product.price,
//             productVariant: product.stock[0].variant, // Assuming variant is available in the stock array
//             quantity: 1 // Default quantity
//         });

//         // Save the user object to persist changes
//         await user.save();
//         console.log('product added to cart');
//         // Redirect to the cart page or render it with updated data
//         res.redirect('/cart');
//     } catch (error) {
//         console.error('Error adding product to cart:', error);
//         res.status(500).send({ error: 'Internal server error' });
//     }
// };


let cartAdd = async (req, res) => {
    try {
        const { ...FormData } = req.body;
        console.log(FormData);

        const productId = req.params.id;

        // console.log(productId);
        const selectedVariant = req.body.selectedVariant;

        const selectedPrice = req.body.selectedPrice;

        console.log(req.body);
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // const selectedStock = req.body.selectedStock;

        const product = await Product.findById(productId);

        
        console.log(selectedPrice);
        user.cart.product.push({
            productId: product._id,
            productImage: product.imageUrl,
            productName: product.productName,
            productPrice: selectedPrice,
            
            productVariant: selectedVariant,
            quantity: 1 // Default quantity
        });

        await user.save();
        console.log('Product added to cart');
        // console.log(user.cart.product);
        const data=user.cart.product
        // console.log('datas',data);
        res.redirect('/cart');
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};


let cart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const data=user.cart.product
        res.render('user/cart', { data });
    } catch (error) {
        console.error('Error rendering cart:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};

let deleteCart = async (req, res) => {
    try {
        const productId = req.params.id;
        const ObjectId = mongoose.Types.ObjectId;
        const productObjectId = new ObjectId(productId);
        // Update the user's cart by pulling the product with the specified productId
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { 'cart.product': { _id: productObjectId } } },
            { new: true }
        );

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.status(200).send({ message: 'Product removed from cart' });
    } catch(error) {
        console.error('Error removing product from cart:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
}



//   get user profile page

  let profile=async(req,res)=>{

    let userId=req.user.id
    let user=await User.findOne({_id:userId})
    // console.log(user);
    if(!user){
        return res.status(400).send('user not found')
    }
   return res.render('user/profile',{user})
   
  }

// ----end profile page section







module.exports={
    homepage,
    loginPage,
    signUpPage,
    signUp,
    loginPostPage,
    logOut,
    productGet,
    singleProduct,
    cart,
    cartAdd,
    deleteCart,
    profile
}
