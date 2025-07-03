import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Package, 
  Euro, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  ShoppingCart,
  User,
  MapPin,
  Phone,
  Mail,
  Save,
  Loader,
  Edit,
  Navigation,
  Building
} from 'lucide-react';
import apiService from '../../services/api';

const OrderEditModal = ({ order, isOpen, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [orderData, setOrderData] = useState({
    status: '',
    adminNotes: '',
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '',
    trackingLocation: '',
    trackingMessage: ''
  });

  useEffect(() => {
    if (order) {
      setOrderData({
        status: order.status || '',
        adminNotes: order.adminNotes || '',
        trackingNumber: order.tracking?.trackingNumber || '',
        carrier: order.tracking?.carrier || '',
        estimatedDelivery: order.tracking?.estimatedDelivery 
          ? new Date(order.tracking.estimatedDelivery).toISOString().split('T')[0] 
          : '',
        trackingLocation: '',
        trackingMessage: ''
      });
    }
  }, [order]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
              await apiService.updateOrderStatus(order._id, {
        status: orderData.status,
        adminNotes: orderData.adminNotes
      });
      
      if (onSave) onSave();
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTracking = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const trackingData = {
        trackingNumber: orderData.trackingNumber,
        carrier: orderData.carrier,
        estimatedDelivery: orderData.estimatedDelivery,
        status: orderData.status,
        message: orderData.trackingMessage || `Tracking updated by admin`,
        location: orderData.trackingLocation
      };

              await apiService.updateOrderTracking(order._id, trackingData);
      
      if (onSave) onSave();
      alert('Tracking information updated successfully!');
    } catch (error) {
      console.error('Failed to update tracking:', error);
      alert('Failed to update tracking information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning-100 text-warning-700';
      case 'confirmed': return 'bg-primary-100 text-primary-700';
      case 'processing': return 'bg-primary-100 text-primary-700';
      case 'shipped': return 'bg-secondary-100 text-secondary-700';
      case 'delivered': return 'bg-success-100 text-success-700';
      case 'cancelled': return 'bg-error-100 text-error-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return CheckCircle;
      case 'processing': return Package;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      case 'cancelled': return AlertCircle;
      default: return Clock;
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const carrierOptions = [
    { value: 'Standard Shipping', label: 'Standard Shipping' },
    { value: 'DHL Express', label: 'DHL Express' },
    { value: 'FedEx', label: 'FedEx' },
    { value: 'UPS', label: 'UPS' },
    { value: 'Ethiopian Airlines Cargo', label: 'Ethiopian Airlines Cargo' },
    { value: 'Local Delivery', label: 'Local Delivery' }
  ];

  if (!isOpen || !order) return null;

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Manage Order</h2>
            <p className="text-neutral-600">Order #{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'details', name: 'Order Details', icon: ShoppingCart },
              { id: 'status', name: 'Update Status', icon: Edit },
              { id: 'tracking', name: 'Tracking Info', icon: Truck }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Order Items & Status */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">Order {order.orderNumber}</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <StatusIcon className="w-5 h-5 text-neutral-500" />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Package className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-neutral-900">Order Items</span>
                  </div>
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900">{item.name}</h4>
                          <p className="text-sm text-neutral-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-neutral-600">Unit Price: €{item.price}</p>
                          <p className="text-sm font-medium text-neutral-900">
                            Total: €{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Tracking Info */}
                {order.tracking && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">Current Tracking Information</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      {order.tracking.trackingNumber && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Tracking Number:</span>
                          <span className="text-blue-800 font-medium">{order.tracking.trackingNumber}</span>
                        </div>
                      )}
                      {order.tracking.carrier && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Carrier:</span>
                          <span className="text-blue-800">{order.tracking.carrier}</span>
                        </div>
                      )}
                      {order.tracking.estimatedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Estimated Delivery:</span>
                          <span className="text-blue-800">
                            {new Date(order.tracking.estimatedDelivery).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {order.tracking.updates && order.tracking.updates.length > 0 && (
                        <div className="mt-3">
                          <span className="text-blue-700 text-xs font-medium">Recent Updates:</span>
                          <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                            {order.tracking.updates.slice(-3).map((update, index) => (
                              <div key={index} className="bg-white p-2 rounded text-xs">
                                <div className="font-medium text-neutral-900">{update.message}</div>
                                <div className="text-neutral-600">{update.location}</div>
                                <div className="text-neutral-500">
                                  {new Date(update.timestamp).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Customer & Shipping Info */}
              <div className="space-y-6">
                {/* Customer Information */}
                {order.user && (
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="w-5 h-5 text-primary-600" />
                      <span className="font-semibold text-neutral-900">Customer Information</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Name:</span>
                        <span className="text-neutral-700">{order.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Email:</span>
                        <span className="text-neutral-700">{order.user.email}</span>
                      </div>
                      {order.user.phone && (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Phone:</span>
                          <span className="text-neutral-700">{order.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <MapPin className="w-5 h-5 text-primary-600" />
                      <span className="font-semibold text-neutral-900">Shipping Address</span>
                    </div>
                    <div className="text-sm text-neutral-700 leading-relaxed">
                      {order.shippingAddress.name}<br />
                      {order.shippingAddress.street}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                      {order.shippingAddress.country} {order.shippingAddress.zipCode}
                      {order.shippingAddress.phone && (
                        <>
                          <br />Phone: {order.shippingAddress.phone}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Euro className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-neutral-900">Order Summary</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Subtotal:</span>
                      <span className="font-medium text-neutral-900">€{order.totalAmount}</span>
                    </div>
                    {order.shippingCost && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Shipping:</span>
                        <span className="font-medium text-neutral-900">€{order.shippingCost}</span>
                      </div>
                    )}
                    {order.taxAmount && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Tax:</span>
                        <span className="font-medium text-neutral-900">€{order.taxAmount}</span>
                      </div>
                    )}
                    <div className="border-t border-neutral-300 pt-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-600 font-medium">Total:</span>
                        <span className="text-lg font-bold text-primary-600">€{order.finalAmount || order.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Update Status Tab */}
          {activeTab === 'status' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Update Order Status</h3>
              
              <form onSubmit={handleUpdateStatus} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Order Status
                  </label>
                  <select
                    name="status"
                    value={orderData.status}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-500 mt-1">
                    Current status: <span className="font-medium">{order.status}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    name="adminNotes"
                    value={orderData.adminNotes}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field"
                    placeholder="Add internal notes about this status update..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isLoading ? 'Updating...' : 'Update Status'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tracking Info Tab */}
          {activeTab === 'tracking' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Update Tracking Information</h3>
              
              <form onSubmit={handleUpdateTracking} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      name="trackingNumber"
                      value={orderData.trackingNumber}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="TRK123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Carrier
                    </label>
                    <select
                      name="carrier"
                      value={orderData.carrier}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Select carrier...</option>
                      {carrierOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    name="estimatedDelivery"
                    value={orderData.estimatedDelivery}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Current Location
                  </label>
                  <input
                    type="text"
                    name="trackingLocation"
                    value={orderData.trackingLocation}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., Frankfurt Distribution Center"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Tracking Update Message
                  </label>
                  <input
                    type="text"
                    name="trackingMessage"
                    value={orderData.trackingMessage}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., Package is in transit"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    <span>{isLoading ? 'Updating...' : 'Update Tracking'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="btn-outline"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderEditModal;