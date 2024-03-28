const express=require('express')
const router=express.Router()
const bodyparser=require('body-parser')
const userController=require('../controllers/userController')
const userMiddleware=require('../middleware/userMiddleware')
router.use(bodyparser.urlencoded({extended:true}))
const userAuth=require('../middleware/user_jwt')
// const { route } = require('./adminRoute')




router.get('/',userController.homepage)


router.get('/login',userMiddleware,userController.loginPage)
router.post('/login',userController.loginPostPage)

router.get('/logOut',userAuth,userController.logOut)


router.get('/sign',userMiddleware,userController.signUpPage)
router.post('/signup',userController.signUp)

router.get('/product',userController.productGet)

router.get('/singleProduct/:id', userController.singleProduct);

router.get('/cart',userAuth,userController.cart)
router.post('/cart/add',userAuth,userController.cartAdd);


router.get('/profile',userAuth,userController.profile)




module.exports=router
