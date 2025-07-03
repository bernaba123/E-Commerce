import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  ShoppingCart,
  Package,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const UserViewModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-success-100 text-success-700' 
      : 'bg-error-100 text-error-700';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'seller': return 'bg-blue-100 text-blue-700';
      default: return 'bg-neutral-100 text-neutral-700';
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
          <h2 className="text-2xl font-bold text-neutral-900">User Details</h2>
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
            {/* User Profile */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-neutral-50 p-6 rounded-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">{user.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-600">Email</p>
                      <p className="font-medium text-neutral-900">{user.email}</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="text-sm text-neutral-600">Phone Number</p>
                        <p className="font-medium text-neutral-900">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  {user.address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="text-sm text-neutral-600">Address</p>
                        <p className="font-medium text-neutral-900">
                          {user.address.street}, {user.address.city}, {user.address.country}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-600">Member Since</p>
                      <p className="font-medium text-neutral-900">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-600">Last Activity</p>
                      <p className="font-medium text-neutral-900">
                        {user.lastLoginAt 
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never logged in'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div className="bg-neutral-50 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">Account Security</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Email Verified</span>
                    <div className="flex items-center space-x-2">
                      {user.emailVerified ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-warning-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        user.emailVerified ? 'text-success-700' : 'text-warning-700'
                      }`}>
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Two-Factor Auth</span>
                    <div className="flex items-center space-x-2">
                      {user.twoFactorEnabled ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-neutral-400" />
                      )}
                      <span className={`text-sm font-medium ${
                        user.twoFactorEnabled ? 'text-success-700' : 'text-neutral-600'
                      }`}>
                        {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Login Attempts</span>
                    <span className="text-sm font-medium text-neutral-900">
                      {user.failedLoginAttempts || 0} failed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity & Statistics */}
            <div className="space-y-6">
              {/* Order Statistics */}
              <div className="bg-neutral-50 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <ShoppingCart className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">Order Statistics</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">
                      {user.orderStats?.totalOrders || 0}
                    </div>
                    <div className="text-sm text-neutral-600">Total Orders</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-success-600">
                      €{user.orderStats?.totalSpent || 0}
                    </div>
                    <div className="text-sm text-neutral-600">Total Spent</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-warning-600">
                      {user.orderStats?.pendingOrders || 0}
                    </div>
                    <div className="text-sm text-neutral-600">Pending Orders</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-secondary-600">
                      €{user.orderStats?.avgOrderValue || 0}
                    </div>
                    <div className="text-sm text-neutral-600">Avg Order</div>
                  </div>
                </div>
              </div>

              {/* Request Statistics */}
              <div className="bg-neutral-50 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <Package className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">Request Statistics</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">
                      {user.requestStats?.totalRequests || 0}
                    </div>
                    <div className="text-sm text-neutral-600">Total Requests</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-success-600">
                      {user.requestStats?.approvedRequests || 0}
                    </div>
                    <div className="text-sm text-neutral-600">Approved</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-warning-600">
                      {user.requestStats?.pendingRequests || 0}
                    </div>
                    <div className="text-sm text-neutral-600">Pending</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-error-600">
                      {user.requestStats?.rejectedRequests || 0}
                    </div>
                    <div className="text-sm text-neutral-600">Rejected</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-neutral-50 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-neutral-900">Recent Activity</span>
                </div>
                
                <div className="space-y-3">
                  {user.recentActivity?.length > 0 ? (
                    user.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900">{activity.action}</p>
                          <p className="text-xs text-neutral-600">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Activity className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                      <p className="text-neutral-600">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {user.adminNotes && (
            <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Admin Notes</span>
              </div>
              <p className="text-blue-800 text-sm leading-relaxed">{user.adminNotes}</p>
            </div>
          )}
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

export default UserViewModal;