const jwt=require('jsonwebtoken')
require('dotenv').config()

let userAuth=async(req,res,next)=>{
    const token=req.cookies.user_jwt
    // console.log('token',token);
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


