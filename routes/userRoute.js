const express=require('express')
const router=express.Router()
const bodyparser=require('body-parser')
const userController=require('../controllers/userController')
const userMiddleware=require('../middleware/userMiddleware')
router.use(bodyparser.urlencoded({extended:true}))
const userAuth=require('../middleware/user_jwt')
const axios = require('axios');
// const { route } = require('./adminRoute')




router.get('/',userController.homepage)


router.get('/login',userMiddleware,userController.loginPage)
router.post('/login',userController.loginPostPage)

router.get('/logOut',userAuth,userController.logOut)


router.get('/sign',userMiddleware,userController.signUpPage)
router.post('/signup',userController.signUp)

router.get('/product',userController.productGet)

router.get('/singleProduct/:id', userController.singleProduct);

router.post('/cart/:id',userAuth,userController.cartAdd);
router.get('/cart',userAuth,userController.cart)


router.delete('/cart/delete-product/:id',userAuth,userController.deleteCart)
router.post('/cart/incrementQuantity/:id',userAuth,userController.incrementQuantity)
router.post('/cart/decrementQuantity/:id', userAuth, userController.decrementQuantity);


router.get('/filteredProducts',userController.filterProducts)
// router.post('/filteredProducts',userController.filteredProducts)
// router.get('/cart/getProductPrice/:id',userAuth,userController.getProductPrice)
// router.put('/cart/update-price/:id',userAuth,userController.priceUpdate)

router.get('/profile',userAuth,userController.profile)




module.exports=router
