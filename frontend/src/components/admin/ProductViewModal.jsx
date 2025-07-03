import React from 'react';
import { motion } from 'framer-motion';
import { X, Package, Tag, Euro, Warehouse, Star, Calendar, AlertTriangle } from 'lucide-react';

const ProductViewModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const getStockStatusColor = (stockStatus, inStock) => {
    if (!inStock || stockStatus === 'Out of Stock') {
      return 'bg-error-100 text-error-700';
    } else if (stockStatus === 'Low Stock') {
      return 'bg-warning-100 text-warning-700';
    } else {
      return 'bg-success-100 text-success-700';
    }
  };

  const getStockStatusIcon = (stockStatus, inStock) => {
    if (!inStock || stockStatus === 'Out of Stock') {
      return <AlertTriangle className="w-4 h-4" />;
    } else if (stockStatus === 'Low Stock') {
      return <AlertTriangle className="w-4 h-4" />;
    } else {
      return <Package className="w-4 h-4" />;
    }
  };

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
          <h2 className="text-2xl font-bold text-neutral-900">Product Details</h2>
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
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg shadow-md"
                />
                {product.featured && (
                  <div className="absolute top-4 left-4 bg-secondary-500 text-neutral-900 px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </div>
                )}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
                  getStockStatusColor(product.stockStatus, product.inStock)
                }`}>
                  {getStockStatusIcon(product.stockStatus, product.inStock)}
                  <span>{product.stockStatus || (product.inStock ? 'Available' : 'Out of Stock')}</span>
                </div>
              </div>
              
              {/* Additional Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {product.images.slice(1, 4).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">{product.name}</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-secondary-500 fill-current'
                            : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-neutral-600">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>

              {/* Price Information */}
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Euro className="w-5 h-5 text-primary-600" />
                  <span className="text-lg font-semibold text-neutral-900">Pricing</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Current Price:</span>
                    <span className="text-2xl font-bold text-primary-600">€{product.price}</span>
                  </div>
                  {product.originalPrice && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Original Price:</span>
                      <span className="text-neutral-500 line-through">€{product.originalPrice}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-neutral-900">Category</span>
                  </div>
                  <span className="text-neutral-700 capitalize">{product.category}</span>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Warehouse className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-neutral-900">Stock</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-neutral-700">{product.stock} units</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getStockStatusColor(product.stockStatus, product.inStock)
                    }`}>
                      {product.stockStatus || (product.inStock ? 'Available' : 'Out of Stock')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-neutral-900 mb-2">Description</h4>
                <p className="text-neutral-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">Product Information</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Created:</span>
                    <span className="text-neutral-700">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Last Updated:</span>
                    <span className="text-neutral-700">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Product ID:</span>
                    <span className="text-neutral-700 font-mono text-xs">{product._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Active Status:</span>
                    <span className={`font-medium ${product.isActive ? 'text-success-600' : 'text-error-600'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
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

export default ProductViewModal;