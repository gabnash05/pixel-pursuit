import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet()); // Sets various security headers
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Body Parsing
app.use(express.json({ limit: '10kb' })); // Prevent DOS attacks with large payloads
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', router);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Central Error Handling
app.use(errorHandler);

export default app;