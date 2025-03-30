# Blog Application with Redis and MongoDB

A modern blog application built with Express.js, Redis, and MongoDB, featuring real-time notifications, user authentication, and post management.

## Features

- User Authentication (Login/Register)
- Post Creation and Management
- Real-time Notifications
- Search Functionality
- User Profiles
- Form Validation
- Responsive Design
- Redis Session Management
- Email Service Integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blog-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blog_app
REDIS_HOST=localhost
REDIS_PORT=6379
SESSION_SECRET=your-super-secret-key
JWT_SECRET=your-jwt-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

4. Start MongoDB and Redis services

5. Run the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Project Structure

```
project/
├── src/
│   ├── config/
│   │   └── redis.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.js
│   │   └── posts.js
│   ├── services/
│   │   └── emailService.js
│   └── index.js
├── views/
│   ├── layout.ejs
│   └── partials/
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── .env
└── package.json
```

## Dependencies

### Main Dependencies
- express
- dotenv
- ejs
- express-ejs-layouts
- mongoose
- redis
- connect-redis
- bcryptjs
- jsonwebtoken
- express-session
- cookie-parser
- cors
- express-validator
- connect-flash
- nodemailer
- moment
- multer

### Development Dependencies
- nodemon

## API Endpoints

### Authentication
- POST /auth/register - User registration
- POST /auth/login - User login
- GET /auth/logout - User logout

### Posts
- GET /posts - Get all posts
- POST /posts - Create new post
- GET /posts/:id - Get single post
- PUT /posts/:id - Update post
- DELETE /posts/:id - Delete post

### User Profile
- GET /profile - Get user profile
- PUT /profile - Update user profile
- GET /profile/:id - Get other user's profile

### Search
- GET /search - Search posts and users

## Features in Detail

### Authentication
- JWT-based authentication
- Redis session management
- Password hashing with bcrypt
- Form validation

### Posts
- CRUD operations
- Image upload support
- Like and comment functionality
- Infinite scroll

### Real-time Features
- WebSocket notifications
- Live updates
- Email notifications

### Security
- XSS protection
- CSRF protection
- Input sanitization
- Secure session handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@example.com or create an issue in the repository. 