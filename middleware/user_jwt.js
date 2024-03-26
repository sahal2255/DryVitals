// const jwt=require('jsonwebtoken')
// require('dotenv').config()

// let userAuth=async(req,res,next)=>{
//     const token=req.cookies.user_jwt
//     // console.log('token',token);
//     if(token){
//         jwt.verify(token,process.env.JWT_SECRET,(err,decodedToken)=>{
//             if(err){
//                return res.redirect('/login')
//             }else{
//                 req.user=decodedToken
//                 next()
//             }
//         })
//     }else{
//         res.redirect('/login')
//         console.log('this is errpr');
//     }
// }



// module.exports=userAuth





const jwt = require('jsonwebtoken');
require('dotenv').config();

let userAuth = async (req, res, next) => {
    const token = req.cookies.user_jwt;
    // console.log('token',token);
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                // If token is invalid or expired, redirect to login page
                return res.redirect('/login');
            } else {
                // Token is valid, user is authenticated
                req.user = decodedToken;
                next();
            }
        });
    } else {
        // If token doesn't exist, allow access to login or signup routes without redirection
        if (req.path === '/login' || req.path === '/signup') {
            next();
        } else {
            // Redirect to login page for other routes
            res.redirect('/login');
        }
    }
};

module.exports = userAuth;
