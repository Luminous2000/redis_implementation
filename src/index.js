// Load environment variables from .env file
require('dotenv').config();

// Import required dependencies
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const redisClient = require('./config/redis');
const EmailService = require('./services/emailService');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express application
const app = express();
const port = process.env.PORT || 3000;

// Configure view engine and layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Configure middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Parse Cookie header
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(flash()); // Enable flash messages

// Configure session middleware with Redis store
app.use(session({
    store: new RedisStore({ client: redisClient }), // Use Redis for session storage
    secret: process.env.SESSION_SECRET, // Secret key for session encryption
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true, // Prevent JavaScript access to cookies
        maxAge: 24 * 60 * 60 * 1000 // Session cookie expires in 24 hours
    }
}));

// Flash messages middleware to make messages available to views
app.use((req, res, next) => {
    res.locals.success = req.flash('success'); // Success messages
    res.locals.error = req.flash('error'); // Error messages
    next();
});

// Define application routes
app.use('/', require('./routes/index')); // Main routes
app.use('/auth', require('./routes/auth')); // Authentication routes
app.use('/posts', require('./routes/posts')); // Blog post routes

// Global error handling middleware
app.use(errorHandler);

// 404 handler - catch all unmatched routes
app.use((req, res) => {
    res.status(404).render('error', { 
        message: 'Page not found',
        error: { status: 404 }
    });
});

// Connect to MongoDB database
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 