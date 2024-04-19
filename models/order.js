const { type } = require('jquery');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    userAddress: {
        name: { type: String },
        email: { type: String },
        phoneNumber: { type: String },
        district: { type: String},
        place: { type: String },
        address: { type: String },
        pincode: { type: String },
        // hasAddress: { type: Boolean, required: true }
    },
    cart: {
        total: { type: Number},
        totalmrp: { type: Number },
        product: [{
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number },
            productVariant: { type: String },
            productPrice: { type: Number }
        }]
    },
    selectedPaymentMethod:{
        type:String
    }
});

// Create a model from the schema
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

