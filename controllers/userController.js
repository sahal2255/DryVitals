const User =require('../models/user')
const bcrypt=require('bcrypt')
const { application } = require('express')
const jwt=require('jsonwebtoken')
const Product=require('../models/products')
const axios = require('axios');
const mongoose = require('mongoose');
const Admin = require('../models/admin')
const { ObjectId } = mongoose.Types;


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
    console.log('user login page get');
    res.render('user/login', { error: '' });
}




// user login section

let loginPostPage = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        const token = jwt.sign( 
            {
                id: user._id,
                name: user.userName,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '24h'
            }
        );
        
        res.cookie("user_jwt", token, { httpOnly: true, maxAge: 86400000 }); // 24 hour expiry
        
        res.status(200).json({ message: "Login successful" });
    } catch (error) {
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
    console.log('user signup page get');
}


let signUp=async(req,res)=>{
    try{
        const {userName,email,password,phoneNumber}= req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists." });
        }
        
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
        res.cookie("user_jwt", token, { httpOnly: true, maxAge: 86400000 }); // 24 hour expiry

        console.log("New user created:", newUser);
         res.json('ok')
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
        
        
        // console.log(userId);
        const admin= await Admin.findOne({})
        const category=admin.categories.map(category=>category.catagoryName)
        // console.log(category);

        
       
        const products =await Product.find(req.query)
        
        
        res.render('user/product',{products,category})
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
    // console.log('product id',productId;
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



let cartAdd = async (req, res) => {
    try {
        
        

        const productId = req.params.id;

        console.log(productId);
        const selectedVariant = req.body.selectedVariant;

        const selectedPrice = parseFloat(req.body.selectedPrice);

        // console.log(req.body);
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        console.log(user);

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
        user.cart.total = user.cart.total + selectedPrice
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
        const user = await User.findById(req.user.id).select('cart');
        const data=user.cart.product
        const total=user.cart.total
        console.log('datas',data);
        res.render('user/cart', { data,total });
    } catch (error) {
        console.error('Error rendering cart:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};



let deleteCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id; 

        console.log(productId);

        const user = await User.findById(userId);
        console.log(user);
        if (!user || !user.cart || !user.cart.product || user.cart.product.length === 0) {
            return res.status(404).send('User or cart data not found');
        }
        const index = user.cart.product.findIndex(item => item.productId.toString() === productId);

        if (index !== -1) {
            const deletedProductPrice = user.cart.product[index].productPrice;

            user.cart.product.splice(index, 1);
            user.cart.total -= deletedProductPrice;

        } else {
            return res.status(404).send('Product not found in cart');
        }

        await user.save();

        console.log('success', user);
        res.status(200).send(user);
    } catch (error) {
        console.log('error', error);
        res.status(500).send('Internal Server Error');
    }
}


let incrementQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const cartItem = user.cart.product.find(item => item._id.toString() === productId);
        if (!cartItem) {
            return res.status(404).json({ error: "Product not found in the cart" });
        }
       
        const product = await Product.aggregate([
            {
                $match: { _id: new ObjectId(cartItem.productId) } 
            },
            {
                $unwind: '$stock' 
            },
            {
                $match: {
                    $expr: {
                        $eq: ['$stock.variant', cartItem.productVariant] 
                    }
                }
            },
            {
                $project: {
                    productName: 1,
                    variant: '$stock.variant',
                    price: '$stock.price' 
                }
            }
        ]);
        
        cartItem.quantity++;
        cartItem.productPrice= cartItem.quantity*product[0].price
        // console.log(user.cart.total);

        user.cart.total = user.cart.total + product[0].price

        await user.save();
        // console.log(user.cart.total);
        

        res.status(200).json({ message: "Quantity incremented successfully" ,cartItem});
    } catch (error) {
        console.error('Error incrementing quantity:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};


let decrementQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const cartItem = user.cart.product.find(item => item._id.toString() === productId);
        if (!cartItem) {
            return res.status(404).json({ error: "Product not found in the cart" });
        }
        const product = await Product.aggregate([
            {
                $match: { _id: new ObjectId(cartItem.productId) } 
            },
            {
                $unwind: '$stock' 
            },
            {
                $match: {
                    $expr: {
                        $eq: ['$stock.variant', cartItem.productVariant] 
                    }
                }
            },
            {
                $project: {
                    productName: 1,
                    variant: '$stock.variant',
                    price: '$stock.price' 
                }
            }
        ]);

            cartItem.quantity--;
            cartItem.productPrice= cartItem.quantity*product[0].price
            user.cart.total -= product[0].price;

            await user.save();


            res.status(200).json({ message: "Quantity decremented successfully",});
        
    } catch (error) {
        console.error('Error decrementing quantity:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

let filterProducts = async (req, res) => {
    const category = req.query.category;
    console.log(category);
    try {
        let filteredProducts = [];
        if (category === 'all') {
            filteredProducts = await Product.find().sort(sort);
        } else {
            filteredProducts = await Product.find({ category: category }).sort(sort);
        }

        res.render('user/product', { products: filteredProducts });
    } catch (error) {
        console.error('Error fetching filtered products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




let sortProducts = async (req, res) => {
    try {
        const sortBy = req.body.sortBy;
        console.log(sortBy);
        let products;

        // Sort products based on the selected option
        if (sortBy === 'price-low-high') {
            products = await Product.find().sort({ 'stock.0.price': 1 });
        } else if (sortBy === 'price-high-low') {
            products = await Product.find().sort({ 'stock.0.price': -1 });
        }
console.log(products);
        res.json({ products });
    } catch (error) {
        console.error('Error sorting products:', error);
        res.status(500).json({ error: 'Failed to sort products.' });
    }
};

// Route for sorting products


let wishlistGet=async(req,res)=>{
    // res.render('user/wishlist')
    try{
        const user = await User.findById(req.user.id);
        const wishlistItems=user.wishlist.product
        res.render('user/wishlist',{wishlistItems})
    }
    catch(error){
        console.log('wishlist error',error);
    }
}


let wishlistAdd = async (req, res) => {
    try {
        if (!req.user) {
            // Redirect the user to the login page or send an error response
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }
        const userId = req.user.id;

        const { productId, productImage, productName, productPrice, productVariant } = req.body;

        let user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }
        if (!user.wishlist) {
            user.wishlist = { product: [] };
        }
        user.wishlist.product.push({
            productId: productId,
            productImage: productImage,
            productName: productName,
            productPrice: productPrice,
            productVariant: productVariant
        });

        const wishlistItems=user.wishlist.product
        console.log('wishlist',wishlistItems);
        user = await user.save();
        res.render('user/wishlist', { wishlistItems });
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        res.status(500).json({ error: 'Failed to add product to wishlist.' });
    }
};

let wishlistdelete = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id;

        const user = await User.findById(userId);
        if (!user || !user.wishlist || !user.wishlist.product || user.wishlist.product.length === 0) {
            return res.status(404).send('User or wishlist data not found');
        }

        // Find the index of the product with the given ID in the wishlist array
        const index = user.wishlist.product.findIndex(item => item.productId.toString() === productId);
        if (index === -1) {
            return res.status(404).send('Product not found in the wishlist');
        }

        // Remove the product from the wishlist array
        user.wishlist.product.splice(index, 1);

        // Save the updated user object
        await user.save();

        console.log('Product removed from wishlist successfully');
        return res.status(200).send('Product removed from wishlist successfully');
    } catch (error) {
        console.error('Error removing product from wishlist:', error);
        return res.status(500).send('Internal Server Error');
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
    deleteCart,
    incrementQuantity,
    decrementQuantity,
    filterProducts,
    sortProducts,
    wishlistAdd,
    wishlistGet,
    wishlistdelete,
    profile
}
