const express=require('express')

const bodyParser=require('body-parser')
const path=require('path')
const mongoose=require('mongoose')
const cookieParser=require('cookie-parser')
const userRoute=require('./routes/userRoute')
const adminRoute=require('./routes/adminRoute')
const app=express()
const session = require('express-session');
const Razorpay=require('razorpay')
require('dotenv').config();



app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// app.use((req,res,next)=>{
//   res.status(404).render('user/forNotFound')

// })



app.use(express.static('public'))
app.use(express.static(path.join(__dirname,'views')))
app.use(express.urlencoded({extended:true}))
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.set('view engine','hbs')
app.use(bodyParser.json());
// app.use(express.json());

app.use('/',userRoute)

app.use(adminRoute)


mongoose.connect(process.env.MONGODB_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});



const PORT = process.env.PORT || 3000 ;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});