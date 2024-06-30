// logger.js

import winston from 'winston';

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        // Write all logs with level `error` and below to `error.log`
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Write all logs with level `info` and below to `combined.log`
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

// If we're not in production, log to the console with the format:
// `${timestamp} ${level}: ${message}`
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            logFormat
        ),
    }));
}

// Create a stream object with a 'write' function that will be used by morgan
logger.stream = {
    write: (message) => logger.info(message.trim()),
};

export default logger;