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


app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// const razorpay = new Razorpay({
//   key_id: 'rzp_test_1bD9cj9uL4sy4Y',
//   key_secret: '7tMWK4GYRa7UuOOqSHmgsao3'
// });



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


mongoose.connect('mongodb://localhost:27017/DryVitals')
.then(()=>{
    console.log('connected mongodb');
})
.catch(()=>{
    console.log('error');
})


const PORT = process.env.PORT || 3000 ;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});