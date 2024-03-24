const express=require('express')
const router=express.Router()
const bodyparser=require('body-parser')
const userController=require('../controllers/userController')
router.use(bodyparser.urlencoded({extended:true}))
const userAuth=require('../middleware/user_jwt')
// const { route } = require('./adminRoute')




router.get('/',userController.homepage)


router.get('/login',userController.loginPage)
router.post('/login',userController.loginPostPage)

router.get('/logOut',userController.logOut)


router.get('/sign',userController.signUpPage)
router.post('/signup',userController.signUp)

router.get('/product',userAuth,userController.productGet)

router.get('/singleProduct/:id', userAuth, userController.singleProduct);



router.get('/profile',userAuth,userController.profile)




module.exports=router
