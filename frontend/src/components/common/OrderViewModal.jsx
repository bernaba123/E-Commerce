import React from 'react';
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
  Mail
} from 'lucide-react';

const OrderViewModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

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

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">Order Details</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Overview */}
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

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-neutral-900">Shipping Address</span>
                  </div>
                  <div className="text-sm text-neutral-700 leading-relaxed">
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                    {order.shippingAddress.country} {order.shippingAddress.zipCode}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary and Customer Info */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Euro className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">Order Summary</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal:</span>
                    <span className="font-medium text-neutral-900">€{order.subtotal || order.totalAmount}</span>
                  </div>
                  {order.shippingCost && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Shipping:</span>
                      <span className="font-medium text-neutral-900">€{order.shippingCost}</span>
                    </div>
                  )}
                  {order.tax && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Tax:</span>
                      <span className="font-medium text-neutral-900">€{order.tax}</span>
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

              {/* Order Timeline */}
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">Order Timeline</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Order Date:</span>
                    <span className="text-neutral-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Last Updated:</span>
                    <span className="text-neutral-700">
                      {new Date(order.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Estimated Delivery:</span>
                      <span className="text-neutral-700">
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

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

              {/* Payment Information */}
              {order.paymentMethod && (
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Euro className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-neutral-900">Payment Information</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Payment Method:</span>
                      <span className="text-neutral-700 capitalize">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Payment Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-success-100 text-success-700' 
                          : 'bg-warning-100 text-warning-700'
                      }`}>
                        {order.paymentStatus || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Notes */}
              {order.notes && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Order Notes</span>
                  </div>
                  <p className="text-blue-800 text-sm leading-relaxed">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
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

export default OrderViewModal;