const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, 
        quantity: { type: Number, required: true }, 
        variant: { type: String },
        price: { type: Number, required: true } 
    }],
    userAddress: { type: String, required: true }, 
    paymentMethod: { type: String, required: true }, 
    createdAt: { type: Date, default: Date.now } 
});

// Create a model from the schema
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
