const express = require('express');
const bodyparser = require('body-parser');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/admin_jwt');

router.use(bodyparser.urlencoded({ extended: true }));

router.get('/admin/index',adminAuth,adminController.adminDash)



router.get('/admin/login', adminController.adminLogin);
router.post('/admin/login',adminController.adminLoginPost)


router.get('/admin/addCatagory',adminAuth,adminController.addCatagory)
router.post('/admin/addCatagory',adminAuth,adminController.addCatagoryPost)

router.get('/admin/catagoryList',adminAuth,adminController.catagoryList)

// router.post('/admin/delteCategory/:id',adminController.deleteCategory)
// router.delete('/admin/deleteCategory/:id', adminController.deleteCategory);


router.get('/admin/deleteCategory/:id', adminController.deleteCategory); 
router.delete('/admin/deleteCategory/:id', adminController.deleteCategory); 





router.get('/admin/adminLogOut',adminController.adminLogOut)

module.exports = router;
