"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import required modules
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const morgan_1 = __importDefault(require("morgan"));
const errorHandler_1 = require("./middlewares/errorHandler");
// Load environment variables from .env file
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
// Use morgan middleware
app.use((0, morgan_1.default)('dev'));
// Enable CORS for cross-origin requests
app.use((0, cors_1.default)());
// Handle raw body for Stripe Webhook
app.use('/api/payments/webhook', express_1.default.raw({ type: 'application/json' }));
// Middleware to parse JSON bodies from HTTP requests
app.use(express_1.default.json());
// Use the centralized router for all /api routes
app.use('/api', routes_1.default);
// 404 handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
});
// Error handler
app.use(errorHandler_1.errorHandler);
// Set the port from environment or use 3000 as default
const PORT = process.env.PORT || 3000;
// Connect to MongoDB and start the server
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => {
    console.log('MongoDB connected'); // Log successful DB connection
})
    .catch(err => console.error('DB connection failed', err)); // Log DB connection error
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start server
