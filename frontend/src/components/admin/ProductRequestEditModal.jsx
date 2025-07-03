import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Save, 
  Package, 
  User, 
  DollarSign, 
  Calendar,
  Globe,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const ProductRequestEditModal = ({ request, isOpen, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [requestData, setRequestData] = useState({
    requestNumber: '',
    productName: '',
    productDescription: '',
    category: '',
    quantity: 1,
    productPrice: '',
    productUrl: '',
    status: 'pending',
    adminNotes: '',
    priority: 'medium'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (request && isOpen) {
      setRequestData({
        requestNumber: request.requestNumber || '',
        productName: request.productName || '',
        productDescription: request.productDescription || '',
        category: request.category || '',
        quantity: request.quantity || 1,
        productPrice: request.productPrice || '',
        productUrl: request.productUrl || '',
        status: request.status || 'pending',
        adminNotes: request.adminNotes || '',
        priority: request.priority || 'medium'
      });
      setErrors({});
    }
  }, [request, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Product name validation
    if (!requestData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    } else if (requestData.productName.trim().length < 3) {
      newErrors.productName = 'Product name must be at least 3 characters';
    }

    // Category validation
    if (!requestData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    // Quantity validation
    if (!requestData.quantity || requestData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    // Price validation
    if (requestData.productPrice && isNaN(parseFloat(requestData.productPrice))) {
      newErrors.productPrice = 'Please enter a valid price';
    }

    // URL validation (optional)
    if (requestData.productUrl && requestData.productUrl.trim()) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(requestData.productUrl)) {
        newErrors.productUrl = 'Please enter a valid URL starting with http:// or https://';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        productName: requestData.productName.trim(),
        productDescription: requestData.productDescription.trim(),
        category: requestData.category.trim(),
        quantity: parseInt(requestData.quantity),
        productPrice: requestData.productPrice.trim() || undefined,
        productUrl: requestData.productUrl.trim() || undefined,
        status: requestData.status,
        adminNotes: requestData.adminNotes.trim() || undefined,
        priority: requestData.priority
      };

      if (onSave) {
        await onSave(request._id, updateData);
      }
    } catch (error) {
      console.error('Error updating product request:', error);
      alert('Failed to update product request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    setRequestData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'processing': return Package;
      default: return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-warning-600';
      case 'approved': return 'text-success-600';
      case 'rejected': return 'text-error-600';
      case 'processing': return 'text-primary-600';
      default: return 'text-neutral-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-blue-600';
      case 'medium': return 'text-warning-600';
      case 'high': return 'text-error-600';
      default: return 'text-neutral-600';
    }
  };

  if (!isOpen) return null;

  const StatusIcon = getStatusIcon(requestData.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Edit Product Request</h2>
              <p className="text-sm text-neutral-600">
                Request #{request?.requestNumber} - Update details and status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Request Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
              <Package className="w-5 h-5 text-primary-600" />
              <span>Product Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="productName"
                  value={requestData.productName}
                  onChange={handleInputChange}
                  className={`input-field ${errors.productName ? 'border-error-300 focus:ring-error-500' : ''}`}
                  placeholder="Enter product name"
                />
                {errors.productName && (
                  <p className="mt-1 text-sm text-error-600">{errors.productName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={requestData.category}
                  onChange={handleInputChange}
                  className={`input-field ${errors.category ? 'border-error-300 focus:ring-error-500' : ''}`}
                >
                  <option value="">Select Category</option>
                  <option value="coffee">Coffee</option>
                  <option value="spices">Spices</option>
                  <option value="food">Food</option>
                  <option value="clothing">Clothing</option>
                  <option value="crafts">Crafts</option>
                  <option value="electronics">Electronics</option>
                  <option value="books">Books</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-error-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={requestData.quantity}
                  onChange={handleInputChange}
                  className={`input-field ${errors.quantity ? 'border-error-300 focus:ring-error-500' : ''}`}
                  placeholder="Enter quantity"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-error-600">{errors.quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Expected Price
                </label>
                <input
                  type="text"
                  name="productPrice"
                  value={requestData.productPrice}
                  onChange={handleInputChange}
                  className={`input-field ${errors.productPrice ? 'border-error-300 focus:ring-error-500' : ''}`}
                  placeholder="e.g., €25.99"
                />
                {errors.productPrice && (
                  <p className="mt-1 text-sm text-error-600">{errors.productPrice}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Product URL
                </label>
                <input
                  type="url"
                  name="productUrl"
                  value={requestData.productUrl}
                  onChange={handleInputChange}
                  className={`input-field ${errors.productUrl ? 'border-error-300 focus:ring-error-500' : ''}`}
                  placeholder="https://example.com/product"
                />
                {errors.productUrl && (
                  <p className="mt-1 text-sm text-error-600">{errors.productUrl}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Product Description
                </label>
                <textarea
                  name="productDescription"
                  value={requestData.productDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Detailed description of the requested product..."
                />
              </div>
            </div>
          </div>

          {/* Request Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              <span>Request Management</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-3">
                  <StatusIcon className={`w-5 h-5 ${getStatusColor(requestData.status)}`} />
                  <select
                    name="status"
                    value={requestData.status}
                    onChange={handleInputChange}
                    className="input-field flex-1"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="processing">In Processing</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Priority Level
                </label>
                <select
                  name="priority"
                  value={requestData.priority}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  name="adminNotes"
                  value={requestData.adminNotes}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Internal notes about this request (not visible to customer)..."
                />
                <p className="mt-1 text-xs text-neutral-500">
                  These notes are only visible to admin users and will help track the request status.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {request?.user && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
                <User className="w-5 h-5 text-primary-600" />
                <span>Customer Information</span>
              </h3>
              
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-neutral-700">Customer Name:</span>
                    <p className="text-neutral-900">{request.user.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Email:</span>
                    <p className="text-neutral-900">{request.user.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Phone:</span>
                    <p className="text-neutral-900">{request.user.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Customer Since:</span>
                    <p className="text-neutral-900">
                      {request.user.createdAt ? new Date(request.user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Request Details */}
          {request && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                <span>Request Details</span>
              </h3>
              
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-neutral-700">Request Number:</span>
                    <p className="text-neutral-900">{request.requestNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Submitted:</span>
                    <p className="text-neutral-900">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Last Updated:</span>
                    <p className="text-neutral-900">
                      {new Date(request.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Request ID:</span>
                    <p className="text-neutral-900 font-mono text-xs">{request._id}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Change Warning */}
          {requestData.status === 'rejected' && (
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-warning-800">Request Rejection</h4>
                  <p className="text-sm text-warning-700 mt-1">
                    This request will be marked as rejected. Make sure to add a detailed note explaining the reason.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProductRequestEditModal;