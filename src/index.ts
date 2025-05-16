// Import required modules
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Enable CORS for cross-origin requests
app.use(cors());

// Middleware to parse JSON bodies from HTTP requests
app.use(express.json());

// Define routes
// All routes starting with /api/auth will be handled by authRoutes
app.use('/api/auth', authRoutes);

// Set the port from environment or use 5000 as default
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('MongoDB connected'); // Log successful DB connection
  })
  .catch(err => console.error('DB connection failed', err)); // Log DB connection error
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start server
