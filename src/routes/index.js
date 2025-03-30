// Import required dependencies
const express = require('express');
const router = express.Router();
const redisClient = require('../config/redis');
const auth = require('../middleware/auth');

// Route to display home page
router.get('/', async (req, res) => {
    try {
        // Get latest posts from Redis
        const postIds = await redisClient.lRange('posts:list', 0, 5); // Get latest 5 posts
        const posts = await Promise.all(
            postIds.map(async (id) => {
                const postData = await redisClient.get(`post:${id}`);
                return JSON.parse(postData);
            })
        );

        res.render('index', {
            title: 'Home',
            posts
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        req.flash('error', 'Error loading posts');
        res.render('index', {
            title: 'Home',
            posts: []
        });
    }
});

// Route to display user dashboard
router.get('/dashboard', auth, async (req, res) => {
    try {
        // Get user's posts from Redis
        const postIds = await redisClient.lRange('posts:list', 0, -1);
        const posts = await Promise.all(
            postIds.map(async (id) => {
                const postData = await redisClient.get(`post:${id}`);
                const post = JSON.parse(postData);
                return post.author === req.user.email ? post : null;
            })
        );

        // Filter out null values and sort by creation date
        const userPosts = posts.filter(post => post !== null)
            .sort((a, b) => b.createdAt - a.createdAt);

        res.render('dashboard', {
            title: 'Dashboard',
            user: req.user,
            posts: userPosts
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        req.flash('error', 'Error loading dashboard');
        res.redirect('/');
    }
});

// Route to display search results
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.redirect('/');
        }

        // Get all posts from Redis
        const postIds = await redisClient.lRange('posts:list', 0, -1);
        const posts = await Promise.all(
            postIds.map(async (id) => {
                const postData = await redisClient.get(`post:${id}`);
                return JSON.parse(postData);
            })
        );

        // Filter posts based on search query
        const searchResults = posts.filter(post => 
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.content.toLowerCase().includes(query.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        res.render('search', {
            title: 'Search Results',
            query,
            posts: searchResults
        });
    } catch (error) {
        console.error('Search error:', error);
        req.flash('error', 'Error performing search');
        res.redirect('/');
    }
});

// Export router
module.exports = router; 