const express=require('express')
const router=express.Router()
const bodyparser=require('body-parser')
const userController=require('../controllers/userController')
const userMiddleware=require('../middleware/userMiddleware')
router.use(bodyparser.urlencoded({extended:true}))
const  {userAuth,middleware}=require('../middleware/user_jwt')
const axios = require('axios');
// const { route } = require('./adminRoute')




router.get('/',userController.homepage)


router.get('/login',userMiddleware,userController.loginPage)
router.post('/login',userController.loginPostPage)

router.get('/logOut',userAuth,userController.logOut)


router.get('/sign',userMiddleware,userController.signUpPage)
router.post('/signup',userController.signUp)

router.get('/product',middleware,userController.productGet)

router.get('/singleProduct/:id', userController.singleProduct);

router.post('/cart/:id',userAuth,userController.cartAdd);
router.get('/cart',userAuth,userController.cart)


router.delete('/cart/delete-product/:id',userAuth,userController.deleteCart)
router.post('/cart/incrementQuantity/:id',userAuth,userController.incrementQuantity)
router.post('/cart/decrementQuantity/:id', userAuth, userController.decrementQuantity);


// router.get('/filteredProducts',userController.filterProducts)
// router.post('/product/sortProducts',userController.sortProducts)

router.post('/product/sortProducts',userController.sortProducts);


router.post('/wishlist/add',userAuth,userController.wishlistAdd)
router.get('/wishlist',userAuth,userController.wishlistGet)
router.delete('/wishlist/delete-wishlist/:id',userAuth,userController.wishlistdelete)


//single product checkout

// router.post('/checkOut',userAuth,userController.checkOut)
// router.get('/checkOut',userAuth,userController.checkOut)

router.get('/profile',userAuth,userController.profile)


router.get('/checkOut',userAuth,userController.checkOut)




module.exports=router
