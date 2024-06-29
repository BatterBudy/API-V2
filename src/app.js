import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import authRoutes from './routes/authRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminInterestRoutes from './routes/admin/interestRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';

const app = express();

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database');
        connection.release();
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
}

testConnection();

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use("/otp", otpRoutes);
app.use('/user', authMiddleware, userRoutes);

//Admin routes
app.use('/admin/interest', authMiddleware, adminInterestRoutes);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Make the pool available globally
app.locals.db = pool;

export default app;