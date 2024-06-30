// errorMiddleware.js
import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
    // Log the error
    logger.error(`${err.name}: ${err.message}\nStack: ${err.stack}`);

    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Determine the status code
    const statusCode = err.statusCode || 500;

    // Prepare the error response
    const errorResponse = {
        success: false,
        error: {
            message: err.message || 'An unexpected error occurred',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    };

    // Handle specific types of errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            ...errorResponse,
            error: {
                ...errorResponse.error,
                details: err.errors
            }
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            ...errorResponse,
            error: {
                ...errorResponse.error,
                message: 'Invalid token'
            }
        });
    }

    // Send the error response
    res.status(statusCode).json(errorResponse);
};

export default errorMiddleware;