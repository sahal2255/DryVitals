const User =require('../models/user')
const bcrypt=require('bcrypt')
const { application } = require('express')
const jwt=require('jsonwebtoken')

require('dotenv').config()



//------- getting homepage -----
let homepage=(req,res)=>{
    res.render('user/index')
}



//-------- getting loginPage ---------
let loginPage=async(req,res)=>{
    // if(req.cookies.jwt){
        // return res.redirect('/')
    // }
    console.log('loginpage get');
    res.render('user/login',{error:''})
}




// user login section

let loginPostPage=async(req,res)=>{
    const {email,password} = req.body

    try{
        const user = await User.findOne({email})
        
        if(!user){
            return res.status(404).json({error:'user not found'})
        }
        const validPassword = await bcrypt.compare(password,user.password)
        if(!validPassword){
            return res.status(401).json({error:'invalid password'})
        }
        const token = jwt.sign( 
            {
                id:user._id,
                name:user.userName,
                email:user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn:'24h'
            }
        );
        // console.log(token);
        res.cookie("user_jwt", token, { httpOnly: true, maxAge: 86400000 }); // 24 hour expiry

        // res.status(200).json({ message: "Login successful", token });
        res.redirect('/')
        console.log("user logged in with email and password ");
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    };


// ----end login section



// user logout section


let logOut=async(req,res)=>{
    res.clearCookie('user_jwt')
    console.log('logout success');
    res.redirect('/')
}


// ----end user logout section











//--------- getting signUpPage ---------
let signUpPage=async(req,res)=>{
    res.render('user/sign')
}





// user signing section


let signUp=async(req,res)=>{
    try{
        const {userName,email,password,phoneNumber}= req.body;
        
        const hashPassword = await bcrypt.hash(password,10)
        const newUser = new User({
            userName,
            email,
            phoneNumber,
            password: hashPassword,
          });
        await newUser.save()

        const user=await User.findOne({email})

        const token = jwt.sign(
            {
                id:user._id,
                name:user.userName,
                email:user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h",
              }
        );
        res.cookie("jwt", token, { httpOnly: true, maxAge: 86400000 }); // 24 hour expiry

        console.log("New user created:", newUser);
        return res.redirect('/')
      } 
     catch (error) {
      console.error("Verification failed:", error);
      res
        .status(500)
        .json({ error: "Verification failed. Please try again later." });
    }
  };



//   -----end user signin section




//   get user profile page

  let profile=async(req,res)=>{

    let userId=req.user.id
    let user=await User.findOne({_id:userId})
    // console.log(user);
    if(!user){
        return res.status(400).send('user not found')
    }
   return res.render('user/profile',{user})
   
  }

// ----end profile page section







module.exports={
    homepage,
    loginPage,
    signUpPage,
    signUp,
    loginPostPage,
    logOut,
    profile
}


