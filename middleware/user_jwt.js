
const jwt = require('jsonwebtoken');
require('dotenv').config();

let userAuth = async (req, res, next) => {
    const token = req.cookies.user_jwt;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                return res.redirect('/login');
            } else {
                req.user = decodedToken;
                next();
            }
        });
    } else {
        if (req.path === '/login' || req.path === '/signup') {
            next();
        } else {
            res.redirect('/login');
        }
    }
};
const middleware = async (req, res, next) => {
    if (req.cookies.user_jwt) {
        const token = req.cookies.user_jwt;
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
                return res.redirect('/login');
            } else {
                req.user = decodedToken;
                next();
            }
        });
    } else {
        // If token is not available, proceed to the next middleware or route handler
        next();
    }
}


module.exports = {userAuth,middleware};
