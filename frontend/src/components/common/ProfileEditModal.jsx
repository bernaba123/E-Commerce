import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Save
} from 'lucide-react';

const ProfileEditModal = ({ user, isOpen, onClose, onSave }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          country: user.address?.country || '',
          zipCode: user.address?.zipCode || ''
        }
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(profileData);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-neutral-900">Personal Information</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input-field pl-10"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-neutral-900">Address Information</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={profileData.address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className="input-field"
                  placeholder="123 Main Street"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={profileData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="input-field"
                    placeholder="New York"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={profileData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="input-field"
                    placeholder="NY"
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
                    value={profileData.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    className="input-field"
                    placeholder="United States"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    value={profileData.address.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    className="input-field"
                    placeholder="10001"
                  />
                </div>
              </div>
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
      </motion.div>
    </div>
  );
};

export default ProfileEditModal;