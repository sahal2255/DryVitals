const Admin = require('../models/admin');
const Product=require('../models/products')

const User=require('../models/user')
const bcrypt = require('bcryptjs');
const { application } = require('express')
const cloudinary=require('../config/cloudinary')
const jwt = require('jsonwebtoken');
const fs=require('fs')
const path=require('path')
const axios = require('axios');
const mongoose=require('mongoose')

// const cloudinary=require('../config/cloudinary')
const upload=require('../config/multer');
const Order = require('../models/order');
const { cart, order } = require('./userController');
const { count } = require('console');
require('dotenv').config();

const Excel=require('exceljs')


// admin dashboard





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
                return res.status(400).render("admin/login",{error:'admin is not found'})
            }
            if(password!=admin.password){
                return res.status(400).render("admin/login",{errorp:'password not matching'})
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






let addProductPost = async (req, res) => {
    try {
        const { productName, category, description } = req.body;
        const images = req.files;
        const variants = req.body.variant;
        const prices = req.body.price;
        const stocks = req.body.stock;
        const mrp=req.body.mrp;
        
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
            stock: stocks[index],
            mrp:mrp[index]
            
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
                price: item.price,
                mrp:item.mrp
            }));
        }
        
        await product.save();
        return res.redirect('/admin/productList');
    } catch (error) {
        console.log('Error updating product:', error);
        return res.status(500).send('Internal server error');
    }
};



let userList=async (req,res)=>{
    try{
        const user=await User.find({})
        res.render('admin/userList',{user})
    }
    catch(error){
        console.log('user list error',error);
    }
}



let disableUser = async (req, res) => {
    const userId = req.body.userid;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        
        if (user.isDisabled && req.user && req.user.id === user._id.toString()) {
            // If the user is logged in and the user being disabled is the same user, redirect to login page with error
            return res.redirect('/login?error=disabled');
        }

        // Toggle user's isDisabled status
        user.isDisabled = !user.isDisabled;
        await user.save();
        return res.redirect('/admin/userList');
    } catch (error) {
        console.log('Error toggling user status', error);
        res.status(500).json({ error: 'Failed to toggle user status' });
    }
};




const orderShow = async (req, res) => {
    try {
        const orders = await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    orderDetails: "$$ROOT", // Store the order details in a field
                    userDetails: {
                        _id: "$userDetails._id",
                        userName: "$userDetails.userName",
                        email:'$userDetails.email'
                    }
                }
            },
            {
                $sort: { "orderDetails.createdAt": -1 } // Sort by createdAt field in descending order
            }
        ]);
        
        const updatedOrders = orders.map(order => ({
            ...order,
            newdate: new Date(order.orderDetails.createdAt).toLocaleString()
        }));
        
        console.log('admin order listing', updatedOrders);
        res.render('admin/orderList', { orders:updatedOrders }); // Assuming your view expects 'orders' variable
    } catch (error) {
        console.log('order show error', error);
        // Handle error
    }
}



// const orderShow = async (req, res) => {
//     try {
//         // Pagination parameters
//         const page = parseInt(req.query.page) || 1; 
//         const limit = 10; // Number of documents per page

//         // Calculate skip value
//         const skip = (page - 1) * limit;

//         // Fetch orders for the current page
//         const orders = await Order.aggregate([
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "userId",
//                     foreignField: "_id",
//                     as: "userDetails"
//                 }
//             },
//             {
//                 $unwind: "$userDetails"
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     userId: 1,
//                     orderDetails: "$$ROOT", // Store the order details in a field
//                     userDetails: {
//                         _id: "$userDetails._id",
//                         userName: "$userDetails.userName",
//                         email: '$userDetails.email'
//                     }
//                 }
//             },
//             {
//                 $sort: { "orderDetails.createdAt": -1 } // Sort by createdAt field in descending order
//             },
//             {
//                 $skip: skip
//             },
//             {
//                 $limit: limit
//             }
//         ]);

//         const totalOrders = await Order.countDocuments(); // Total number of orders

//         const totalPages = Math.ceil(totalOrders / limit); // Total number of pages
//         const pages = Array.from({ length: totalPages }, (_, i) => i + 1); // Array of pages

//         const updatedOrders = orders.map(order => ({
//             ...order,
//             newdate: new Date(order.orderDetails.createdAt).toLocaleString()
//         }));

//         console.log('admin order listing', updatedOrders);
//         res.render('admin/orderList', { orders: updatedOrders, currentPage: page, totalPages, pages }); // Pass pagination data to the view
//     } catch (error) {
//         console.log('order show error', error);
//         // Handle error
//     }
// }




let singleOrder=async(req,res)=>{
    try{
        const orderId=req.params.id;
        console.log('order Id for viewing',orderId);
        const singelOrd=await Order.findById(orderId)
        console.log(singelOrd);
        // res.json({singelOrd})
        res.json({singelOrd})
    }
    catch(error){
        console.log('single Order show',error);
    }
}


let singleView = async (req, res) => {
    try {
        const orderId = req.query.id;
        
        console.log('Order Id for querying:', orderId);
        
        const orderDetails = await Order.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(orderId) }
            },
            {
                $unwind: '$cart.product' 
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'cart.product.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            },
            {
                $unwind:'$productDetails.imageUrl'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $unwind:'$userDetails.userAddress'
            },
            
        ]);
        
        console.log(orderDetails);
        
        res.render('admin/singleOrder', { orderDetails });
    } catch (error) {
        console.log('Error in getting order details:', error);
        throw error;
    }
};




const updateStatus = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const selectedStatus = req.body.status;
        
        console.log('Order ID:', orderId);
        console.log('Selected Status:', selectedStatus);
        
        // Update the status field in the Order collection
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: selectedStatus }, { new: true });

        console.log('Updated Order:', updatedOrder);

        res.status(200).json({ message: 'Status updated successfully', updatedOrder });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};





let adminDash = async (req, res) => {
    console.log("req.admin :", req.admin);
    const admin = req.admin;

    try {
        const totalOrder = await Order.countDocuments();
        const totalUser = await User.countDocuments();
        const totalOrderAmountResult = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ]);

        const totalOrderAmount = totalOrderAmountResult.length > 0 ? totalOrderAmountResult[0].totalAmount : 0;
        console.log('total amount',totalOrderAmount);

        const orderChart=await Order.aggregate([
            {$unwind:"$cart.product"},
            {$lookup:{
                from:'products',
                localField:'cart.product.productId',
                foreignField:'_id',
                as:'productDetails'
            }},
            {$unwind:'$productDetails'},
            {$group:{
                _id:'$productDetails.category',
                totalOrders:{$sum:1}
            }}
        ])


        const labels = orderChart.map(item => item._id);
        const data = orderChart.map(item => item.totalOrders);
        console.log('label',labels)
        console.log('orderchart',orderChart)

        const totalProducts=await Product.find({}).countDocuments()

        const dailyOrder = await Order.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    count: { $sum: 1 } 
                }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: {
                                $dateFromParts: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                    day: "$_id.day"
                                }
                            }
                        }
                    },
                    count: 1 
                }
            },
            {
                $sort: { date: 1 } 
            }
        ]);
        
// console.log('bar details',barDetails);

const monthlyOrder = await Order.aggregate([
    {
        $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 }
        }
    },
    {
        $sort: { _id: 1 } 
    }
]);

console.log('dhhb',monthlyOrder)
const labels1 = monthlyOrder.map(entry => entry._id);
const counts1 = monthlyOrder.map(entry => entry.count);


const latestOrder = await Order.aggregate([
    { $sort: { createdAt: -1 } },
    { $limit: 6 },
    { $project: {
        _id: 1,
        status:1,
        isCancel:1,
        selectedPaymentMethod:1,
        totalAmount:1,
        createdAt: {
            $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
            }
        },
        cart: 1,
        // productDetails: 1
    }}
]);







res.render('admin/index', { admin, totalOrder, totalUser, totalOrderAmount,
            latestOrder,
            // salesReport,
            totalProducts,dailyOrder,monthlyOrder:{labels1,counts1}
            ,orderChart: { labels, data } });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
}


let salesReportget=async(req,res)=>{
    const { startDate, endDate } = req.body;
console.log('start date', startDate);
console.log('end date', endDate);



if(startDate&&endDate){


const salesReport = await Order.aggregate([
    {
        $match: {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) // Adjust end date to end of day
            }
        }
    }
]);

// console.log('sales report',salesReport);

const workbook = new Excel.Workbook();
const worksheet = workbook.addWorksheet("Sales Report");

worksheet.columns = [
    { header: "Order ID", key: "_id", width: 40 },
    { header: "Order Date", key: "createdAt", width: 20 },
    { header: "Order Status", key: "status", width: 20 },
    { header: "Payment Method", key: "selectedPaymentMethod", width: 20 },
    { header: "Price", key: "totalAmount", width: 20 },
];

salesReport.forEach((item) => {
    worksheet.addRow({
        _id: item._id,
        createdAt: item.createdAt,
        status: item.status,
        selectedPaymentMethod: item.selectedPaymentMethod,
        totalAmount: item.totalAmount
    });
});
// const excelBuffer = await workbook.xlsx.writeBuffer();

// Set response headers for Excel download
res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
res.setHeader("Content-Disposition", "attachment; filename=sales_report.xlsx");

workbook.xlsx.write(res)
          .then(() => {
            res.end();
          })
          .catch((error) => {
            console.error('Error writing Excel file:', error);
            res.status(500).send('Error generating Excel file');
          });


}
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
    deleteProduct,
    disableProduct,
    userList,
    disableUser,
    editProduct,
    editProductPost,
    adminLogOut,
    orderShow,
    singleOrder,
    singleView,
    updateStatus,
    salesReportget

};