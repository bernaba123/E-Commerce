// Socket service for real-time order tracking
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (!this.socket) {
      this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Join order tracking room
  joinOrderTracking(orderId) {
    if (this.socket) {
      this.socket.emit('join_order_tracking', orderId);
    }
  }

  // Leave order tracking room
  leaveOrderTracking(orderId) {
    if (this.socket) {
      this.socket.emit('leave_order_tracking', orderId);
    }
  }

  // Listen for order status updates
  onOrderStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('orderStatusUpdate', callback);
      this.listeners.set('orderStatusUpdate', callback);
    }
  }

  // Listen for tracking updates
  onTrackingUpdate(callback) {
    if (this.socket) {
      this.socket.on('trackingUpdate', callback);
      this.listeners.set('trackingUpdate', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback);
      });
      this.listeners.clear();
    }
  }

  // Remove specific listener
  removeListener(event) {
    if (this.socket && this.listeners.has(event)) {
      const callback = this.listeners.get(event);
      this.socket.off(event, callback);
      this.listeners.delete(event);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;