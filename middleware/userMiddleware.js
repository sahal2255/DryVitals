const jwt = require('jsonwebtoken');
require('dotenv').config();

const userMiddleware = (req, res, next) => {
    const token = req.cookies.user_jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                next(); 
            } else {
                res.redirect('/');
            }
        });
    } else {
        next(); 
    }
};

module.exports = userMiddleware;
