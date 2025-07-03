import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Package,
  MapPin, 
  Save,
  AlertCircle,
  Clock,
  Link,
  MessageSquare
} from 'lucide-react';

const RequestEditModal = ({ request, isOpen, onClose, onSave }) => {
  const [requestData, setRequestData] = useState({
    productUrl: '',
    productName: '',
    productPrice: '',
    quantity: 1,
    description: '',
    category: 'other',
    urgency: 'medium',
    shippingAddress: {
      name: '',
      street: '',
      city: '',
      state: '',
      country: 'Ethiopia',
      zipCode: '',
      phone: ''
    },
    userNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (request && isOpen) {
      setRequestData({
        productUrl: request.productUrl || '',
        productName: request.productName || '',
        productPrice: request.productPrice || '',
        quantity: request.quantity || 1,
        description: request.description || '',
        category: request.category || 'other',
        urgency: request.urgency || 'medium',
        shippingAddress: {
          name: request.shippingAddress?.name || '',
          street: request.shippingAddress?.street || '',
          city: request.shippingAddress?.city || '',
          state: request.shippingAddress?.state || '',
          country: request.shippingAddress?.country || 'Ethiopia',
          zipCode: request.shippingAddress?.zipCode || '',
          phone: request.shippingAddress?.phone || ''
        },
        userNotes: request.userNotes || ''
      });

      // Calculate time remaining for editing (10 minutes)
      const createdTime = new Date(request.createdAt);
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
  }, [request, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(request._id, requestData);
      onClose();
    } catch (error) {
      console.error('Failed to update request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShippingAddressChange = (field, value) => {
    setRequestData(prev => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, [field]: value }
    }));
  };

  const formatTimeRemaining = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isTimeExpired = timeRemaining <= 0;

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Fashion' },
    { value: 'books', label: 'Books & Media' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'beauty', label: 'Beauty & Personal Care' },
    { value: 'toys', label: 'Toys & Games' },
    { value: 'other', label: 'Other' }
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Standard (7-14 days)', cost: '€20' },
    { value: 'medium', label: 'Express (3-7 days)', cost: '€35' },
    { value: 'high', label: 'Priority (1-3 days)', cost: '€55' }
  ];

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
            <h2 className="text-2xl font-bold text-neutral-900">Edit Request {request?.requestNumber}</h2>
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
              Requests can only be edited within 10 minutes of creation. Please contact support if you need to make changes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {/* Product Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Package className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">Product Information</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Product URL *
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="url"
                      value={requestData.productUrl}
                      onChange={(e) => setRequestData(prev => ({ ...prev, productUrl: e.target.value }))}
                      className="input-field pl-10"
                      placeholder="https://example.com/product"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={requestData.productName}
                    onChange={(e) => setRequestData(prev => ({ ...prev, productName: e.target.value }))}
                    className="input-field"
                    placeholder="Enter the product name"
                    required
                    maxLength={200}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Product Price *
                    </label>
                    <input
                      type="text"
                      value={requestData.productPrice}
                      onChange={(e) => setRequestData(prev => ({ ...prev, productPrice: e.target.value }))}
                      className="input-field"
                      placeholder="$29.99 or €25.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={requestData.quantity}
                      onChange={(e) => setRequestData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="input-field"
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Category
                    </label>
                    <select
                      value={requestData.category}
                      onChange={(e) => setRequestData(prev => ({ ...prev, category: e.target.value }))}
                      className="input-field"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Delivery Urgency
                    </label>
                    <select
                      value={requestData.urgency}
                      onChange={(e) => setRequestData(prev => ({ ...prev, urgency: e.target.value }))}
                      className="input-field"
                    >
                      {urgencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label} - {option.cost}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={requestData.description}
                    onChange={(e) => setRequestData(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Any specific details, size, color, model, etc..."
                    maxLength={1000}
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">Delivery Address</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={requestData.shippingAddress.name}
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
                    value={requestData.shippingAddress.street}
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
                      value={requestData.shippingAddress.city}
                      onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      State/Region
                    </label>
                    <input
                      type="text"
                      value={requestData.shippingAddress.state}
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
                      value={requestData.shippingAddress.country}
                      onChange={(e) => handleShippingAddressChange('country', e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      value={requestData.shippingAddress.zipCode}
                      onChange={(e) => handleShippingAddressChange('zipCode', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={requestData.shippingAddress.phone}
                    onChange={(e) => handleShippingAddressChange('phone', e.target.value)}
                    className="input-field"
                    placeholder="+251 123 456 789"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Additional Notes
                </label>
                <textarea
                  value={requestData.userNotes}
                  onChange={(e) => setRequestData(prev => ({ ...prev, userNotes: e.target.value }))}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Any special instructions or additional information..."
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

export default RequestEditModal;