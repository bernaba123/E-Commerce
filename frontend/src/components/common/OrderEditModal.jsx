import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Save,
  AlertCircle,
  Clock
} from 'lucide-react';

const OrderEditModal = ({ order, isOpen, onClose, onSave }) => {
  const [orderData, setOrderData] = useState({
    shippingAddress: {
      name: '',
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      phone: ''
    },
    billingAddress: {
      name: '',
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (order && isOpen) {
      setOrderData({
        shippingAddress: {
          name: order.shippingAddress?.name || '',
          street: order.shippingAddress?.street || '',
          city: order.shippingAddress?.city || '',
          state: order.shippingAddress?.state || '',
          country: order.shippingAddress?.country || '',
          zipCode: order.shippingAddress?.zipCode || '',
          phone: order.shippingAddress?.phone || ''
        },
        billingAddress: {
          name: order.billingAddress?.name || '',
          street: order.billingAddress?.street || '',
          city: order.billingAddress?.city || '',
          state: order.billingAddress?.state || '',
          country: order.billingAddress?.country || '',
          zipCode: order.billingAddress?.zipCode || ''
        },
        notes: order.notes || ''
      });

      // Calculate time remaining for editing (10 minutes)
      const createdTime = new Date(order.createdAt);
      const now = new Date();
      const timeDiff = now - createdTime;
      const tenMinutesInMs = 10 * 60 * 1000;
      const remaining = Math.max(0, tenMinutesInMs - timeDiff);
      setTimeRemaining(remaining);

      // Update timer every second
      const timer = setInterval(() => {
        const newNow = new Date();
        const newTimeDiff = newNow - createdTime;
        const newRemaining = Math.max(0, tenMinutesInMs - newTimeDiff);
        setTimeRemaining(newRemaining);
        
        if (newRemaining <= 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [order, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(order._id, orderData);
      onClose();
    } catch (error) {
      console.error('Failed to update order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShippingAddressChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, [field]: value }
    }));
  };

  const handleBillingAddressChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      billingAddress: { ...prev.billingAddress, [field]: value }
    }));
  };

  const formatTimeRemaining = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isTimeExpired = timeRemaining <= 0;

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
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Edit Order {order?.orderNumber}</h2>
            <div className="flex items-center space-x-2 mt-2">
              <Clock className="w-4 h-4 text-warning-600" />
              <span className={`text-sm font-medium ${isTimeExpired ? 'text-error-600' : 'text-warning-600'}`}>
                {isTimeExpired ? 'Edit time expired' : `${formatTimeRemaining(timeRemaining)} remaining`}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {isTimeExpired ? (
          <div className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-error-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Edit Time Expired</h3>
            <p className="text-neutral-600">
              Orders can only be edited within 10 minutes of placement. Please contact support if you need to make changes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {/* Shipping Address */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">Shipping Address</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={orderData.shippingAddress.name}
                    onChange={(e) => handleShippingAddressChange('name', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={orderData.shippingAddress.street}
                    onChange={(e) => handleShippingAddressChange('street', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={orderData.shippingAddress.city}
                      onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={orderData.shippingAddress.state}
                      onChange={(e) => handleShippingAddressChange('state', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={orderData.shippingAddress.country}
                      onChange={(e) => handleShippingAddressChange('country', e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      ZIP/Postal Code *
                    </label>
                    <input
                      type="text"
                      value={orderData.shippingAddress.zipCode}
                      onChange={(e) => handleShippingAddressChange('zipCode', e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={orderData.shippingAddress.phone}
                    onChange={(e) => handleShippingAddressChange('phone', e.target.value)}
                    className="input-field"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">Billing Address</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={orderData.billingAddress.name}
                    onChange={(e) => handleBillingAddressChange('name', e.target.value)}
                    className="input-field"
                    placeholder="Leave empty to use shipping address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={orderData.billingAddress.street}
                    onChange={(e) => handleBillingAddressChange('street', e.target.value)}
                    className="input-field"
                    placeholder="Leave empty to use shipping address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={orderData.billingAddress.city}
                      onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={orderData.billingAddress.state}
                      onChange={(e) => handleBillingAddressChange('state', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={orderData.billingAddress.country}
                      onChange={(e) => handleBillingAddressChange('country', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      value={orderData.billingAddress.zipCode}
                      onChange={(e) => handleBillingAddressChange('zipCode', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Order Notes
                </label>
                <textarea
                  value={orderData.notes}
                  onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Add any special instructions or notes for your order..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default OrderEditModal;