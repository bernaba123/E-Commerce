import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Bell, 
  Mail, 
  MessageSquare, 
  Save,
  Smartphone
} from 'lucide-react';

const NotificationPreferencesModal = ({ isOpen, onClose, onSave, currentPreferences = {} }) => {
  const [preferences, setPreferences] = useState({
    email: {
      orderUpdates: true,
      productAlerts: true,
      promotions: false,
      newsletters: false,
      systemUpdates: true
    },
    sms: {
      orderUpdates: false,
      productAlerts: false,
      promotions: false,
      securityAlerts: true
    },
    push: {
      orderUpdates: true,
      productAlerts: true,
      promotions: false,
      messages: true
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && currentPreferences) {
      setPreferences(prev => ({
        ...prev,
        ...currentPreferences
      }));
    }
  }, [isOpen, currentPreferences]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(preferences);
      onClose();
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreferenceChange = (category, setting, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const PreferenceToggle = ({ category, setting, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-sm font-medium text-neutral-900">{label}</div>
        <div className="text-xs text-neutral-600">{description}</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={preferences[category]?.[setting] || false}
          onChange={(e) => handlePreferenceChange(category, setting, e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
      </label>
    </div>
  );

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
          <h2 className="text-2xl font-bold text-neutral-900">Notification Preferences</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-8">
            {/* Email Notifications */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <Mail className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-neutral-900">Email Notifications</span>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-1">
                <PreferenceToggle
                  category="email"
                  setting="orderUpdates"
                  label="Order Updates"
                  description="Get notified about order status changes and delivery updates"
                />
                <PreferenceToggle
                  category="email"
                  setting="productAlerts"
                  label="Product Alerts"
                  description="Notifications when products are back in stock or on sale"
                />
                <PreferenceToggle
                  category="email"
                  setting="promotions"
                  label="Promotions & Deals"
                  description="Special offers, discounts, and promotional campaigns"
                />
                <PreferenceToggle
                  category="email"
                  setting="newsletters"
                  label="Newsletters"
                  description="Weekly newsletters and product highlights"
                />
                <PreferenceToggle
                  category="email"
                  setting="systemUpdates"
                  label="System Updates"
                  description="Important platform updates and maintenance notifications"
                />
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <Smartphone className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-neutral-900">SMS Notifications</span>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-1">
                <PreferenceToggle
                  category="sms"
                  setting="orderUpdates"
                  label="Order Updates"
                  description="SMS alerts for critical order status changes"
                />
                <PreferenceToggle
                  category="sms"
                  setting="productAlerts"
                  label="Product Alerts"
                  description="SMS when high-priority items are available"
                />
                <PreferenceToggle
                  category="sms"
                  setting="promotions"
                  label="Promotions"
                  description="Limited-time offers and flash sales"
                />
                <PreferenceToggle
                  category="sms"
                  setting="securityAlerts"
                  label="Security Alerts"
                  description="Account security and login notifications"
                />
              </div>
            </div>

            {/* Push Notifications */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <Bell className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-neutral-900">Push Notifications</span>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-1">
                <PreferenceToggle
                  category="push"
                  setting="orderUpdates"
                  label="Order Updates"
                  description="Push notifications for order status changes"
                />
                <PreferenceToggle
                  category="push"
                  setting="productAlerts"
                  label="Product Alerts"
                  description="Instant notifications for product availability"
                />
                <PreferenceToggle
                  category="push"
                  setting="promotions"
                  label="Promotions"
                  description="Push alerts for special deals and discounts"
                />
                <PreferenceToggle
                  category="push"
                  setting="messages"
                  label="Messages"
                  description="Notifications for new messages and updates"
                />
              </div>
            </div>

            {/* Notification Frequency */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-neutral-900">Notification Summary</span>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Delivery Options:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Instant: Real-time notifications for urgent updates</li>
                    <li>• Daily: Batched summary delivered once per day</li>
                    <li>• Weekly: Weekly digest of all notifications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200 mt-8">
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
              <span>{isSubmitting ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default NotificationPreferencesModal;