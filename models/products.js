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
    
    stock:[{
        variant:{
            type:String,
            required:true
        },
        stock:{
            type:Number,
            required:true
        },
        price:{
            type:Number,
            required:true
        }
    }],
    isDisabled: {
        type: Boolean,
        default: false
    },
    
    imageUrl:{ type: Array }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
