const mongoose=require('mongoose')
const productSchema=new mongoose.Schema({

    
    categories:[{
        catagoryName:{
            type:String,
            required:true
        }
    }]
})

const Product =mongoose.model('products',productSchema)

module.exports=Product
