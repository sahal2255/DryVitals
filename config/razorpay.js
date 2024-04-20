const { response } = require("express");
const Razorpay = require("razorpay")

const razorpay = new Razorpay({
    key_id :'rzp_test_1bD9cj9uL4sy4Y',
    key_secret:  '7tMWK4GYRa7UuOOqSHmgsao3',
})

module.exports = razorpay;
