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
  ExternalLink,
  FileText,
  User
} from 'lucide-react';

const RequestViewModal = ({ request, isOpen, onClose }) => {
  if (!isOpen || !request) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning-100 text-warning-700';
      case 'approved': return 'bg-success-100 text-success-700';
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
      case 'approved': return CheckCircle;
      case 'processing': return Package;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      case 'cancelled': return AlertCircle;
      default: return Clock;
    }
  };

  const StatusIcon = getStatusIcon(request.status);

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
          <h2 className="text-2xl font-bold text-neutral-900">Request Details</h2>
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
            {/* Request Overview */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{request.requestNumber}</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <StatusIcon className="w-5 h-5 text-neutral-500" />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Package className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">Product Information</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-neutral-600">Product Name:</span>
                    <p className="font-medium text-neutral-900">{request.productName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-600">Product URL:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <a 
                        href={request.productUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm break-all"
                      >
                        {request.productUrl}
                      </a>
                      <ExternalLink className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    </div>
                  </div>
                  {request.quantity && (
                    <div>
                      <span className="text-sm text-neutral-600">Quantity:</span>
                      <p className="font-medium text-neutral-900">{request.quantity}</p>
                    </div>
                  )}
                  {request.description && (
                    <div>
                      <span className="text-sm text-neutral-600">Description:</span>
                      <p className="text-neutral-700 text-sm leading-relaxed">{request.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              {request.additionalDetails && (
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-neutral-900">Additional Details</span>
                  </div>
                  <p className="text-neutral-700 text-sm leading-relaxed">{request.additionalDetails}</p>
                </div>
              )}
            </div>

            {/* Pricing and Status Information */}
            <div className="space-y-6">
              {/* Pricing Information */}
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Euro className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">Pricing Information</span>
                </div>
                <div className="space-y-3">
                  {request.estimatedPrice && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Estimated Price:</span>
                      <span className="font-medium text-neutral-900">€{request.estimatedPrice}</span>
                    </div>
                  )}
                  {request.totalCost && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Total Cost:</span>
                      <span className="text-lg font-bold text-primary-600">€{request.totalCost}</span>
                    </div>
                  )}
                  {request.shippingCost && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Shipping Cost:</span>
                      <span className="font-medium text-neutral-900">€{request.shippingCost}</span>
                    </div>
                  )}
                  {request.processingFee && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Processing Fee:</span>
                      <span className="font-medium text-neutral-900">€{request.processingFee}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Timeline */}
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">Request Timeline</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Request Date:</span>
                    <span className="text-neutral-700">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Last Updated:</span>
                    <span className="text-neutral-700">
                      {new Date(request.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {request.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Estimated Delivery:</span>
                      <span className="text-neutral-700">
                        {new Date(request.estimatedDelivery).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              {request.user && (
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-neutral-900">Requestor Information</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Name:</span>
                      <span className="text-neutral-700">{request.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Email:</span>
                      <span className="text-neutral-700">{request.user.email}</span>
                    </div>
                    {request.user.phone && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Phone:</span>
                        <span className="text-neutral-700">{request.user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes or Comments */}
              {request.adminNotes && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Admin Notes</span>
                  </div>
                  <p className="text-blue-800 text-sm leading-relaxed">{request.adminNotes}</p>
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

export default RequestViewModal;