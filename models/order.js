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
    selectedPaymentMethod:{
        type:String
    },
    totalAmount:{type:Number},
    createdAt: {
        type: Date,
        default: Date.now // Set default value to current date/time
    }

    
});

// Create a model from the schema
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

