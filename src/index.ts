// Import required modules
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes'; 
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler';


// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Use morgan middleware
app.use(morgan('dev'));

// Enable CORS for cross-origin requests
app.use(cors());

// Handle raw body for Stripe Webhook
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));


// Middleware to parse JSON bodies from HTTP requests
app.use(express.json());


// Use the centralized router for all /api routes
app.use('/api', routes);


// 404 handler
app.use((req, res, next) => {
  const error: any = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Error handler
app.use(errorHandler);

// Set the port from environment or use 3000 as default
const PORT =parseInt(process.env.PORT || '3000' );

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('MongoDB connected'); // Log successful DB connection
  })
  .catch(err => console.error('DB connection failed', err)); // Log DB connection error
  app.listen(PORT,'0.0.0.0', () => console.log(`Server running on port ${PORT}`)); // Start server
