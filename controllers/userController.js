const User =require('../models/user')
const bcrypt=require('bcrypt')
const { application } = require('express')
const jwt=require('jsonwebtoken')
const Product=require('../models/products')


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


let cart=async (req,res)=>{
    try {
        const productId = req.body.productId;
        res.status(200).send({ message: 'Product added to cart successfully' });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
}


let cartAdd = async (req, res) => {
    try {
        const productId = req.body.productId;
        // Add the product to the user's cart
        // Example: const cart = await Cart.findOneAndUpdate({ userId: req.user._id }, { $addToSet: { products: productId } }, { upsert: true, new: true });
        res.status(200).send({ message: 'Product added to cart successfully' });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};



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
    profile
}
