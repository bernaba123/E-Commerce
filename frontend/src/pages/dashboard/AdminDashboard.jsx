import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  Clock,
  Search,
  Filter,
  Loader,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Truck,
  Bell,
  Shield,
  Settings,
  Globe,
  Monitor,
  Smartphone,
  Key,
  Activity,
  Database,
  FileText,
  Wifi,
  Clock4,
  ExternalLink
} from 'lucide-react';
import { 
  useProducts, 
  useOrderStats, 
  useProductStats, 
  useRequestStats, 
  useUserStats,
  useRecentOrders,
  useRequests,
  useUsers,
  useAllOrders
} from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import ProductViewModal from '../../components/admin/ProductViewModal';
import ProductEditModal from '../../components/admin/ProductEditModal';
import OrderViewModal from '../../components/common/OrderViewModal';
import OrderEditModal from '../../components/admin/OrderEditModal';
import OrderTrackingCard from '../../components/admin/OrderTrackingCard';
import ProfileEditModal from '../../components/common/ProfileEditModal';
import UserViewModal from '../../components/admin/UserViewModal';
import UserEditModal from '../../components/admin/UserEditModal';
import ProductRequestEditModal from '../../components/admin/ProductRequestEditModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingStockStatuses, setIsUpdatingStockStatuses] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showOrderEditModal, setShowOrderEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showUserViewModal, setShowUserViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAdminPreferences, setShowAdminPreferences] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showRequestEditModal, setShowRequestEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const { user, updateProfile, changePassword, refreshUser } = useAuth();
  


  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Admin Preferences State
  const [adminPreferences, setAdminPreferences] = useState({
    emailNotifications: {
      newOrders: true,
      lowStock: true,
      newUsers: true,
      productRequests: true,
      systemUpdates: false
    },
    dashboardSettings: {
      autoRefresh: true,
      refreshInterval: 30, // seconds
      defaultView: 'overview',
      compactMode: false,
      showAdvancedStats: true
    },
    displayPreferences: {
      itemsPerPage: 10,
      dateFormat: 'MM/DD/YYYY',
      timezone: 'UTC',
      currency: 'EUR'
    }
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: {
      enabled: false,
      method: 'email', // 'email' or 'sms'
      backupCodes: []
    },
    sessionManagement: {
      sessionTimeout: 30, // minutes
      forceLogoutOtherSessions: false,
      rememberMe: true
    },
    loginSecurity: {
      loginAlerts: true,
      failedLoginThreshold: 5,
      accountLockoutDuration: 15, // minutes
      allowedIPs: [],
      restrictToIPs: false
    },
    dataPrivacy: {
      logRetention: 90, // days
      anonymizeData: false,
      shareAnalytics: false
    }
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'coffee',
    stock: '',
    images: [''],
    featured: false,
    tags: ''
  });

  // API calls for stats with error handling
  const { data: orderStatsData, loading: orderStatsLoading, error: orderStatsError } = useOrderStats();
  const { data: productStatsData, loading: productStatsLoading, error: productStatsError, refetch: refetchProductStats } = useProductStats();
  const { data: requestStatsData, loading: requestStatsLoading, error: requestStatsError } = useRequestStats();
  const { data: userStatsData, loading: userStatsLoading, error: userStatsError } = useUserStats();
  const { data: productsData, loading: productsLoading, refetch: refetchProducts } = useProducts({ limit: 10 });
  
  // API call for recent orders with error handling
  const { data: recentOrdersData, loading: recentOrdersLoading, error: recentOrdersError } = useRecentOrders({ 
    limit: 3, 
    sort: 'createdAt' 
  });

  // API call for requests with error handling
  const { data: requestsData, loading: requestsLoading, error: requestsError, refetch: refetchRequests } = useRequests({
    limit: 20,
    sort: 'createdAt'
  });

  // API call for users with error handling
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers({
    limit: 20,
    sort: 'createdAt'
  });

  // API call for all orders with error handling
  const { data: allOrdersData, loading: allOrdersLoading, error: allOrdersError, refetch: refetchAllOrders } = useAllOrders({
    limit: 20,
    sort: 'createdAt'
  });

  // Load preferences from localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('adminPreferences');
    const savedSecuritySettings = localStorage.getItem('adminSecuritySettings');
    
    if (savedPreferences) {
      try {
        setAdminPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Error loading admin preferences:', error);
      }
    }
    
    if (savedSecuritySettings) {
      try {
        setSecuritySettings(JSON.parse(savedSecuritySettings));
      } catch (error) {
        console.error('Error loading security settings:', error);
      }
    }
  }, []);

  // Safely extract data with fallbacks
  const orderStats = orderStatsData?.data || {};
  const productStats = productStatsData?.data || {};
  const requestStats = requestStatsData?.data || {};
  const userStats = userStatsData?.data || {};
  const products = productsData?.data?.products || [];
  const recentOrders = recentOrdersData?.data?.orders || [];
  const requests = requestsData?.data?.requests || [];
  const users = usersData?.data?.users || [];
  const allOrders = allOrdersData?.data?.orders || [];

  // Calculate stock alerts
  const stockAlerts = {
    outOfStock: productStats.outOfStock || 0,
    lowStock: productStats.lowStock || 0,
    needsAttention: (productStats.outOfStock || 0) + (productStats.lowStock || 0),
    lowStockProducts: productStats.lowStockProducts || []
  };

  const stats = [
    { 
      id: 1, 
      name: 'Total Users', 
      value: userStats.totalUsers || 0, 
      change: '+12%', 
      icon: Users, 
      color: 'primary' 
    },
    { 
      id: 2, 
      name: 'Products', 
      value: productStats.totalProducts || 0, 
      change: '+8%', 
      icon: Package, 
      color: 'secondary' 
    },
    { 
      id: 3, 
      name: 'Orders', 
      value: orderStats.totalOrders || 0, 
      change: '+23%', 
      icon: ShoppingCart, 
      color: 'success' 
    },
    { 
      id: 4, 
      name: 'Revenue', 
      value: `€${(orderStats.totalRevenue || 0).toLocaleString()}`, 
      change: '+15%', 
      icon: TrendingUp, 
      color: 'warning' 
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'products', name: 'Products' },
    { id: 'requests', name: 'Product Requests' },
    { id: 'users', name: 'Users' },
    { id: 'orders', name: 'Orders' },
    { id: 'tracking', name: 'Order Tracking' },
    { id: 'profile', name: 'Profile' }
  ];

  const categories = [
    { value: 'coffee', label: 'Coffee' },
    { value: 'spices', label: 'Spices' },
    { value: 'food', label: 'Food' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'crafts', label: 'Crafts' },
    { value: 'other', label: 'Other' }
  ];

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'images') {
      const index = parseInt(e.target.dataset.index);
      const newImages = [...productForm.images];
      newImages[index] = value;
      setProductForm(prev => ({ ...prev, images: newImages }));
    } else {
      setProductForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const addImageField = () => {
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        stock: parseInt(productForm.stock),
        images: productForm.images.filter(img => img.trim() !== ''),
        tags: productForm.tags ? productForm.tags.split(',').map(tag => tag.trim()) : []
      };

      const response = await apiService.createProduct(productData);
      
      if (response.success) {
        setShowAddProduct(false);
        setProductForm({
          name: '',
          description: '',
          price: '',
          originalPrice: '',
          category: 'coffee',
          stock: '',
          images: [''],
          featured: false,
          tags: ''
        });
        refetchProducts();
        refetchProductStats();
        alert('Product added successfully!');
      }
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderEditModal(true);
  };

  const handleOrderSave = () => {
    // Refresh orders data after save
    refetchAllOrders();
    setShowOrderEditModal(false);
    setSelectedOrder(null);
  };

  const handleViewUser = (userData) => {
    setSelectedUser(userData);
    setShowUserViewModal(true);
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

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleSaveProduct = async (productId, productData) => {
    try {
      await apiService.updateProduct(productId, productData);
      refetchProducts();
      refetchProductStats();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const handleUpdateAllStockStatuses = async () => {
    setIsUpdatingStockStatuses(true);
    try {
      await apiService.updateAllStockStatuses();
      refetchProducts();
      refetchProductStats();
      alert('All product stock statuses updated successfully!');
    } catch (error) {
      console.error('Failed to update stock statuses:', error);
      alert('Failed to update stock statuses. Please try again.');
    } finally {
      setIsUpdatingStockStatuses(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning-100 text-warning-700';
      case 'approved': return 'bg-success-100 text-success-700';
      case 'processing': return 'bg-primary-100 text-primary-700';
      case 'active': return 'bg-success-100 text-success-700';
      case 'out_of_stock': return 'bg-error-100 text-error-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return Check;
      case 'processing': return Package;
      case 'shipped': return Package;
      case 'delivered': return Check;
      default: return Clock;
    }
  };

  const getStockStatusColor = (stockStatus, inStock) => {
    if (!inStock || stockStatus === 'Out of Stock') {
      return 'bg-error-100 text-error-700';
    } else if (stockStatus === 'Low Stock') {
      return 'bg-warning-100 text-warning-700';
    } else {
      return 'bg-success-100 text-success-700';
    }
  };

  const handleUpdateProductStatus = async (productId, isActive) => {
    try {
      await apiService.updateProduct(productId, { isActive });
      refetchProducts();
      refetchProductStats();
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiService.deleteProduct(productId);
        refetchProducts();
        refetchProductStats();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  // Admin Preferences Handlers
  const handlePreferenceChange = (section, key, value) => {
    setAdminPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const saveAdminPreferences = () => {
    try {
      localStorage.setItem('adminPreferences', JSON.stringify(adminPreferences));
      alert('Admin preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
  };

  // Security Settings Handlers
  const handleSecurityChange = (section, key, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const saveSecuritySettings = () => {
    try {
      localStorage.setItem('adminSecuritySettings', JSON.stringify(securitySettings));
      alert('Security settings saved successfully!');
    } catch (error) {
      console.error('Error saving security settings:', error);
      alert('Failed to save security settings. Please try again.');
    }
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
    }
    handleSecurityChange('twoFactorAuth', 'backupCodes', codes);
    alert('Backup codes generated! Make sure to save them in a secure location.');
  };

  const resetSecuritySettings = () => {
    if (window.confirm('Are you sure you want to reset all security settings to default? This action cannot be undone.')) {
      setSecuritySettings({
        twoFactorAuth: {
          enabled: false,
          method: 'email',
          backupCodes: []
        },
        sessionManagement: {
          sessionTimeout: 30,
          forceLogoutOtherSessions: false,
          rememberMe: true
        },
        loginSecurity: {
          loginAlerts: true,
          failedLoginThreshold: 5,
          accountLockoutDuration: 15,
          allowedIPs: [],
          restrictToIPs: false
        },
        dataPrivacy: {
          logRetention: 90,
          anonymizeData: false,
          shareAnalytics: false
        }
      });
      localStorage.removeItem('adminSecuritySettings');
      alert('Security settings have been reset to default values.');
    }
  };

  // User Management Handlers
  const handleEditUser = (userData) => {
    setEditingUser(userData);
    setShowUserEditModal(true);
  };

  const handleSaveUser = async (userId, userData) => {
    try {
      await apiService.updateUser(userId, userData);
      refetchUsers();
      setShowUserEditModal(false);
      setEditingUser(null);
      alert('User updated successfully!');
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeactivateUser = async (userId, userName) => {
    const action = 'deactivate';
    const confirmMessage = `Are you sure you want to ${action} user "${userName}"? They will no longer be able to access their account.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await apiService.updateUser(userId, { isActive: false });
        refetchUsers();
        alert(`User "${userName}" has been deactivated successfully.`);
      } catch (error) {
        console.error(`Failed to ${action} user:`, error);
        alert(`Failed to ${action} user. Please try again.`);
      }
    }
  };

  const handleActivateUser = async (userId, userName) => {
    try {
      await apiService.updateUser(userId, { isActive: true });
      refetchUsers();
      alert(`User "${userName}" has been activated successfully.`);
    } catch (error) {
      console.error('Failed to activate user:', error);
      alert('Failed to activate user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmMessage = `Are you sure you want to permanently delete user "${userName}"? This action cannot be undone and will remove all their data.`;
    
    if (window.confirm(confirmMessage)) {
      const doubleConfirm = window.confirm('This will permanently delete all user data. Are you absolutely sure?');
      if (doubleConfirm) {
        try {
          await apiService.deleteUser(userId);
          refetchUsers();
          alert(`User "${userName}" has been permanently deleted.`);
        } catch (error) {
          console.error('Failed to delete user:', error);
          alert('Failed to delete user. Please try again.');
        }
      }
    }
  };

  // Product Request Management Handlers
  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setShowRequestEditModal(true);
  };

  const handleSaveRequest = async (requestId, requestData) => {
    try {
      await apiService.updateProductRequest(requestId, requestData);
      refetchRequests();
      setShowRequestEditModal(false);
      setEditingRequest(null);
      alert('Product request updated successfully!');
    } catch (error) {
      console.error('Failed to update product request:', error);
      alert('Failed to update product request. Please try again.');
    }
  };

  const handleDeleteRequest = async (requestId, requestNumber) => {
    const confirmMessage = `Are you sure you want to delete product request "${requestNumber}"? This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await apiService.deleteProductRequest(requestId);
        refetchRequests();
        alert(`Product request "${requestNumber}" has been deleted successfully.`);
      } catch (error) {
        console.error('Failed to delete product request:', error);
        alert('Failed to delete product request. Please try again.');
      }
    }
  };

  const handleViewRequest = (request) => {
    // Implementation for viewing detailed request information
    alert(`Viewing details for request ${request.requestNumber}. Product: ${request.productName}`);
  };

  // Show loading state if user data is not available
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
              <p className="text-neutral-600 mt-2">
                Welcome back, {user?.name}! Manage your EthioConnect platform
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
            {/* Stock Alerts */}
            {stockAlerts.needsAttention > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-warning-50 border border-warning-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-6 h-6 text-warning-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-warning-900 mb-2">
                        Stock Alert: {stockAlerts.needsAttention} Products Need Attention
                      </h3>
                      <div className="space-y-1 text-sm text-warning-800">
                        {stockAlerts.outOfStock > 0 && (
                          <p>• {stockAlerts.outOfStock} products are out of stock</p>
                        )}
                        {stockAlerts.lowStock > 0 && (
                          <p>• {stockAlerts.lowStock} products have low stock (≤5 units)</p>
                        )}
                      </div>
                      
                      {/* Show specific low stock products */}
                      {stockAlerts.lowStockProducts.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-warning-900 mb-2">Products needing attention:</h4>
                          <div className="space-y-2">
                            {stockAlerts.lowStockProducts.slice(0, 5).map((product) => (
                              <div key={product._id} className="flex items-center justify-between bg-warning-100 rounded-lg p-3">
                                <div>
                                  <span className="font-medium text-warning-900">{product.name}</span>
                                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                    getStockStatusColor(product.stockStatus, product.stock > 0)
                                  }`}>
                                    {product.stockStatus}
                                  </span>
                                </div>
                                <span className="text-warning-700 font-medium">
                                  {product.stock} units left
                                </span>
                              </div>
                            ))}
                            {stockAlerts.lowStockProducts.length > 5 && (
                              <p className="text-sm text-warning-700">
                                ...and {stockAlerts.lowStockProducts.length - 5} more products
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateAllStockStatuses}
                      disabled={isUpdatingStockStatuses}
                      className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isUpdatingStockStatuses ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Update All</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="btn-outline text-sm"
                    >
                      Manage Products
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.id} className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">{stat.name}</p>
                      <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                      <p className={`text-sm ${stat.change.includes('+') ? 'text-success-600' : 'text-error-600'}`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stock Status Overview */}
            {productStats.stockStatusStats && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                    <span>Stock Status Distribution</span>
                  </h3>
                  <button
                    onClick={handleUpdateAllStockStatuses}
                    disabled={isUpdatingStockStatuses}
                    className="btn-outline text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isUpdatingStockStatuses ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {productStats.stockStatusStats.map((status) => (
                    <div key={status._id} className="bg-neutral-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-neutral-600">{status._id}</p>
                          <p className="text-2xl font-bold text-neutral-900">{status.count}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          status._id === 'Available' ? 'bg-success-500' :
                          status._id === 'Low Stock' ? 'bg-warning-500' :
                          'bg-error-500'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Tracking Overview */}
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-6">Order Tracking Management</h3>
              <OrderTrackingCard orders={allOrders} />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                {recentOrdersLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader className="w-6 h-6 animate-spin text-primary-600" />
                  </div>
                ) : recentOrdersError ? (
                  <div className="text-center text-neutral-500 py-8">
                    <p>Unable to load recent orders</p>
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => {
                      const StatusIcon = getStatusIcon(order.status);
                      return (
                        <div key={order._id} className="flex items-center space-x-4 p-3 bg-neutral-50 rounded-lg">
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-sm text-neutral-600">
                              {order.user?.name || 'Unknown Customer'}
                            </p>
                            <p className="text-sm text-neutral-600">€{order.finalAmount}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className="w-4 h-4 text-neutral-500" />
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-neutral-500 py-8">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h4 className="text-lg font-semibold text-neutral-900 mb-2">No Recent Orders</h4>
                    <p className="text-sm">Orders will appear here when customers make purchases.</p>
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Pending Requests</h3>
                <div className="space-y-4">
                  <div className="text-center text-neutral-500 py-8">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending requests</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Products Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Products</h2>
                <p className="text-neutral-600">Manage your Ethiopian product catalog</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleUpdateAllStockStatuses}
                  disabled={isUpdatingStockStatuses}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUpdatingStockStatuses ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Update Stock Status</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setShowAddProduct(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Stock Status Alert for Products Tab */}
            {stockAlerts.needsAttention > 0 && (
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-warning-600" />
                  <span className="text-warning-800 font-medium">
                    {stockAlerts.needsAttention} products need attention: {stockAlerts.outOfStock} out of stock, {stockAlerts.lowStock} low stock
                  </span>
                </div>
              </div>
            )}

            {/* Add Product Modal */}
            {showAddProduct && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-neutral-900">Add New Product</h3>
                      <button
                        onClick={() => setShowAddProduct(false)}
                        className="text-neutral-400 hover:text-neutral-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmitProduct} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={productForm.name}
                            onChange={handleProductFormChange}
                            required
                            className="input-field"
                            placeholder="Enter product name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Category *
                          </label>
                          <select
                            name="category"
                            value={productForm.category}
                            onChange={handleProductFormChange}
                            required
                            className="input-field"
                          >
                            {categories.map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Price (€) *
                          </label>
                          <input
                            type="number"
                            name="price"
                            value={productForm.price}
                            onChange={handleProductFormChange}
                            required
                            min="0"
                            step="0.01"
                            className="input-field"
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Original Price (€)
                          </label>
                          <input
                            type="number"
                            name="originalPrice"
                            value={productForm.originalPrice}
                            onChange={handleProductFormChange}
                            min="0"
                            step="0.01"
                            className="input-field"
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Stock Quantity *
                          </label>
                          <input
                            type="number"
                            name="stock"
                            value={productForm.stock}
                            onChange={handleProductFormChange}
                            required
                            min="0"
                            className="input-field"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Tags (comma separated)
                          </label>
                          <input
                            type="text"
                            name="tags"
                            value={productForm.tags}
                            onChange={handleProductFormChange}
                            className="input-field"
                            placeholder="organic, premium, traditional"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          name="description"
                          value={productForm.description}
                          onChange={handleProductFormChange}
                          required
                          rows={4}
                          className="input-field"
                          placeholder="Enter product description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Product Images *
                        </label>
                        {productForm.images.map((image, index) => (
                          <div key={index} className="flex items-center space-x-2 mb-2">
                            <input
                              type="url"
                              name="images"
                              data-index={index}
                              value={image}
                              onChange={handleProductFormChange}
                              required={index === 0}
                              className="input-field flex-1"
                              placeholder="https://images.pexels.com/..."
                            />
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => removeImageField(index)}
                                className="text-error-600 hover:text-error-700"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addImageField}
                          className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add another image</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={productForm.featured}
                          onChange={handleProductFormChange}
                          className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        />
                        <label className="text-sm text-neutral-700">
                          Featured Product
                        </label>
                      </div>

                      <div className="flex justify-end space-x-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowAddProduct(false)}
                          className="btn-outline"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSubmitting ? 'Adding...' : 'Add Product'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Products Table */}
            <div className="card overflow-hidden">
              <div className="p-6 border-b border-neutral-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-64 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {products.filter(product => 
                        product.name.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((product) => (
                        <tr key={product._id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-neutral-900">
                                  {product.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            €{product.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            <div className="flex items-center space-x-2">
                              <span>{product.stock}</span>
                              {product.stock <= 5 && product.stock > 0 && (
                                <AlertTriangle className="w-4 h-4 text-warning-500" />
                              )}
                              {product.stock === 0 && (
                                <AlertTriangle className="w-4 h-4 text-error-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              getStockStatusColor(product.stockStatus, product.inStock)
                            }`}>
                              {product.stockStatus || (product.inStock ? 'Available' : 'Out of Stock')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleViewProduct(product)}
                                className="text-primary-600 hover:text-primary-900"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditProduct(product)}
                                className="text-neutral-600 hover:text-neutral-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-error-600 hover:text-error-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
              <h2 className="text-2xl font-bold text-neutral-900">Admin Profile Settings</h2>
              <p className="text-neutral-600">Manage your admin account information</p>
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
                    onClick={() => setShowAdminPreferences(!showAdminPreferences)}
                    className="w-full text-left p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Admin Preferences</p>
                        <p className="text-sm text-neutral-600">Manage admin dashboard settings</p>
                      </div>
                      <Settings className="w-5 h-5 text-neutral-400" />
                    </div>
                  </button>

                  {showAdminPreferences && (
                    <div className="space-y-6 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-neutral-900">Admin Preferences</h4>
                        <button
                          onClick={() => setShowAdminPreferences(false)}
                          className="text-neutral-400 hover:text-neutral-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Email Notifications */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Bell className="w-5 h-5 text-primary-600" />
                          <h5 className="font-medium text-neutral-900">Email Notifications</h5>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.entries(adminPreferences.emailNotifications).map(([key, value]) => (
                            <label key={key} className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => handlePreferenceChange('emailNotifications', key, e.target.checked)}
                                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-neutral-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Dashboard Settings */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Monitor className="w-5 h-5 text-primary-600" />
                          <h5 className="font-medium text-neutral-900">Dashboard Settings</h5>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={adminPreferences.dashboardSettings.autoRefresh}
                              onChange={(e) => handlePreferenceChange('dashboardSettings', 'autoRefresh', e.target.checked)}
                              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-neutral-700">Auto Refresh</span>
                          </label>
                          <div className="space-y-2">
                            <label className="text-sm text-neutral-700">Refresh Interval (seconds)</label>
                            <input
                              type="number"
                              min="10"
                              max="300"
                              value={adminPreferences.dashboardSettings.refreshInterval}
                              onChange={(e) => handlePreferenceChange('dashboardSettings', 'refreshInterval', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-neutral-700">Default View</label>
                            <select
                              value={adminPreferences.dashboardSettings.defaultView}
                              onChange={(e) => handlePreferenceChange('dashboardSettings', 'defaultView', e.target.value)}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="overview">Overview</option>
                              <option value="products">Products</option>
                              <option value="orders">Orders</option>
                              <option value="users">Users</option>
                            </select>
                          </div>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={adminPreferences.dashboardSettings.compactMode}
                              onChange={(e) => handlePreferenceChange('dashboardSettings', 'compactMode', e.target.checked)}
                              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-neutral-700">Compact Mode</span>
                          </label>
                        </div>
                      </div>

                      {/* Display Preferences */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-5 h-5 text-primary-600" />
                          <h5 className="font-medium text-neutral-900">Display Preferences</h5>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm text-neutral-700">Items Per Page</label>
                            <select
                              value={adminPreferences.displayPreferences.itemsPerPage}
                              onChange={(e) => handlePreferenceChange('displayPreferences', 'itemsPerPage', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                              <option value={50}>50</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-neutral-700">Date Format</label>
                            <select
                              value={adminPreferences.displayPreferences.dateFormat}
                              onChange={(e) => handlePreferenceChange('displayPreferences', 'dateFormat', e.target.value)}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-neutral-700">Timezone</label>
                            <select
                              value={adminPreferences.displayPreferences.timezone}
                              onChange={(e) => handlePreferenceChange('displayPreferences', 'timezone', e.target.value)}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="UTC">UTC</option>
                              <option value="America/New_York">Eastern Time</option>
                              <option value="America/Los_Angeles">Pacific Time</option>
                              <option value="Europe/London">London</option>
                              <option value="Europe/Berlin">Berlin</option>
                              <option value="Africa/Addis_Ababa">Addis Ababa</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-neutral-700">Currency</label>
                            <select
                              value={adminPreferences.displayPreferences.currency}
                              onChange={(e) => handlePreferenceChange('displayPreferences', 'currency', e.target.value)}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="EUR">EUR (€)</option>
                              <option value="USD">USD ($)</option>
                              <option value="ETB">ETB (Br)</option>
                              <option value="GBP">GBP (£)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4 pt-4 border-t border-neutral-200">
                        <button
                          onClick={() => setShowAdminPreferences(false)}
                          className="btn-outline"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveAdminPreferences}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Preferences</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <button 
                    type="button"
                    onClick={() => setShowSecuritySettings(!showSecuritySettings)}
                    className="w-full text-left p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Security Settings</p>
                        <p className="text-sm text-neutral-600">Two-factor authentication and security</p>
                      </div>
                      <Shield className="w-5 h-5 text-neutral-400" />
                    </div>
                  </button>

                  {showSecuritySettings && (
                    <div className="space-y-6 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-neutral-900">Security Settings</h4>
                        <button
                          onClick={() => setShowSecuritySettings(false)}
                          className="text-neutral-400 hover:text-neutral-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Two-Factor Authentication */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="w-5 h-5 text-primary-600" />
                          <h5 className="font-medium text-neutral-900">Two-Factor Authentication</h5>
                        </div>
                        <div className="space-y-4">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={securitySettings.twoFactorAuth.enabled}
                              onChange={(e) => handleSecurityChange('twoFactorAuth', 'enabled', e.target.checked)}
                              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-neutral-700">Enable Two-Factor Authentication</span>
                          </label>
                          {securitySettings.twoFactorAuth.enabled && (
                            <div className="space-y-4 pl-6 border-l-2 border-primary-200">
                              <div className="space-y-2">
                                <label className="text-sm text-neutral-700">Authentication Method</label>
                                <select
                                  value={securitySettings.twoFactorAuth.method}
                                  onChange={(e) => handleSecurityChange('twoFactorAuth', 'method', e.target.value)}
                                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                  <option value="email">Email</option>
                                  <option value="sms">SMS</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm text-neutral-700">Backup Codes</label>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={generateBackupCodes}
                                    className="btn-outline text-sm"
                                  >
                                    Generate Codes
                                  </button>
                                  {securitySettings.twoFactorAuth.backupCodes.length > 0 && (
                                    <span className="text-sm text-success-600 flex items-center">
                                      <Check className="w-4 h-4 mr-1" />
                                      {securitySettings.twoFactorAuth.backupCodes.length} codes generated
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Session Management */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Clock4 className="w-5 h-5 text-primary-600" />
                          <h5 className="font-medium text-neutral-900">Session Management</h5>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm text-neutral-700">Session Timeout (minutes)</label>
                            <input
                              type="number"
                              min="5"
                              max="480"
                              value={securitySettings.sessionManagement.sessionTimeout}
                              onChange={(e) => handleSecurityChange('sessionManagement', 'sessionTimeout', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={securitySettings.sessionManagement.rememberMe}
                              onChange={(e) => handleSecurityChange('sessionManagement', 'rememberMe', e.target.checked)}
                              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-neutral-700">Allow "Remember Me"</span>
                          </label>
                        </div>
                      </div>

                      {/* Login Security */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Key className="w-5 h-5 text-primary-600" />
                          <h5 className="font-medium text-neutral-900">Login Security</h5>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={securitySettings.loginSecurity.loginAlerts}
                              onChange={(e) => handleSecurityChange('loginSecurity', 'loginAlerts', e.target.checked)}
                              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-neutral-700">Login Alerts</span>
                          </label>
                          <div className="space-y-2">
                            <label className="text-sm text-neutral-700">Failed Login Threshold</label>
                            <input
                              type="number"
                              min="3"
                              max="10"
                              value={securitySettings.loginSecurity.failedLoginThreshold}
                              onChange={(e) => handleSecurityChange('loginSecurity', 'failedLoginThreshold', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-neutral-700">Lockout Duration (minutes)</label>
                            <input
                              type="number"
                              min="5"
                              max="60"
                              value={securitySettings.loginSecurity.accountLockoutDuration}
                              onChange={(e) => handleSecurityChange('loginSecurity', 'accountLockoutDuration', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Data Privacy */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Database className="w-5 h-5 text-primary-600" />
                          <h5 className="font-medium text-neutral-900">Data Privacy</h5>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm text-neutral-700">Log Retention (days)</label>
                            <input
                              type="number"
                              min="30"
                              max="365"
                              value={securitySettings.dataPrivacy.logRetention}
                              onChange={(e) => handleSecurityChange('dataPrivacy', 'logRetention', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={securitySettings.dataPrivacy.anonymizeData}
                              onChange={(e) => handleSecurityChange('dataPrivacy', 'anonymizeData', e.target.checked)}
                              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-neutral-700">Anonymize User Data</span>
                          </label>
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={securitySettings.dataPrivacy.shareAnalytics}
                              onChange={(e) => handleSecurityChange('dataPrivacy', 'shareAnalytics', e.target.checked)}
                              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-neutral-700">Share Analytics</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                        <button
                          onClick={resetSecuritySettings}
                          className="text-error-600 hover:text-error-700 text-sm flex items-center space-x-1"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>Reset to Defaults</span>
                        </button>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => setShowSecuritySettings(false)}
                            className="btn-outline"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveSecuritySettings}
                            className="btn-primary flex items-center space-x-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save Settings</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
              <p className="text-neutral-600">Review and manage customer product requests</p>
            </div>

            {requestsLoading ? (
              <div className="card p-8 text-center">
                <Loader className="w-16 h-16 mx-auto mb-4 text-neutral-400 animate-spin" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Loading Requests...</h3>
                <p className="text-neutral-600">Please wait while we fetch the product requests.</p>
              </div>
            ) : requestsError ? (
              <div className="card p-8 text-center">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-error-500" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Error Loading Requests</h3>
                <p className="text-neutral-600 mb-4">There was an error loading the product requests.</p>
                <button 
                  onClick={() => refetchRequests()}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : requests.length === 0 ? (
              <div className="card p-8 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Requests Yet</h3>
                <p className="text-neutral-600">Product requests will appear here when customers submit them.</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full sm:w-64 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button 
                      onClick={() => refetchRequests()}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Request #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {requests.filter(request => 
                        request.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        request.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        request.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        request.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((request) => {
                        const StatusIcon = getStatusIcon(request.status);
                        return (
                          <tr key={request._id} className="hover:bg-neutral-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-neutral-900">
                                {request.requestNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-neutral-900">
                                  {request.user?.name || 'N/A'}
                                </div>
                                <div className="text-sm text-neutral-500">
                                  {request.user?.email || 'N/A'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-neutral-900 max-w-xs truncate">
                                {request.productName}
                              </div>
                              <div className="text-sm text-neutral-500">
                                Qty: {request.quantity}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 capitalize">
                              {request.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {request.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                              {request.productPrice}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => handleViewRequest(request)}
                                  className="text-primary-600 hover:text-primary-900"
                                  title="View Request Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {request.productUrl && (
                                  <button 
                                    onClick={() => window.open(request.productUrl, '_blank')}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="View Product URL"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleEditRequest(request)}
                                  className="text-neutral-600 hover:text-neutral-900"
                                  title="Edit Request"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteRequest(request._id, request.requestNumber)}
                                  className="text-error-600 hover:text-error-900"
                                  title="Delete Request"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Users</h2>
              <p className="text-neutral-600">Manage platform users</p>
            </div>

            {usersLoading ? (
              <div className="card p-8 text-center">
                <Loader className="w-16 h-16 mx-auto mb-4 text-neutral-400 animate-spin" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Loading Users...</h3>
                <p className="text-neutral-600">Please wait while we fetch the users.</p>
              </div>
            ) : usersError ? (
              <div className="card p-8 text-center">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-error-500" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Error Loading Users</h3>
                <p className="text-neutral-600 mb-4">There was an error loading the users.</p>
                <button 
                  onClick={() => refetchUsers()}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : users.length === 0 ? (
              <div className="card p-8 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Users Found</h3>
                <p className="text-neutral-600">No users have registered yet.</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full sm:w-64 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button 
                      onClick={() => refetchUsers()}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {users.filter(userData => 
                        userData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        userData.email?.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((userData) => (
                        <tr key={userData._id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-neutral-900">
                                  {userData.name}
                                </div>
                                {userData.phone && (
                                  <div className="text-sm text-neutral-500">
                                    {userData.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-900">{userData.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              userData.role === 'admin' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {userData.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              userData.isActive 
                                ? 'bg-success-100 text-success-700' 
                                : 'bg-error-100 text-error-700'
                            }`}>
                              {userData.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            {new Date(userData.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleViewUser(userData)}
                                className="text-primary-600 hover:text-primary-900"
                                title="View User"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditUser(userData)}
                                className="text-neutral-600 hover:text-neutral-900"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {userData.role !== 'admin' && (
                                <>
                                  {userData.isActive ? (
                                    <button 
                                      onClick={() => handleDeactivateUser(userData._id, userData.name)}
                                      className="text-warning-600 hover:text-warning-900"
                                      title="Deactivate User"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleActivateUser(userData._id, userData.name)}
                                      className="text-success-600 hover:text-success-900"
                                      title="Activate User"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleDeleteUser(userData._id, userData.name)}
                                    className="text-error-600 hover:text-error-900"
                                    title="Delete User Permanently"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Orders</h2>
              <p className="text-neutral-600">Manage customer orders and view ordered products</p>
            </div>

            {allOrdersLoading ? (
              <div className="card p-8 text-center">
                <Loader className="w-16 h-16 mx-auto mb-4 text-neutral-400 animate-spin" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Loading Orders...</h3>
                <p className="text-neutral-600">Please wait while we fetch the orders.</p>
              </div>
            ) : allOrdersError ? (
              <div className="card p-8 text-center">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-error-500" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Error Loading Orders</h3>
                <p className="text-neutral-600 mb-4">There was an error loading the orders.</p>
                <button 
                  onClick={() => refetchAllOrders()}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : allOrders.length === 0 ? (
              <div className="card p-8 text-center">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Orders Found</h3>
                <p className="text-neutral-600">No orders have been placed yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="card overflow-hidden">
                  <div className="p-6 border-b border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search orders..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 w-full sm:w-64 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <button 
                        onClick={() => refetchAllOrders()}
                        className="btn-outline flex items-center space-x-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Order #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Products
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {allOrders
                          .filter(order => 
                            // Only show orders from non-admin users
                            order.user?.role !== 'admin' &&
                            (order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                          ).map((order) => {
                            const StatusIcon = getStatusIcon(order.status);
                            return (
                              <tr key={order._id} className="hover:bg-neutral-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-neutral-900">
                                    {order.orderNumber}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-neutral-900">
                                      {order.user?.name || 'N/A'}
                                    </div>
                                    <div className="text-sm text-neutral-500">
                                      {order.user?.email || 'N/A'}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    {order.items?.slice(0, 3).map((item, index) => (
                                      <div key={index} className="flex items-center space-x-2">
                                        {item.image && (
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-8 h-8 rounded object-cover"
                                          />
                                        )}
                                        <div>
                                          <div className="text-xs font-medium text-neutral-900 max-w-24 truncate">
                                            {item.name}
                                          </div>
                                          <div className="text-xs text-neutral-500">
                                            Qty: {item.quantity}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {order.items?.length > 3 && (
                                      <span className="text-xs text-neutral-500">
                                        +{order.items.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                  €{order.finalAmount || order.totalAmount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex items-center space-x-2">
                                    <button 
                                      onClick={() => handleViewOrder(order)}
                                      className="text-primary-600 hover:text-primary-900"
                                      title="View Order"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleEditOrder(order)}
                                      className="text-neutral-600 hover:text-neutral-900"
                                      title="Edit Order Status & Tracking"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Products Overview Section */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Most Ordered Products by Non-Admin Users</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                      // Calculate product frequencies from non-admin orders
                      const productFrequency = {};
                      allOrders
                        .filter(order => order.user?.role !== 'admin')
                        .forEach(order => {
                          order.items?.forEach(item => {
                            const productId = item.product?._id || item.product;
                            const productName = item.name;
                            const productImage = item.image;
                            
                            if (productId) {
                              if (!productFrequency[productId]) {
                                productFrequency[productId] = {
                                  name: productName,
                                  image: productImage,
                                  totalOrdered: 0,
                                  orderCount: 0
                                };
                              }
                              productFrequency[productId].totalOrdered += item.quantity;
                              productFrequency[productId].orderCount += 1;
                            }
                          });
                        });

                      // Sort by total quantity ordered and take top 6
                      const topProducts = Object.values(productFrequency)
                        .sort((a, b) => b.totalOrdered - a.totalOrdered)
                        .slice(0, 6);

                      return topProducts.length > 0 ? topProducts.map((product, index) => (
                        <div key={index} className="bg-neutral-50 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <div className="text-sm font-medium text-neutral-900">
                                {product.name}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {product.totalOrdered} units ordered
                              </div>
                              <div className="text-xs text-neutral-500">
                                {product.orderCount} orders
                              </div>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="col-span-full text-center py-8">
                          <Package className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                          <p className="text-neutral-600">No products ordered yet by non-admin users.</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Order Tracking Tab */}
        {activeTab === 'tracking' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Order Tracking Management</h2>
              <p className="text-neutral-600">Monitor and update order status and tracking information in real-time</p>
            </div>

            {/* Order Tracking Overview Cards */}
            <OrderTrackingCard orders={allOrders} />

            {/* Active Orders Management */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900">Active Orders</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-64 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <button 
                    onClick={() => refetchAllOrders()}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {allOrdersLoading ? (
                <div className="text-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                  <p className="text-neutral-600">Loading orders...</p>
                </div>
              ) : allOrdersError ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-error-500" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Error Loading Orders</h3>
                  <p className="text-neutral-600 mb-4">There was an error loading the orders.</p>
                  <button 
                    onClick={() => refetchAllOrders()}
                    className="btn-primary flex items-center space-x-2 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {allOrders
                    .filter(order => 
                      // Filter non-admin orders and search term
                      order.user?.role !== 'admin' &&
                      order.status !== 'delivered' &&
                      (order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((order) => {
                      const StatusIcon = getStatusIcon(order.status);
                      return (
                        <div key={order._id} className="bg-neutral-50 rounded-lg p-4 hover:bg-neutral-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <StatusIcon className="w-6 h-6 text-primary-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-neutral-900">Order #{order.orderNumber}</h4>
                                <div className="flex items-center space-x-4 text-sm text-neutral-600">
                                  <span>{order.user?.name || 'Unknown Customer'}</span>
                                  <span>•</span>
                                  <span>€{order.finalAmount || order.totalAmount}</span>
                                  <span>•</span>
                                  <span>{order.items?.length || 0} items</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                  {order.tracking?.trackingNumber && (
                                    <span className="text-xs text-neutral-500">
                                      Tracking: {order.tracking.trackingNumber}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="text-right mr-4">
                                <p className="text-xs text-neutral-500">
                                  Created: {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  Updated: {new Date(order.updatedAt).toLocaleDateString()}
                                </p>
                                {order.tracking?.estimatedDelivery && (
                                  <p className="text-xs text-primary-600">
                                    Est. Delivery: {new Date(order.tracking.estimatedDelivery).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              
                              <button 
                                onClick={() => handleViewOrder(order)}
                                className="text-primary-600 hover:text-primary-900 p-2"
                                title="View Order Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditOrder(order)}
                                className="text-secondary-600 hover:text-secondary-900 p-2"
                                title="Update Tracking"
                              >
                                <Truck className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditOrder(order)}
                                className="btn-primary text-xs px-3 py-1"
                              >
                                Manage
                              </button>
                            </div>
                          </div>
                          
                          {/* Quick tracking info */}
                          {order.tracking?.updates && order.tracking.updates.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-neutral-200">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-neutral-600">Latest Update:</span>
                                <span className="text-neutral-500">
                                  {new Date(order.tracking.updates[order.tracking.updates.length - 1].timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-neutral-700 mt-1">
                                {order.tracking.updates[order.tracking.updates.length - 1].message}
                              </p>
                              {order.tracking.updates[order.tracking.updates.length - 1].location && (
                                <p className="text-xs text-neutral-500">
                                  📍 {order.tracking.updates[order.tracking.updates.length - 1].location}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  
                  {allOrders.filter(order => 
                    order.user?.role !== 'admin' &&
                    order.status !== 'delivered' &&
                    (order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).length === 0 && (
                    <div className="text-center py-12">
                      <Truck className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Active Orders</h3>
                      <p className="text-neutral-600">All orders have been delivered or no orders match your search.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <ProductViewModal
        product={selectedProduct}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedProduct(null);
        }}
      />

      <ProductEditModal
        product={selectedProduct}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      <OrderViewModal
        order={selectedOrder}
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
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
        onSave={handleOrderSave}
      />

      <ProfileEditModal
        user={user}
        isOpen={showProfileEditModal}
        onClose={() => setShowProfileEditModal(false)}
        onSave={handleProfileUpdate}
      />

      <UserViewModal
        user={selectedUser}
        isOpen={showUserViewModal}
        onClose={() => {
          setShowUserViewModal(false);
          setSelectedUser(null);
        }}
      />

      <UserEditModal
        user={editingUser}
        isOpen={showUserEditModal}
        onClose={() => {
          setShowUserEditModal(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
      />

      <ProductRequestEditModal
        request={editingRequest}
        isOpen={showRequestEditModal}
        onClose={() => {
          setShowRequestEditModal(false);
          setEditingRequest(null);
        }}
        onSave={handleSaveRequest}
      />
    </div>
  );
};

export default AdminDashboard;