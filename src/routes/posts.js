const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const redisClient = require('../config/redis');
const authenticateToken = require('../middleware/auth');
const EmailService = require('../services/emailService');

// Get all posts
router.get('/', authenticateToken, async (req, res) => {
    try {
        const posts = await redisClient.keys('post:*');
        const postsData = await Promise.all(
            posts.map(async (postKey) => {
                return await redisClient.hGetAll(postKey);
            })
        );
        res.render('posts/index', { 
            title: 'Blog Posts',
            posts: postsData
        });
    } catch (error) {
        res.render('posts/index', { 
            title: 'Blog Posts',
            error: error.message
        });
    }
});

// New post form
router.get('/new', authenticateToken, (req, res) => {
    res.render('posts/new', { title: 'New Post' });
});

// Create new post
router.post('/', authenticateToken, [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('posts/new', { 
            title: 'New Post',
            errors: errors.array(),
            title: req.body.title,
            content: req.body.content
        });
    }

    const { title, content } = req.body;
    const postId = Date.now().toString();

    try {
        await redisClient.hSet(`post:${postId}`, {
            title,
            content,
            author: req.user.email,
            createdAt: new Date().toISOString()
        });

        const users = await redisClient.keys('user:*');
        const userEmails = await Promise.all(
            users.map(async (userKey) => {
                const user = await redisClient.hGetAll(userKey);
                return user.email;
            })
        );

        await EmailService.addToQueue(
            'New Blog Post',
            `A new post "${title}" has been created by ${req.user.email}`,
            userEmails
        );

        req.flash('success', 'Post created successfully!');
        res.redirect('/posts');
    } catch (error) {
        res.render('posts/new', { 
            title: 'New Post',
            error: error.message,
            title: req.body.title,
            content: req.body.content
        });
    }
});

module.exports = router; 