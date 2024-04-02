const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String
    },
    cart:{
        product:[{
            productId:{
                type:mongoose.Schema.ObjectId,
                ref:'product'
            },
            productImage:{
                type:[String]
            },
            productName:{
                type:String
            },
            productPrice:{
                type:Number
            },
            productVariant:{
                type:String
            },
            quantity:{
                type:Number,default:1
            }
        }],
        total:{
            type:Number,
            required:true,
        }
    }
})

const User=mongoose.model('User',userSchema)

module.exports=User