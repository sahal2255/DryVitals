const User =require('../models/user')
const bcrypt=require('bcrypt')
const { application } = require('express')
const jwt=require('jsonwebtoken')
const Product=require('../models/products')
const axios = require('axios');
const mongoose = require('mongoose');
const Admin = require('../models/admin')
const Order =require('../models/order')
const { error } = require('jquery')
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
// let loginPage = async (req, res) => {
//     if (req.user) {
//         return res.redirect('/');
//     }
//     console.log('user login page get');
//     res.render('user/login', { error: '' });
// }



let loginPage = async (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }

    const { error } = req.query;
    if (error === 'disabled') {
        return res.render('user/login', { error: 'Your account has been disabled. Please contact the administrator.' });
    }

    console.log('user login page get');
    res.render('user/login', { error: '' });
};



// user login section

let loginPostPage = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.isDisabled) {
            return res.status(403).json({ error: 'Your account has been blocked. Please contact the administrator.' });
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

let productGet = async (req, res) => {
    try {
        const admin = await Admin.findOne({});
        const category = admin.categories.map(category => category.catagoryName);
        
        const products = await Product.find(req.query);
        let userId;
        let wishlistItems = []; // Array to store wishlist product IDs if user is logged in
        if (req.user) {
            userId = req.user.id;
            let user = await User.findOne({ _id: userId });
            wishlistItems = user.wishlist.product.map(item => item.productId.toString()); // Convert ObjectIds to strings for comparison
        }
        
        // Passing wishlist status of each product to the template
        const productsWithWishlistStatus = products.map(product => ({
            ...product.toObject(),
            inWishlist: wishlistItems.includes(product._id.toString()) // Convert ObjectId to string for comparison
        }));

        return res.render('user/product', { products: productsWithWishlistStatus, category });
    } catch (error) {
        console.log('product page error', error);
        res.status(500).json({ message: 'Error showing product' });
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
        const selectedmrp=parseFloat(req.body.selectedmrp)
        // console.log(req.body)
        if (!req.user) {
            return res.status(401).send({ error: 'User not authenticated' });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        // console.log(user);

        const product = await Product.findById(productId);        
        const existingProductIndex = user.cart.product.findIndex(item =>
            item.productId.toString() === productId && item.productVariant === selectedVariant
        );

        if (existingProductIndex !== -1) {
            // Variant already exists, increase quantity
            user.cart.product[existingProductIndex].quantity += 1;
            user.cart.product[existingProductIndex].productPrice = selectedPrice * user.cart.product[existingProductIndex].quantity;
            user.cart.product[existingProductIndex].productmrp += selectedmrp; // Add the MRP of one more quantity

        } else {
            user.cart.product.push({
                productId: product._id,
                productImage: product.imageUrl,
                productName: product.productName,
                productPrice: selectedPrice,
                productmrp:selectedmrp,
                productVariant: selectedVariant,
                quantity: 1 
            });
            // user.cart.total += selectedPrice
        }
        // user.cart.total = user.cart.total + selectedPrice
        user.cart.total = user.cart.product.reduce((total, item) => {
            return total + item.productPrice 
        }, 0);
        user.cart.totalmrp = user.cart.product.reduce((totalmrp, item) => {
            return totalmrp + item.productmrp; // Calculate the total MRP
        }, 0);
        await user.save();
        console.log('Product added to cart');
        // console.log(user.cart.product);
        const data=user.cart.product
        // console.log('datas',data);
        res.status(200).json({ data });
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
        const totalmrp=user.cart.totalmrp
        // const mrp=user.cart.
        // console.log('datas',data);
        res.render('user/cart', { data,total ,totalmrp});
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
            const deletedProductMRP = user.cart.product[index].productmrp;

            user.cart.product.splice(index, 1);
            user.cart.total -= deletedProductPrice;
            user.cart.totalmrp -= deletedProductMRP;

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
                    mrp:'$stock.mrp',
                    price: '$stock.price' 
                }
            }
        ]);
        
        cartItem.quantity++;
        cartItem.productPrice= cartItem.quantity*product[0].price
        cartItem.productmrp += product[0].mrp;
        // console.log(user.cart.total);

        user.cart.total +=  product[0].price
        user.cart.totalmrp += product[0].mrp;

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
                    mrp:'$stock.mrp',
                    price: '$stock.price' 
                }
            }
        ]);

        if (cartItem.quantity > 1) {
            cartItem.quantity--;
            cartItem.productPrice = cartItem.quantity * product[0].price;
            user.cart.total -= product[0].price;
            user.cart.totalmrp -= product[0].mrp;
            cartItem.productmrp -= product[0].mrp; 

            await user.save();

            res.status(200).json({ message: "Quantity decremented successfully" });
        } else {
            const deletedProductMRP = cartItem.productmrp;
            user.cart.product = user.cart.product.filter(item => item._id.toString() !== productId);
            user.cart.total -= product[0].price;
            user.cart.totalmrp -= deletedProductMRP; 

            await user.save();

            res.status(200).json({ message: "Product removed from cart" });
        }
    } catch (error) {
        console.error('Error decrementing quantity:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};


//sorting and filtering 

let sortAndFilterProducts = async (req, res) => {
    try {
        const sortBy = req.body.sortBy;
        const category = req.body.category;
        console.log(sortBy, category);

        let query = {};

        // Apply category filter
        if (category && category !== 'all') {
            query.category = category;
        }

        let products;

        // Apply sorting based on the selected criteria
        if (sortBy === 'price-low-high') {
            products = await Product.find(query).sort({ 'stock.0.price': 1 });
        } else if (sortBy === 'price-high-low') {
            products = await Product.find(query).sort({ 'stock.0.price': -1 });
        } else {
            products = await Product.find(query);
        }

        console.log(products);
        res.json({ products });
    } catch (error) {
        console.error('Error sorting and filtering products:', error);
        res.status(500).json({ error: 'Failed to sort and filter products.' });
    }
};


const wishlistGet = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(userId);
        const objectId=new mongoose.Types.ObjectId(userId)
        console.log(objectId);
        // Fetch wishlist items with product details using aggregation
        const wishlistItems = await User.aggregate([
            { $match: { _id: objectId } },
            { $unwind: '$wishlist.product' },
            { 
                $lookup: {
                    from: 'products', // Name of the product collection
                    localField: 'wishlist.product.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            { 
                $group: {
                    _id: '$_id',
                    wishlistItems: { 
                        $push: { 
                            productId:'$wishlist.product.productId',
                            productName: '$productDetails.productName',
                            productImage: '$productDetails.imageUrl',
                            price: { $arrayElemAt: ['$productDetails.stock.price', 0] },
                            variant: { $arrayElemAt: ['$productDetails.stock.variant', 0] },
                            stock: { $arrayElemAt: ['$productDetails.stock.stock', 0] },
                            mrp:{$arrayElemAt:['$productDetails.stock.mrp',0]}
                        } 
                    }
                }
            },
            { $project: { wishlistItems: 1, _id: 1 } }
        ]);
        
        const extractedWishlistItems = wishlistItems.length > 0 ? wishlistItems[0].wishlistItems : [];

        // console.log(extractedWishlistItems);
        const productIds = extractedWishlistItems.map(item => item.productId);
        console.log('Product IDs:', productIds)        // Render the wishlist items in your view
        res.render('user/wishlist', { wishlistItems: extractedWishlistItems });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};





// Server-side code
const wishlistAdd = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }
    
        const {productId} = req.body
        const product = await Product.findById(productId)
        
        // console.log(productId);
        const userId = req.user.id;
        let user = await User.findById(userId);
        // console.log(user.wishlist.product)

        const existingProductIndex = user.wishlist.product.findIndex(item => item.productId.toString() === productId);
        if (existingProductIndex !== -1) {
            console.log('Product already exists in the wishlist');
            user.wishlist.product = user.wishlist.product.filter(item => item.productId.toString() !== productId);
            user = await user.save();
            console.log('Existing product removed from the wishlist', );
             return res.status(200).json({ success: true, });
        
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!user.wishlist || !user.wishlist.product) {
            user.wishlist = { product: [] };
        }
        user.wishlist.product.push({
            productId :product._id
            
        });
        user = await user.save();
        console.log('wishlist added');
        const wishlistItems = user.wishlist.product;
        res.status(200).json({ success: true, wishlistItems });
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        res.status(500).json({ error: 'Failed to add product to wishlist.' });
    }
};

const wishlistdelete = async (req, res) => {
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




//  wihlist to cart


const wishlisttoCart=async(req,res)=>{
    try{
        const productId=req.params.id
        console.log(productId);
        const selectedVariant=req.body.variant
        const selectedPrice=req.body.price
        const selectedmrp=req.body.mrp
       


        if (!req.user) {
            return res.status(401).send({ error: 'User not authenticated' });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        // console.log(user)

        const product =await Product.findById(productId)
        // console.log(product);
        
        const existingProductIndex = user.cart.product.findIndex(item =>
            item.productId.toString() === productId && item.productVariant === selectedVariant
        );

        if (existingProductIndex !== -1) {
            // Variant already exists, increase quantity
            user.cart.product[existingProductIndex].quantity += 1;
            user.cart.product[existingProductIndex].productPrice = selectedPrice * user.cart.product[existingProductIndex].quantity;
            user.cart.product[existingProductIndex].productmrp += selectedmrp; // Add the MRP of one more quantity

        } else {
            user.cart.product.push({
                productId: product._id,
                productImage: product.imageUrl,
                productName: product.productName,
                productPrice: selectedPrice,
                productmrp:selectedmrp,
                productVariant: selectedVariant,
                quantity: 1 
            });
            // user.cart.total += selectedPrice
        }
        // user.cart.total = user.cart.total + selectedPrice
        user.cart.total = user.cart.product.reduce((total, item) => {
            return total + item.productPrice 
        }, 0);
        user.cart.totalmrp = user.cart.product.reduce((totalmrp, item) => {
            return totalmrp + item.productmrp; // Calculate the total MRP
        }, 0);
        await user.save();
        console.log('Product added to cart');
        // console.log(user.cart.product);
        const data=user.cart.product
        // console.log('datas',data);
        res.status(200).json({ data });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};







let checkOut = async (req, res) => {
    try {
        // Retrieve user data including userAddress and cart
        const user = await User.findById(req.user.id);
        const userId=req.user.id
        console.log('userId',userId)
        // Check if the user has a stored address
        if (user.userAddress) {
            const { name, email, phoneNumber, district, place, address, pincode } = user.userAddress;
            let userAddress=user.userAddress
            const userId=req.user.id
            console.log('userId',userId)

            res.render('user/checkOut', {
                // userAddress,
                userId,
                name, email, phoneNumber, district, place, address, pincode,
                userAddress,
                cartItems: user.cart,
                total: user.cart.total,
                totalmrp: user.cart.totalmrp,
                shipping: 60,
                totalAmount: user.cart.total + 60 ,
                
            });
        } else {
            res.render('user/checkOut', {
                cartItems: user.cart,
                total: user.cart.total,
                totalmrp: user.cart.totalmrp,
                shipping: 60,
                totalAmount: user.cart.total + 60 ,
               
            });
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).send('Internal Server Error');
    }
};





let singleCheckOut=async(req,res)=>{
    try {
        const { productName, selectedVariant, price, mrp } = req.body;
        // console.log('checkout page adding',req.body);
        if (productName && selectedVariant && price && mrp) {
            // Render the singleCheckOut view and pass the data to it
            res.render('user/singleCheckOut', { productName, selectedVariant, price, mrp });
        } else {
            throw new Error('Missing required data.');
        }
    } catch (error) {
        console.log('Error in singleCheckOut:', error);
        res.status(400).send('Bad Request');
    }
}

let singleCheckOutget = async (req, res) => {
    try {
        const { productName, selectedVariant, price, mrp } = req.query;
        const result = { productName, selectedVariant, price, mrp };
        console.log('checkout page getting', req.query);
        const shipping=60
        const totalamount=+result.price+shipping
        res.render('user/singleCheckOut', { result,shipping,totalamount });
         
    } catch (error) {
        console.log('Error in singleCheckOutget:', error);
        
    }
}

let saveAddress = async (req, res) => {
    try {
        const { Name, email, phoneNumber, district, place, address, pincode } = req.body;
        const userId = req.user.id; // Assuming you have the user ID in the request object
        
        // Construct the user address object
        const userAddress = {
            name: Name,
            email: email,
            phoneNumber: phoneNumber,
            district: district,
            place: place,
            address: address,
            pincode: pincode
        };

        // Update the user document with the new address
        const updatedUser = await User.findByIdAndUpdate(userId, { userAddress: userAddress }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User address updated:', updatedUser);
        
        // Redirect the user to the checkout page after address update
        res.redirect('/checkOut');
    } catch (error) {
        console.log('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



const placeOrder = async (req, res) => {
    try {
        const { user, body } = req;

        // Extract checkout details from the request body
        const { userAddress, paymentMethod } = body;

        // Extract items from the user's cart
        const items = user.cart.map(item => ({
            product: item.product, // Assuming product is an ObjectId
            quantity: item.quantity,
            variant: item.variant,
            price: item.productPrice // Assuming productPrice is the price of the item
        }));

        // Create a new order using the extracted data
        const newOrder = new Order({
            user: user.id,
            items,
            userAddress,
            paymentMethod
        });

        // Save the order to the database
        const savedOrder = await newOrder.save();

        res.status(201).json(savedOrder);
    } catch (err) {
        console.error('Error placing order:', err);
        res.status(500).json({ error: 'Failed to place order' });
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
    incrementQuantity,
    decrementQuantity,
   
    sortAndFilterProducts,

    wishlistAdd,
    wishlistGet,
    wishlistdelete,
    wishlisttoCart,
    checkOut,
    singleCheckOut,
    singleCheckOutget,
    saveAddress,
    placeOrder,
    profile
}
