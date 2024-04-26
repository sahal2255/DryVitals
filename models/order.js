const { isCancel } = require('axios');
const { type } = require('jquery');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    
    cart: {
        total: { type: Number},
        totalmrp: { type: Number },
        product: [{
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number },
            productName:{type:String},
            productVariant: { type: String },
            productPrice: { type: Number }
        }]
    },
    selectedPincode:{
        type:Number
    },
    selectedPaymentMethod:{
        type:String
    },
    status:{
        type:String,
        default:'OrderPlaced'
    },
    totalAmount:{type:Number},
    createdAt: {
        type: Date,
        default: Date.now 
    },
    isCancel:{
        type:Boolean,
        defaul:false
    }

    
});

// Create a model from the schema
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

