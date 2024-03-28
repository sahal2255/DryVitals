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
                type:String
            },
            productVariant:{
                type:String
            },
            quantity:{
                type:String,default:1
            }
        }],
        total:{
            type:String
        }
    }
})

const User=mongoose.model('User',userSchema)

module.exports=User