import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Shield, 
  Eye, 
  EyeOff, 
  Save,
  Lock,
  Globe,
  UserCheck,
  Database
} from 'lucide-react';

const PrivacySettingsModal = ({ isOpen, onClose, onSave, currentSettings = {} }) => {
  const [settings, setSettings] = useState({
    profileVisibility: 'private', // private, friends, public
    dataSharing: {
      analytics: false,
      marketing: false,
      thirdParty: false,
      research: false
    },
    activityTracking: {
      orderHistory: true,
      browsingHistory: false,
      searchHistory: false,
      locationData: false
    },
    communicationPreferences: {
      allowMessages: true,
      showOnlineStatus: false,
      shareContactInfo: false
    },
    dataRetention: {
      autoDeleteOldData: false,
      retentionPeriod: '1year' // 6months, 1year, 2years, never
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && currentSettings) {
      setSettings(prev => ({
        ...prev,
        ...currentSettings
      }));
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(settings);
      onClose();
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNestedChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-sm font-medium text-neutral-900">{label}</div>
        <div className="text-xs text-neutral-600">{description}</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
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
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">Privacy & Security Settings</h2>
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
            {/* Profile Visibility */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <Eye className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-neutral-900">Profile Visibility</span>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="space-y-3">
                  {[
                    { value: 'private', label: 'Private', description: 'Only you can see your profile information' },
                    { value: 'friends', label: 'Friends Only', description: 'Only connected users can see your profile' },
                    { value: 'public', label: 'Public', description: 'Anyone can see your public profile information' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value={option.value}
                        checked={settings.profileVisibility === option.value}
                        onChange={(e) => setSettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                        className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{option.label}</div>
                        <div className="text-xs text-neutral-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <Database className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-neutral-900">Data Sharing</span>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-1">
                <ToggleSwitch
                  checked={settings.dataSharing.analytics}
                  onChange={(value) => handleNestedChange('dataSharing', 'analytics', value)}
                  label="Analytics Data"
                  description="Share anonymized usage data to help improve the platform"
                />
                <ToggleSwitch
                  checked={settings.dataSharing.marketing}
                  onChange={(value) => handleNestedChange('dataSharing', 'marketing', value)}
                  label="Marketing Analytics"
                  description="Allow data to be used for personalized marketing campaigns"
                />
                <ToggleSwitch
                  checked={settings.dataSharing.thirdParty}
                  onChange={(value) => handleNestedChange('dataSharing', 'thirdParty', value)}
                  label="Third-party Sharing"
                  description="Share data with trusted partners for enhanced services"
                />
                <ToggleSwitch
                  checked={settings.dataSharing.research}
                  onChange={(value) => handleNestedChange('dataSharing', 'research', value)}
                  label="Research Participation"
                  description="Participate in anonymized research studies"
                />
              </div>
            </div>

            {/* Activity Tracking */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <Globe className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-neutral-900">Activity Tracking</span>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-1">
                <ToggleSwitch
                  checked={settings.activityTracking.orderHistory}
                  onChange={(value) => handleNestedChange('activityTracking', 'orderHistory', value)}
                  label="Order History Tracking"
                  description="Keep detailed records of your purchase history"
                />
                <ToggleSwitch
                  checked={settings.activityTracking.browsingHistory}
                  onChange={(value) => handleNestedChange('activityTracking', 'browsingHistory', value)}
                  label="Browsing History"
                  description="Track pages visited to improve recommendations"
                />
                <ToggleSwitch
                  checked={settings.activityTracking.searchHistory}
                  onChange={(value) => handleNestedChange('activityTracking', 'searchHistory', value)}
                  label="Search History"
                  description="Save search queries to enhance search results"
                />
                <ToggleSwitch
                  checked={settings.activityTracking.locationData}
                  onChange={(value) => handleNestedChange('activityTracking', 'locationData', value)}
                  label="Location Data"
                  description="Use location data for delivery and local recommendations"
                />
              </div>
            </div>

            {/* Communication Preferences */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <UserCheck className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-neutral-900">Communication</span>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-1">
                <ToggleSwitch
                  checked={settings.communicationPreferences.allowMessages}
                  onChange={(value) => handleNestedChange('communicationPreferences', 'allowMessages', value)}
                  label="Allow Messages"
                  description="Allow other users to send you messages"
                />
                <ToggleSwitch
                  checked={settings.communicationPreferences.showOnlineStatus}
                  onChange={(value) => handleNestedChange('communicationPreferences', 'showOnlineStatus', value)}
                  label="Show Online Status"
                  description="Let others see when you're online"
                />
                <ToggleSwitch
                  checked={settings.communicationPreferences.shareContactInfo}
                  onChange={(value) => handleNestedChange('communicationPreferences', 'shareContactInfo', value)}
                  label="Share Contact Information"
                  description="Allow verified sellers to see your contact details"
                />
              </div>
            </div>

            {/* Data Retention */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2">
                <Shield className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-neutral-900">Data Retention</span>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <ToggleSwitch
                  checked={settings.dataRetention.autoDeleteOldData}
                  onChange={(value) => handleNestedChange('dataRetention', 'autoDeleteOldData', value)}
                  label="Auto-delete Old Data"
                  description="Automatically remove old activity data based on retention period"
                />
                
                {settings.dataRetention.autoDeleteOldData && (
                  <div className="mt-4 pl-4 border-l-2 border-neutral-300">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Retention Period
                    </label>
                    <select
                      value={settings.dataRetention.retentionPeriod}
                      onChange={(e) => handleNestedChange('dataRetention', 'retentionPeriod', e.target.value)}
                      className="input-field"
                    >
                      <option value="6months">6 Months</option>
                      <option value="1year">1 Year</option>
                      <option value="2years">2 Years</option>
                      <option value="never">Never Delete</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Your Privacy Matters</p>
                  <p className="text-xs leading-relaxed">
                    We are committed to protecting your privacy and giving you control over your data. 
                    These settings help you customize how your information is collected, used, and shared. 
                    You can change these preferences at any time.
                  </p>
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
              <span>{isSubmitting ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PrivacySettingsModal;