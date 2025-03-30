// Import required dependencies
const nodemailer = require('nodemailer');
const redisClient = require('../config/redis');

// Create email transporter using SMTP configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // Use SSL if port is 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Email Service class for handling email operations
class EmailService {
    // Add email to Redis queue for processing
    static async addToQueue(emailData) {
        try {
            // Generate unique ID for the email
            const emailId = Date.now().toString();
            
            // Store email data in Redis with 24-hour expiration
            await redisClient.set(
                `email:${emailId}`,
                JSON.stringify(emailData),
                'EX',
                24 * 60 * 60 // 24 hours in seconds
            );
            
            // Add email ID to processing queue
            await redisClient.lPush('email:queue', emailId);
            
            console.log(`Email added to queue: ${emailId}`);
            return emailId;
        } catch (error) {
            console.error('Error adding email to queue:', error);
            throw error;
        }
    }

    // Process emails from the queue
    static async processQueue() {
        try {
            // Get next email ID from queue
            const emailId = await redisClient.rPop('email:queue');
            
            if (!emailId) {
                return; // No emails in queue
            }

            // Get email data from Redis
            const emailData = await redisClient.get(`email:${emailId}`);
            
            if (!emailData) {
                console.log(`Email data not found: ${emailId}`);
                return;
            }

            const { to, subject, text, html } = JSON.parse(emailData);

            // Send email using nodemailer
            await transporter.sendMail({
                from: process.env.SMTP_USER,
                to,
                subject,
                text,
                html
            });

            // Remove email data from Redis after successful sending
            await redisClient.del(`email:${emailId}`);
            
            console.log(`Email sent successfully: ${emailId}`);
        } catch (error) {
            console.error('Error processing email:', error);
            
            // If email processing fails, add it back to queue
            if (emailId) {
                await redisClient.lPush('email:queue', emailId);
                console.log(`Failed email added back to queue: ${emailId}`);
            }
        }
    }

    // Send email immediately without queue
    static async sendEmail(emailData) {
        try {
            const { to, subject, text, html } = emailData;
            
            await transporter.sendMail({
                from: process.env.SMTP_USER,
                to,
                subject,
                text,
                html
            });
            
            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}

// Export EmailService class
module.exports = EmailService; 