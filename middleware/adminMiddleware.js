const { error } = require('jquery');
const jwt=require('jsonwebtoken')
require('dotenv').config()

const adminMiddleware = (req, res, next) => {
    const token = req.cookies.admin_jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                next();
            } else {
                res.redirect('/admin/index'); 
            }
        });
    } else {
        next();
    }
};
module.exports=adminMiddleware