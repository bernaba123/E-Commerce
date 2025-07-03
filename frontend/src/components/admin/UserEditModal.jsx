import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

const UserEditModal = ({ user, isOpen, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    isActive: true,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    newPassword: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && isOpen) {
      setUserData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        isActive: user.isActive !== undefined ? user.isActive : true,
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || ''
        },
        newPassword: ''
      });
      setErrors({});
    }
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!userData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (userData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(userData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional)
    if (userData.phone && userData.phone.trim()) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
      if (!phoneRegex.test(userData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Password validation (only if provided)
    if (userData.newPassword && userData.newPassword.trim()) {
      if (userData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
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
        name: userData.name.trim(),
        email: userData.email.trim(),
        phone: userData.phone.trim() || undefined,
        role: userData.role,
        isActive: userData.isActive,
        address: {
          street: userData.address.street.trim() || undefined,
          city: userData.address.city.trim() || undefined,
          state: userData.address.state.trim() || undefined,
          zipCode: userData.address.zipCode.trim() || undefined,
          country: userData.address.country.trim() || undefined
        }
      };

      // Only include password if it's provided
      if (userData.newPassword && userData.newPassword.trim()) {
        updateData.password = userData.newPassword.trim();
      }

      if (onSave) {
        await onSave(user._id, updateData);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setUserData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Edit User</h2>
              <p className="text-sm text-neutral-600">Update user information and settings</p>
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
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
              <User className="w-5 h-5 text-primary-600" />
              <span>Basic Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  className={`input-field ${errors.name ? 'border-error-300 focus:ring-error-500' : ''}`}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  className={`input-field ${errors.email ? 'border-error-300 focus:ring-error-500' : ''}`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  className={`input-field ${errors.phone ? 'border-error-300 focus:ring-error-500' : ''}`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-error-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={userData.newPassword}
                    onChange={handleInputChange}
                    className={`input-field pr-10 ${errors.newPassword ? 'border-error-300 focus:ring-error-500' : ''}`}
                    placeholder="Leave blank to keep current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-error-600">{errors.newPassword}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">Leave empty to keep current password</p>
              </div>
            </div>
          </div>

          {/* Role and Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary-600" />
              <span>Role & Status</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  User Role
                </label>
                <select
                  name="role"
                  value={userData.role}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Account Status
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={userData.isActive}
                      onChange={handleInputChange}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">Active Account</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              <span>Address Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={userData.address.street}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={userData.address.city}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={userData.address.state}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter state/province"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={userData.address.zipCode}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter ZIP/postal code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={userData.address.country}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>

          {/* Warning for Admin Users */}
          {user?.role === 'admin' && (
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-warning-800">Admin Account Warning</h4>
                  <p className="text-sm text-warning-700 mt-1">
                    You are editing an admin account. Be careful when modifying admin privileges and account status.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Account Info */}
          {user && (
            <div className="bg-neutral-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-900 mb-2 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-neutral-600" />
                <span>Account Information</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-600">
                <div>
                  <span className="font-medium">Created:</span> {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(user.updatedAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">User ID:</span> {user._id}
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    user.isActive ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
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

export default UserEditModal;