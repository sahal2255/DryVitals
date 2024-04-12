const { type } = require('jquery');
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
    isDisabled:{
        type:Boolean,
        default:false
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
            productmrp:{
                type:Number,
                required: true
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
            default:0
        },
        totalmrp:{
            type:Number,
            default:0
        }
    },
    wishlist: {
        product:[{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        productImage: {
            type: [String]
        },
        productName: {
            type: String
        },
        productPrice: {
            type: Number
        },
        productVariant: {
            type: String
        }
    }]
}
});

const User=mongoose.model('User',userSchema)

module.exports=User