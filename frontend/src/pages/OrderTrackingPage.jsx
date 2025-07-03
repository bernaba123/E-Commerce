import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import apiService from '../services/api';
import socketService from '../services/socketService';

const OrderTrackingPage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const autoRefreshInterval = useRef(null);
  const currentOrderId = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socketService.connect();
    
    // Check socket connection status
    const socket = socketService.socket;
    if (socket) {
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
    }

    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
      if (currentOrderId.current) {
        socketService.leaveOrderTracking(currentOrderId.current);
      }
      socketService.removeAllListeners();
    };
  }, []);

  // Set up real-time listeners when tracking data is loaded
  useEffect(() => {
    if (trackingData && trackingData.orderId) {
      currentOrderId.current = trackingData.orderId;
      
      // Join the order tracking room
      socketService.joinOrderTracking(trackingData.orderId);

      // Listen for real-time updates
      socketService.onOrderStatusUpdate((update) => {
        console.log('Real-time order status update:', update);
        setLastUpdate(new Date().toISOString());
        
        // Refresh tracking data when status updates
        if (trackingNumber) {
          handleTrackOrder(null, trackingNumber, false);
        }
      });

      socketService.onTrackingUpdate((update) => {
        console.log('Real-time tracking update:', update);
        setLastUpdate(new Date().toISOString());
        
        // Update current location and add new tracking update
        setTrackingData(prev => {
          if (!prev) return prev;
          
          const updatedTracking = {
            ...prev,
            currentLocation: update.currentLocation || prev.currentLocation,
            tracking: {
              ...prev.tracking,
              updates: [
                ...prev.tracking.updates,
                {
                  ...update.update,
                  completed: true
                }
              ]
            }
          };
          
          if (update.estimatedDelivery) {
            updatedTracking.estimatedDelivery = new Date(update.estimatedDelivery).toISOString().split('T')[0];
          }
          
          return updatedTracking;
        });
      });
    }

    return () => {
      if (currentOrderId.current) {
        socketService.leaveOrderTracking(currentOrderId.current);
        currentOrderId.current = null;
      }
      socketService.removeAllListeners();
    };
  }, [trackingData, trackingNumber]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && trackingData && trackingNumber) {
      autoRefreshInterval.current = setInterval(() => {
        handleTrackOrder(null, trackingNumber, false);
      }, 30000); // Refresh every 30 seconds
    } else if (autoRefreshInterval.current) {
      clearInterval(autoRefreshInterval.current);
    }

    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, [autoRefresh, trackingData, trackingNumber]);

  const handleTrackOrder = async (e, trackingNumberOverride = null, showLoader = true) => {
    if (e) e.preventDefault();
    
    const trackingNum = trackingNumberOverride || trackingNumber;
    if (!trackingNum.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    if (showLoader) setIsLoading(true);
    setError('');

    try {
      const response = await apiService.trackOrder(trackingNum);
      
      if (response.success) {
        // Add orderId to tracking data for socket functionality
        const trackingDataWithId = {
          ...response.data,
          orderId: response.data.orderNumber // Use order number as ID for socket rooms
        };
        
        setTrackingData(trackingDataWithId);
        setLastUpdate(new Date().toISOString());
      } else {
        setError('Order not found. Please check your tracking number and try again.');
        setTrackingData(null);
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setError(err.message || 'Failed to track order. Please try again.');
      setTrackingData(null);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (trackingNumber) {
      handleTrackOrder(null, trackingNumber);
    }
  };

  const getStatusIcon = (status, completed) => {
    if (completed) {
      return <CheckCircle className="w-6 h-6 text-success-600" />;
    }
    
    switch (status) {
      case 'ordered':
      case 'pending':
      case 'confirmed':
        return <Package className="w-6 h-6 text-primary-600" />;
      case 'processing':
        return <Clock className="w-6 h-6 text-warning-600" />;
      case 'shipped':
      case 'in_transit':
        return <Truck className="w-6 h-6 text-primary-600" />;
      case 'out_for_delivery':
        return <MapPin className="w-6 h-6 text-warning-600" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-success-600" />;
      default:
        return <Clock className="w-6 h-6 text-neutral-400" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Track Your Order
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Enter your order number or tracking number to get real-time updates
            </p>
            
            {/* Connection Status */}
            <div className="mt-4 flex justify-center items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-300" />
                    <span className="text-green-300">Live Updates Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-yellow-300" />
                    <span className="text-yellow-300">Connecting...</span>
                  </>
                )}
              </div>
              {lastUpdate && (
                <div className="text-primary-200 text-xs">
                  Last updated: {formatDate(lastUpdate)}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tracking Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card p-8 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              Enter Tracking Information
            </h2>
            
            {trackingData && (
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>Auto-refresh (30s)</span>
                </label>
                
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="btn-secondary p-2"
                  title="Refresh tracking data"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
          </div>
          
          <form onSubmit={handleTrackOrder} className="space-y-6">
            <div>
              <label htmlFor="tracking" className="block text-sm font-medium text-neutral-700 mb-2">
                Order Number or Tracking Number
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  id="tracking"
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter your order number (e.g., EC2024001)"
                  className="input-field pl-10"
                />
              </div>
              <p className="text-sm text-neutral-500 mt-2">
                You can find this in your order confirmation email
              </p>
            </div>

            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Demo: Try tracking number <span className="font-mono bg-neutral-100 px-2 py-1 rounded">EC2024001</span>
            </p>
          </div>
        </motion.div>

        {/* Tracking Results */}
        {trackingData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Order Summary */}
            <div className="card p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900">
                    Order #{trackingData.orderNumber}
                  </h3>
                  <p className="text-neutral-600">
                    Tracking: {trackingData.tracking.trackingNumber}
                  </p>
                </div>
                <div className="mt-4 lg:mt-0">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    trackingData.status === 'delivered' 
                      ? 'bg-success-100 text-success-700'
                      : trackingData.status === 'shipped' || trackingData.status === 'in_transit'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-warning-100 text-warning-700'
                  }`}>
                    {trackingData.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-600">Estimated Delivery</p>
                    <p className="font-medium">{trackingData.estimatedDelivery || 'TBD'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-600">Current Location</p>
                    <p className="font-medium">{trackingData.currentLocation}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-600">Carrier</p>
                    <p className="font-medium">{trackingData.tracking.carrier}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="card p-8">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Tracking History</h3>
              
              <div className="space-y-6">
                {trackingData.tracking.updates.map((update, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(update.status, update.completed)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="font-medium text-neutral-900">
                            {update.message}
                          </h4>
                          <p className="text-sm text-neutral-600">
                            {update.location}
                          </p>
                        </div>
                        {update.timestamp && (
                          <p className="text-sm text-neutral-500 mt-1 sm:mt-0">
                            {formatDate(update.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="card p-8">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Order Items</h3>
              
              <div className="space-y-4">
                {trackingData.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900">{item.name}</h4>
                      <p className="text-sm text-neutral-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-neutral-900">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-700">{trackingData.customer.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-700">{trackingData.customer.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-700">{trackingData.customer.phone}</span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Shipping Address</h3>
                <div className="space-y-2">
                  <p className="text-neutral-700">{trackingData.shippingAddress.street}</p>
                  <p className="text-neutral-700">{trackingData.shippingAddress.city}</p>
                  <p className="text-neutral-700">{trackingData.shippingAddress.country}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;