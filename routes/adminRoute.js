const express = require('express');
const bodyparser = require('body-parser');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/admin_jwt');

router.use(bodyparser.urlencoded({ extended: true }));

router.get('/admin/index',adminAuth,adminController.adminDash)



router.get('/admin/login', adminController.adminLogin);
router.post('/admin/login',adminController.adminLoginPost)

// router.get('/admin/register', adminController.registerAdmin);
// router.post('/register', adminController.register);

router.get('/admin/adminProfile', adminAuth, adminController.profile);
router.get('/admin/adminLogOut',adminController.adminLogOut)

module.exports = router;
