const express=require('express')
const bodyparser=require('body-parser')
const router=express.Router()
const adminController=require('../controllers/adminController')
router.use(bodyparser.urlencoded({extended:true}))
const adminAuth=require('../middleware/admin_jwt')
// const { route } = require('./userRoute')

router.get('/admin/login',adminController.adminLogin)


module.exports=router
