const jwt=require('jsonwebtoken')
require('dotenv').config()

let userAuth=async(req,res,next)=>{
    const token=req.cookies.user_jwt
    console.log('token',token);
    if(token){
        jwt.verify(token,process.env.JWT_SECRET,(err,decodedToken)=>{
            if(err){
               return res.redirect('/login')
            }else{
                req.user=decodedToken
                next()
            }
        })
    }else{
        res.redirect('/login')
        console.log('this is errpr');
    }
}



module.exports=userAuth










// Middleware for user authentication
// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// const userAuth = async (req, res, next) => {
//     const token = req.cookies.jwt;
//     if (token) {
//         try {
//             const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//             const user = await User.findById(decodedToken.id);
//             if (user) {
//                 req.user = user; 
//                 next(); 
//             } else {
//                 res.redirect('/login'); 
//             }
//         } catch (err) {
//             res.redirect('/login'); 
//         }
//     } else {
//         res.redirect('/login'); 
//     }
// };

// Profile route handler
// const profile = (req, res) => {
//     const user = req.user;
//     res.render('user/profile', { user }); 
// };

// module.exports = { userAuth, profile };
