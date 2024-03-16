const express=require('express')
const router=express.Router()
const bodyparser=require('body-parser')
const userController=require('../controllers/userController')
router.use(bodyparser.urlencoded({extended:true}))
const userAuth=require('../middleware/user_jwt')


// const userAuth = require('../middleware/user_jwt').userAuth; // Import userAuth function
// const profile = require('../middleware/user_jwt').profile; // Import profile function



router.get('/',userController.homepage)


router.get('/login',userController.loginPage)
router.post('/login',userController.loginPostPage)

router.get('/logOut',userController.logOut)


router.get('/sign',userController.signUpPage)
router.post('/signup',userController.signUp)

router.get('/profile',userAuth,userController.profile)
// router.get('/profile', userAuth, profile);



module.exports=router
