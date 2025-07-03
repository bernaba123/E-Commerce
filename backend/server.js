import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
// import rateLimit from 'express-rate-limit'; // DISABLED
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import requestRoutes from './routes/requests.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

// Import tracking simulation for demo
import { startTrackingSimulation } from './utils/trackingSimulator.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Make io instance available to controllers
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join order tracking room
  socket.on('join_order_tracking', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`User ${socket.id} joined tracking for order ${orderId}`);
  });

  // Leave order tracking room
  socket.on('leave_order_tracking', (orderId) => {
    socket.leave(`order_${orderId}`);
    console.log(`User ${socket.id} left tracking for order ${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// CORS configuration - must be before other middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// Rate limiting - DISABLED for development
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (for uploaded avatars)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Database connection status
let isDbConnected = false;

// Connect to MongoDB with error handling
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');
    isDbConnected = true;
    
    // Start tracking simulation for demo purposes
    if (process.env.NODE_ENV !== 'production') {
      startTrackingSimulation(io);
    }
  } catch (error) {
    console.warn('MongoDB connection failed:', error.message);
    console.log('Server will start without database connection.');
    console.log('To connect to MongoDB:');
    console.log('1. Set up MongoDB Atlas (cloud) or install MongoDB locally');
    console.log('2. Update MONGODB_URI in your .env file');
    console.log('3. Restart the server');
    isDbConnected = false;
  }
};

// Initialize database connection
connectToDatabase();

// Middleware to check database connection for routes that need it
const requireDatabase = (req, res, next) => {
  if (!isDbConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected. Please configure MongoDB connection.',
      error: 'SERVICE_UNAVAILABLE'
    });
  }
  next();
};

// Health check endpoint (works without database)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EthioConnect API is running',
    database: isDbConnected ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Database status endpoint
app.get('/api/db-status', (req, res) => {
  res.json({
    connected: isDbConnected,
    message: isDbConnected 
      ? 'Database is connected and ready' 
      : 'Database is not connected. Please configure MongoDB connection.'
  });
});

// Routes with database requirement
app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api/users', requireDatabase, userRoutes);
app.use('/api/products', requireDatabase, productRoutes);
app.use('/api/orders', requireDatabase, orderRoutes);
app.use('/api/requests', requireDatabase, requestRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start HTTP server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log(`Database Status: ${isDbConnected ? 'Connected' : 'Disconnected'}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log('Socket.io server ready for real-time connections');
});

export default app;