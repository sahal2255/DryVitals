const express = require('express');
const bodyparser = require('body-parser');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/admin_jwt');
const adminMiddleware=require('../middleware/adminMiddleware')
const upload = require('../config/multer');
const axios = require('axios');
const { userAuth } = require('../middleware/user_jwt');
// const cloudinary=require('../config/cloudinary')



router.use(bodyparser.urlencoded({ extended: true }));

router.get('/admin/index',adminAuth,adminController.adminDash)

router.get('/admin/login', adminMiddleware,adminController.adminLogin);
router.post('/admin/login',adminController.adminLoginPost)

router.get('/admin/addCatagory',adminAuth,adminController.addCatagory)
router.post('/admin/addCatagory',adminAuth,adminController.addCatagoryPost)

router.get('/admin/catagoryList',adminAuth,adminController.catagoryList)

router.get('/admin/deleteCategory/:id', adminController.deleteCategory); 
router.delete('/admin/deleteCategory/:id', adminController.deleteCategory); 

router.post('/admin/disableProduct', adminController.disableProduct);

router.get('/admin/editCatagory/:id',adminAuth,adminController.editCatagory)
router.post('/admin/editCatagory/:id',adminController.editCatagoryPost)

router.get('/admin/addProduct',adminAuth,adminController.addProduct)

router.post('/admin/addProduct',adminAuth , upload.array('image',3), adminController.addProductPost);

router.get('/admin/productList',adminAuth,adminController.productList)

router.get('/admin/deleteProduct/:id',adminAuth,adminController.deleteProduct)
router.post('/admin/deleteProduct/:id',adminController.deleteProduct)

router.get('/admin/userList', adminAuth, adminController.userList);
router.post('/admin/disableUser', adminController.disableUser);

router.get('/admin/editProduct/:id',adminAuth,adminController.editProduct)
router.post('/admin/editProduct/:id',upload.array('image',3),adminAuth,adminController.editProductPost)

router.get('/admin/orderList',adminAuth,adminController.orderShow)

router.get('/admin/adminLogOut',adminController.adminLogOut)

router.get('/admin/singleOrder/:id',adminAuth,adminController.singleOrder)
router.get('/admin/singleView',adminAuth,adminController.singleView)

router.post('/admin/singleView',adminAuth,adminController.updateStatus)

module.exports = router;
