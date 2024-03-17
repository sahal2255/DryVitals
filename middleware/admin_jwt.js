const jwt=require('jsonwebtoken')
require('dotenv').config()

let adminAuth=async(req,res,next)=>{
    const token=req.cookies.admin_jwt
    console.log('token',token);
    if(token){
        jwt.verify(token,process.env.JWT_SECRET,(err,decodedToken)=>{
            if(err){
               return res.redirect('/admin/login')
            }else{
                req.admin=decodedToken
                next()
            }
        })
    }else{
        res.redirect('/admin/login')
        console.log('this is errpr');
    }
}


module.exports=adminAuth
