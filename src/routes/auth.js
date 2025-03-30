const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const EmailService = require('../services/emailService');

// Validation middleware for registration
const registerValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    })
];

// Validation middleware for login
const loginValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

// Route to display registration form
router.get('/register', (req, res) => {
    res.render('auth/register', { title: 'Register' });
});

// Route to handle user registration
router.post('/register', registerValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('auth/register', {
                title: 'Register',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check if user already exists in Redis
        const existingUser = await redisClient.get(`user:${email}`);
        if (existingUser) {
            req.flash('error', 'Email already registered');
            return res.redirect('/auth/register');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user object
        const user = {
            email,
            password: hashedPassword,
            createdAt: Date.now()
        };

        // Store user in Redis
        await redisClient.set(`user:${email}`, JSON.stringify(user));

        // Send welcome email
        await EmailService.addToQueue({
            to: email,
            subject: 'Welcome to Our Blog',
            text: 'Thank you for registering with our blog platform!',
            html: '<h1>Welcome to Our Blog</h1><p>Thank you for registering with our blog platform!</p>'
        });

        req.flash('success', 'Registration successful. Please login.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'Registration failed. Please try again.');
        res.redirect('/auth/register');
    }
});

// Route to display login form
router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Login' });
});

// Route to handle user login
router.post('/login', loginValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('auth/login', {
                title: 'Login',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Get user from Redis
        const userData = await redisClient.get(`user:${email}`);
        if (!userData) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        const user = JSON.parse(userData);

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        req.flash('success', 'Login successful');
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Login failed. Please try again.');
        res.redirect('/auth/login');
    }
});

// Route to handle user logout
router.get('/logout', auth, (req, res) => {
    // Clear token cookie
    res.clearCookie('token');
    req.flash('success', 'Logged out successfully');
    res.redirect('/auth/login');
});

// Export router
module.exports = router; 