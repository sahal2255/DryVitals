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
router.post('/cart/incrementQuantity/:id',userAuth,userController.incrementQuantityServer)
router.post('/cart/decrementQuantity/:id', userAuth, userController.decrementQuantity);


// router.get('/filteredProducts',userController.filterProducts)
// router.post('/product/sortProducts',userController.sortProducts)

// router.post('/product/sortProducts',userController.sortProducts);


router.post('/wishlist/add',userAuth,userController.wishlistAdd)
router.get('/wishlist',userAuth,userController.wishlistGet)
router.delete('/wishlist/delete-wishlist/:id',userAuth,userController.wishlistdelete)



router.post('/cart/wishlist-cart/:id',userAuth,userController.wishlisttoCart)



router.post('/product/sortAndFilterProducts',userController.sortAndFilterProducts)


router.post('/saveAddress',userAuth,userController.saveAddress)
router.get('/saveAddress',userAuth,userController.saveAddress)


router.get('/profile',userAuth,userController.profile)


router.get('/checkOut',userAuth,userController.checkOut)
router.get('/orders',userAuth,userController.saveAddress)

router.post('/placeOrder',userAuth,userController.placeOrder)

router.get('/order',userAuth,userController.order)

router.post('/razorpay/placeOrder',userAuth,userController.razorpaypayment)
router.get('/singleOrderDetails/:orderId',userAuth,userController.singleOrderDetails)
router.put('/orders/:orderId',userAuth,userController.cancelOrder)

router.post('/product/search',userController.searchPro)


router.post('/profile/editaddress/:addressId',userAuth,userController.editUserAddress)
router.get('/profile/editaddress/:addressId',userAuth,userController.editaddressGet)

router.delete('/profile/deleteAddress/:addressId',userAuth,userController.deleteAddress)
router.post('/profile/editDetails/:userId', userAuth, userController.editDetails);

router.get('/summary',userAuth,userController.summary)

module.exports=router
