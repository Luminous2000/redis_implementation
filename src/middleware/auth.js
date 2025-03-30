// Import required dependencies
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

// Authentication middleware to protect routes
const auth = async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.token;

        // Check if token exists
        if (!token) {
            req.flash('error', 'Please login to access this page');
            return res.redirect('/auth/login');
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user data from Redis using decoded user ID
        const userData = await redisClient.get(`user:${decoded.userId}`);

        // Check if user exists in Redis
        if (!userData) {
            req.flash('error', 'User session expired. Please login again');
            return res.redirect('/auth/login');
        }

        // Parse user data and attach to request object
        const user = JSON.parse(userData);
        req.user = user;
        next();
    } catch (error) {
        // Handle token verification errors
        if (error.name === 'JsonWebTokenError') {
            req.flash('error', 'Invalid token. Please login again');
            return res.redirect('/auth/login');
        }

        // Handle token expiration errors
        if (error.name === 'TokenExpiredError') {
            req.flash('error', 'Session expired. Please login again');
            return res.redirect('/auth/login');
        }

        // Handle other errors
        console.error('Auth middleware error:', error);
        req.flash('error', 'Authentication error. Please try again');
        res.redirect('/auth/login');
    }
};

// Export authentication middleware
module.exports = auth; 