const express=require('express')

const bodyParser=require('body-parser')
const path=require('path')
const mongoose=require('mongoose')
const cookieParser=require('cookie-parser')
const userRoute=require('./routes/userRoute')
const adminRoute=require('./routes/adminRoute')
const app=express()
const session = require('express-session');


app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
// app.use(session({
//   secret: 'your-secret-key',
//   resave: false,
//   saveUninitialized: true
// }));

// app.post('/session/setCategory', (req, res) => {
//   const { category } = req.body;
//   req.session.selectedCategory = category;
//   console.log(req.body);
//   res.sendStatus(200);
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


const PORT = process.env.PORT || 4251;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});