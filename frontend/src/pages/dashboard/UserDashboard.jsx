import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Package, 
  ShoppingCart, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit,
  Eye,
  Download,
  Star,
  Truck,
  CheckCircle,
  AlertCircle,
  Loader,
  Camera,
  Lock,
  Save,
  X,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUserOrders, useUserRequests } from '../../hooks/useApi';
import apiService from '../../services/api';
import RequestViewModal from '../../components/common/RequestViewModal';
import OrderViewModal from '../../components/common/OrderViewModal';
import ProfileEditModal from '../../components/common/ProfileEditModal';
import NotificationPreferencesModal from '../../components/common/NotificationPreferencesModal';
import PrivacySettingsModal from '../../components/common/PrivacySettingsModal';
import InvoiceModal from '../../components/common/InvoiceModal';
import OrderEditModal from '../../components/common/OrderEditModal';
import RequestEditModal from '../../components/common/RequestEditModal';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, updateProfile, changePassword, refreshUser } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showOrderEditModal, setShowOrderEditModal] = useState(false);
  const [showRequestEditModal, setShowRequestEditModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // API calls
  const { data: ordersData, loading: ordersLoading, refetch: refetchOrders } = useUserOrders({ limit: 10 });
  const { data: requestsData, loading: requestsLoading, refetch: refetchRequests } = useUserRequests({ limit: 10 });

  const orders = ordersData?.data?.orders || [];
  const requests = requestsData?.data?.requests || [];

  // Helper function to check if item can be edited/cancelled (within 10 minutes)
  const canEditOrCancel = (createdAt) => {
    const now = new Date();
    const createdTime = new Date(createdAt);
    const timeDiff = now - createdTime;
    const tenMinutesInMs = 10 * 60 * 1000; // 10 minutes in milliseconds
    return timeDiff <= tenMinutesInMs;
  };

  // Calculate stats
  const stats = [
    { 
      id: 1, 
      name: 'Total Orders', 
      value: ordersData?.data?.pagination?.total || 0, 
      icon: ShoppingCart, 
      color: 'primary' 
    },
    { 
      id: 2, 
      name: 'Active Requests', 
      value: requests.filter(r => ['pending', 'approved', 'processing'].includes(r.status)).length, 
      icon: Package, 
      color: 'warning' 
    },
    { 
      id: 3, 
      name: 'Completed', 
      value: orders.filter(o => o.status === 'delivered').length, 
      icon: CheckCircle, 
      color: 'success' 
    },
    { 
      id: 4, 
      name: 'In Transit', 
      value: orders.filter(o => ['shipped', 'processing'].includes(o.status)).length, 
      icon: Truck, 
      color: 'secondary' 
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'orders', name: 'My Orders' },
    { id: 'requests', name: 'Product Requests' },
    { id: 'profile', name: 'Profile' }
  ];

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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderEditModal(true);
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const reason = prompt('Please provide a reason for cancellation (optional):') || '';
      await apiService.cancelUserOrder(order._id, reason);
      await refetchOrders();
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert(error.message || 'Failed to cancel order. Please try again.');
    }
  };

  const handleSaveOrderEdit = async (orderId, orderData) => {
    try {
      await apiService.editUserOrder(orderId, orderData);
      await refetchOrders();
      alert('Order updated successfully');
    } catch (error) {
      console.error('Failed to update order:', error);
      alert(error.message || 'Failed to update order. Please try again.');
      throw error;
    }
  };

  const handleViewInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoiceModal(true);
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const handleEditRequest = (request) => {
    setSelectedRequest(request);
    setShowRequestEditModal(true);
  };

  const handleCancelRequest = async (request) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      const reason = prompt('Please provide a reason for cancellation (optional):') || '';
      await apiService.cancelUserRequest(request._id, reason);
      await refetchRequests();
      alert('Request cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert(error.message || 'Failed to cancel request. Please try again.');
    }
  };

  const handleSaveRequestEdit = async (requestId, requestData) => {
    try {
      await apiService.editUserRequest(requestId, requestData);
      await refetchRequests();
      alert('Request updated successfully');
    } catch (error) {
      console.error('Failed to update request:', error);
      alert(error.message || 'Failed to update request. Please try again.');
      throw error;
    }
  };

  const handleProfileEdit = () => {
    setShowProfileEditModal(true);
  };

  const handleProfileUpdate = async (profileData) => {
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        await refreshUser();
        return result;
      }
      throw new Error(result.message || 'Failed to update profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const handlePasswordChangeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsChangingPassword(!isChangingPassword);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsChangingPassword(false);
        alert('Password changed successfully');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password. Please check your current password.');
    }
  };

  const handleNotificationPreferences = () => {
    setShowNotificationModal(true);
  };

  const handlePrivacySettings = () => {
    setShowPrivacyModal(true);
  };

  const handleSaveNotificationPreferences = async (preferences) => {
    try {
      // Implement API call to save notification preferences
      console.log('Saving notification preferences:', preferences);
      // await apiService.updateNotificationPreferences(preferences);
      alert('Notification preferences updated successfully!');
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  };

  const handleSavePrivacySettings = async (settings) => {
    try {
      // Implement API call to save privacy settings
      console.log('Saving privacy settings:', settings);
      // await apiService.updatePrivacySettings(settings);
      alert('Privacy settings updated successfully!');
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      throw error;
    }
  };
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-neutral-600">
                Manage your orders, requests, and profile
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-neutral-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.id} className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">{stat.name}</p>
                      <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                {ordersLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader className="w-6 h-6 animate-spin text-primary-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => {
                      const StatusIcon = getStatusIcon(order.status);
                      return (
                        <div key={order._id} className="flex items-center space-x-4 p-3 bg-neutral-50 rounded-lg">
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-sm text-neutral-600">€{order.finalAmount}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="w-4 h-4 text-neutral-500" />
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Requests</h3>
                {requestsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader className="w-6 h-6 animate-spin text-primary-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.slice(0, 3).map((request) => {
                      const StatusIcon = getStatusIcon(request.status);
                      return (
                        <div key={request._id} className="flex items-center space-x-4 p-3 bg-neutral-50 rounded-lg">
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{request.requestNumber}</p>
                            <p className="text-sm text-neutral-600">€{request.totalCost || request.estimatedPrice}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="w-4 h-4 text-neutral-500" />
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">My Orders</h2>
              <p className="text-neutral-600">Track and manage your Ethiopian product orders</p>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <div key={order._id} className="card p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900">
                            Order {order.orderNumber}
                          </h3>
                          <p className="text-neutral-600">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                          <StatusIcon className="w-5 h-5 text-neutral-500" />
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-neutral-200 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {order.items[0] && (
                              <>
                                <img
                                  src={order.items[0].image}
                                  alt={order.items[0].name}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="font-medium">{order.items[0].name}</p>
                                  <p className="text-sm text-neutral-600">
                                    {order.items.length > 1 
                                      ? `+${order.items.length - 1} more items`
                                      : `Quantity: ${order.items[0].quantity}`
                                    }
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-neutral-900">€{order.finalAmount}</p>
                            <div className="flex items-center space-x-2 mt-2 flex-wrap">
                              <button 
                                onClick={() => handleViewOrder(order)}
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                              >
                                <Eye className="w-4 h-4 inline mr-1" />
                                View Details
                              </button>
                              {order.status === 'delivered' && (
                                <button 
                                  onClick={() => handleViewInvoice(order)}
                                  className="text-neutral-600 hover:text-neutral-700 text-sm font-medium"
                                >
                                  <Download className="w-4 h-4 inline mr-1" />
                                  Invoice
                                </button>
                              )}
                              {canEditOrCancel(order.createdAt) && order.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleEditOrder(order)}
                                    className="text-warning-600 hover:text-warning-700 text-sm font-medium"
                                  >
                                    <Edit className="w-4 h-4 inline mr-1" />
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleCancelOrder(order)}
                                    className="text-error-600 hover:text-error-700 text-sm font-medium"
                                  >
                                    <XCircle className="w-4 h-4 inline mr-1" />
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Product Requests</h2>
              <p className="text-neutral-600">Track your international product requests</p>
            </div>

            {requestsLoading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => {
                  const StatusIcon = getStatusIcon(request.status);
                  return (
                    <div key={request._id} className="card p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900">
                            {request.requestNumber}
                          </h3>
                          <p className="text-neutral-600">
                            Requested on {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                          <StatusIcon className="w-5 h-5 text-neutral-500" />
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-neutral-200 pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-neutral-900">{request.productName}</p>
                            <p className="text-sm text-neutral-600 truncate max-w-md">
                              {request.productUrl}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-neutral-900">
                              €{request.totalCost || request.estimatedPrice}
                            </p>
                            <div className="flex items-center space-x-2 mt-2 flex-wrap justify-end">
                              <button 
                                onClick={() => handleViewRequest(request)}
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                              >
                                <Eye className="w-4 h-4 inline mr-1" />
                                View Details
                              </button>
                              {canEditOrCancel(request.createdAt) && request.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleEditRequest(request)}
                                    className="text-warning-600 hover:text-warning-700 text-sm font-medium"
                                  >
                                    <Edit className="w-4 h-4 inline mr-1" />
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleCancelRequest(request)}
                                    className="text-error-600 hover:text-error-700 text-sm font-medium"
                                  >
                                    <XCircle className="w-4 h-4 inline mr-1" />
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Profile Settings</h2>
              <p className="text-neutral-600">Manage your account information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <button 
                    type="button"
                    onClick={handleProfileEdit}
                    className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50 transition-colors duration-200"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-600">Full Name</p>
                      <p className="font-medium">{user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-600">Email Address</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-600">Phone Number</p>
                      <p className="font-medium">{user?.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-600">Address</p>
                      <p className="font-medium">
                        {user?.address ? 
                          `${user.address.street}, ${user.address.city}, ${user.address.country}` : 
                          'Not provided'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-6">Account Settings</h3>

                <div className="space-y-4">
                  <button 
                    type="button"
                    onClick={handlePasswordChangeClick}
                    className="w-full text-left p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Change Password</p>
                        <p className="text-sm text-neutral-600">Update your account password</p>
                      </div>
                      <Lock className="w-5 h-5 text-neutral-400" />
                    </div>
                  </button>

                  {isChangingPassword && (
                    <form onSubmit={handlePasswordChange} className="space-y-4 p-4 bg-neutral-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          required
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          required
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          required
                          className="input-field"
                        />
                      </div>
                      
                      <div className="flex space-x-4">
                        <button type="submit" className="btn-primary flex items-center space-x-2">
                          <Save className="w-4 h-4" />
                          <span>Change Password</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setIsChangingPassword(false)}
                          className="btn-outline flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </form>
                  )}

                  <button 
                    type="button"
                    onClick={handleNotificationPreferences}
                    className="w-full text-left p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notification Preferences</p>
                        <p className="text-sm text-neutral-600">Manage email and SMS notifications</p>
                      </div>
                      <Edit className="w-5 h-5 text-neutral-400" />
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={handlePrivacySettings}
                    className="w-full text-left p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Privacy Settings</p>
                        <p className="text-sm text-neutral-600">Control your data and privacy</p>
                      </div>
                      <Edit className="w-5 h-5 text-neutral-400" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Modals */}
        <RequestViewModal
          request={selectedRequest}
          isOpen={showRequestModal}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedRequest(null);
          }}
        />

        <OrderViewModal
          order={selectedOrder}
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
        />

        <ProfileEditModal
          user={user}
          isOpen={showProfileEditModal}
          onClose={() => setShowProfileEditModal(false)}
          onSave={handleProfileUpdate}
        />

        <NotificationPreferencesModal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          onSave={handleSaveNotificationPreferences}
          currentPreferences={user?.notificationPreferences}
        />

        <PrivacySettingsModal
          isOpen={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
          onSave={handleSavePrivacySettings}
          currentSettings={user?.privacySettings}
        />

        <InvoiceModal
          order={selectedOrder}
          isOpen={showInvoiceModal}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedOrder(null);
          }}
        />

        <OrderEditModal
          order={selectedOrder}
          isOpen={showOrderEditModal}
          onClose={() => {
            setShowOrderEditModal(false);
            setSelectedOrder(null);
          }}
          onSave={handleSaveOrderEdit}
        />

        <RequestEditModal
          request={selectedRequest}
          isOpen={showRequestEditModal}
          onClose={() => {
            setShowRequestEditModal(false);
            setSelectedRequest(null);
          }}
          onSave={handleSaveRequestEdit}
        />
      </div>
    </div>
  );
};

export default UserDashboard;