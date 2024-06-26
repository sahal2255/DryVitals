const { type } = require('jquery');
const mongoose=require('mongoose')
const bcrypt=require('bcrypt')

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
        }
        
    }]
},

userAddress:[{

    district:{
        type:String,
        required:true
    },
    place:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    pincode:{
        type:String,
        required:true
    },
    hasAddress:{
        type:Boolean,
        default:false
    }

}]

});
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};


const User=mongoose.model('User',userSchema)

module.exports=User