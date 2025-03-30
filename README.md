# Blog Application with Redis and MongoDB

A modern blog application built with Express.js, Redis for caching, and MongoDB for data storage. Features include user authentication, blog post management, and email notifications.

## Features

- User authentication with JWT
- Blog post creation, editing, and deletion
- Image upload support
- Redis caching for improved performance
- Email notifications for user actions
- Responsive design
- Search functionality
- Pagination
- Flash messages
- Error handling

## Prerequisites

- Node.js (v14 or higher)
- Redis server
- MongoDB server
- SMTP server (for email notifications)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/redis-blog-app.git
cd redis-blog-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
SESSION_SECRET=your-super-secret-key
JWT_SECRET=your-jwt-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
MONGODB_URI=mongodb://localhost:27017/blog_app
```

4. Start Redis and MongoDB servers

5. Run the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Project Structure

```
redis-blog-app/
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   └── services/
├── views/
│   ├── auth/
│   ├── posts/
│   └── partials/
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 