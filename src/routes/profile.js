// Import required dependencies
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const redisClient = require('../config/redis');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const profileValidation = [
    body('email').isEmail().withMessage('Please enter a valid email')
];

const passwordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Passwords do not match');
        }
        return true;
    })
];

// Route to update profile
router.put('/update', auth, profileValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { email } = req.body;
        const currentUser = req.user.email;

        // Check if email is already taken by another user
        if (email !== currentUser) {
            const existingUser = await redisClient.get(`user:${email}`);
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Get current user data
        const userData = await redisClient.get(`user:${currentUser}`);
        const user = JSON.parse(userData);

        // Update user email
        user.email = email;
        user.updatedAt = Date.now();

        // Store updated user data
        await redisClient.set(`user:${email}`, JSON.stringify(user));

        // If email changed, delete old user data
        if (email !== currentUser) {
            await redisClient.del(`user:${currentUser}`);
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Route to change password
router.put('/change-password', auth, passwordValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { currentPassword, newPassword } = req.body;
        const userEmail = req.user.email;

        // Get user data
        const userData = await redisClient.get(`user:${userEmail}`);
        const user = JSON.parse(userData);

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user password
        user.password = hashedPassword;
        user.updatedAt = Date.now();

        // Store updated user data
        await redisClient.set(`user:${userEmail}`, JSON.stringify(user));

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
});

// Export router
module.exports = router; 
