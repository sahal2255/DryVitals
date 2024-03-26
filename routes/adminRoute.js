const express = require('express');
const bodyparser = require('body-parser');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/admin_jwt');
const upload = require('../config/multer');
// const cloudinary=require('../config/cloudinary')



router.use(bodyparser.urlencoded({ extended: true }));

router.get('/admin/index',adminAuth,adminController.adminDash)

router.get('/admin/login', adminController.adminLogin);
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

router.get('/admin/editProduct/:id',adminAuth,adminController.editProduct)
router.post('/admin/editProduct/:id',upload.array('image',3),adminAuth,adminController.editProductPost)



router.get('/admin/adminLogOut',adminController.adminLogOut)

module.exports = router;
