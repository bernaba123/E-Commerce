import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, Loader } from 'lucide-react';

const ProductEditModal = ({ product, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'coffee',
    stock: '',
    images: [''],
    featured: false,
    tags: '',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'coffee', label: 'Coffee' },
    { value: 'spices', label: 'Spices' },
    { value: 'food', label: 'Food' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'crafts', label: 'Crafts' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        category: product.category || 'coffee',
        stock: product.stock?.toString() || '',
        images: product.images?.length > 0 ? product.images : [''],
        featured: product.featured || false,
        tags: product.tags?.join(', ') || '',
        isActive: product.isActive !== undefined ? product.isActive : true
      });
      setErrors({});
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'images') {
      const index = parseInt(e.target.dataset.index);
      const newImages = [...formData.images];
      newImages[index] = value;
      setFormData(prev => ({ ...prev, images: newImages }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (formData.originalPrice && parseFloat(formData.originalPrice) <= parseFloat(formData.price)) {
      newErrors.originalPrice = 'Original price must be higher than current price';
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    if (!formData.images[0]?.trim()) {
      newErrors.images = 'At least one image URL is required';
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
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stock: parseInt(formData.stock),
        images: formData.images.filter(img => img.trim() !== ''),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      await onSave(product._id, productData);
      onClose();
    } catch (error) {
      console.error('Failed to update product:', error);
      setErrors({ submit: 'Failed to update product. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !product) return null;

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
          <h2 className="text-2xl font-bold text-neutral-900">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {errors.submit && (
            <div className="mb-6 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? 'border-error-500' : ''}`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-600">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Price (€) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`input-field ${errors.price ? 'border-error-500' : ''}`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-error-600">{errors.price}</p>
              )}
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Original Price (€)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`input-field ${errors.originalPrice ? 'border-error-500' : ''}`}
                placeholder="0.00"
              />
              {errors.originalPrice && (
                <p className="mt-1 text-sm text-error-600">{errors.originalPrice}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`input-field ${errors.stock ? 'border-error-500' : ''}`}
                placeholder="0"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-error-600">{errors.stock}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="input-field"
                placeholder="organic, premium, traditional"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`input-field ${errors.description ? 'border-error-500' : ''}`}
              placeholder="Enter product description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error-600">{errors.description}</p>
            )}
          </div>

          {/* Product Images */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Product Images *
            </label>
            {formData.images.map((image, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="url"
                  name="images"
                  data-index={index}
                  value={image}
                  onChange={handleChange}
                  className={`input-field flex-1 ${errors.images && index === 0 ? 'border-error-500' : ''}`}
                  placeholder="https://images.pexels.com/..."
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="text-error-600 hover:text-error-700 p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            {errors.images && (
              <p className="mt-1 text-sm text-error-600">{errors.images}</p>
            )}
            <button
              type="button"
              onClick={addImageField}
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add another image</span>
            </button>
          </div>

          {/* Checkboxes */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <label className="text-sm text-neutral-700">
                Featured Product
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <label className="text-sm text-neutral-700">
                Active Product
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-neutral-200">
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
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
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

export default ProductEditModal;