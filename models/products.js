const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    variant: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    
    imageUrl:{ type: Array }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
