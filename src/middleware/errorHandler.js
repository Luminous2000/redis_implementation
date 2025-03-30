// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    // Log error stack trace for debugging
    console.error(err.stack);

    // Handle Redis connection errors
    if (err.code === 'ECONNREFUSED' && err.syscall === 'connect') {
        return res.status(503).json({
            error: 'Service temporarily unavailable',
            message: 'Database connection error'
        });
    }

    // Handle JWT authentication errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Token expired'
        });
    }

    // Handle validation errors from express-validator
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Bad Request',
            message: err.message
        });
    }

    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
        return res.status(409).json({
            error: 'Conflict',
            message: 'Duplicate key error'
        });
    }

    // Handle file upload errors
    if (err.name === 'MulterError') {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'File upload error',
            details: err.message
        });
    }

    // Default error response for unhandled errors
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

// Export error handler middleware
module.exports = errorHandler; 