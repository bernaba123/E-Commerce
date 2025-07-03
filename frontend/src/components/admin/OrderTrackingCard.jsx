import React from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  MapPin,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

const OrderTrackingCard = ({ orders = [] }) => {
  // Calculate tracking statistics
  const stats = {
    pending: orders.filter(order => order.status === 'pending').length,
    processing: orders.filter(order => order.status === 'processing').length,
    shipped: orders.filter(order => order.status === 'shipped').length,
    inTransit: orders.filter(order => order.status === 'in_transit').length,
    delivered: orders.filter(order => order.status === 'delivered').length,
    total: orders.length
  };

  const activeOrders = stats.pending + stats.processing + stats.shipped + stats.inTransit;
  const deliveryRate = stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0;

  // Get orders that need attention (pending for more than 2 days)
  const ordersNeedingAttention = orders.filter(order => {
    if (order.status !== 'pending') return false;
    const orderDate = new Date(order.createdAt);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return orderDate < twoDaysAgo;
  });

  // Recent tracking updates (orders updated in the last 24 hours)
  const recentUpdates = orders.filter(order => {
    if (!order.updatedAt) return false;
    const updateDate = new Date(order.updatedAt);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return updateDate > yesterday;
  }).slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Order Status Summary */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Order Tracking Overview</h3>
          <Package className="w-5 h-5 text-primary-600" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-warning-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-warning-600" />
              <span className="text-xs font-medium text-warning-700">Pending</span>
            </div>
            <p className="text-lg font-bold text-warning-900">{stats.pending}</p>
          </div>
          
          <div className="bg-primary-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Package className="w-4 h-4 text-primary-600" />
              <span className="text-xs font-medium text-primary-700">Processing</span>
            </div>
            <p className="text-lg font-bold text-primary-900">{stats.processing}</p>
          </div>
          
          <div className="bg-secondary-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Truck className="w-4 h-4 text-secondary-600" />
              <span className="text-xs font-medium text-secondary-700">Shipped</span>
            </div>
            <p className="text-lg font-bold text-secondary-900">{stats.shipped + stats.inTransit}</p>
          </div>
          
          <div className="bg-success-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success-600" />
              <span className="text-xs font-medium text-success-700">Delivered</span>
            </div>
            <p className="text-lg font-bold text-success-900">{stats.delivered}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Active Orders</span>
            <span className="text-sm font-medium text-neutral-900">{activeOrders}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-neutral-600">Delivery Rate</span>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-success-600" />
              <span className="text-sm font-medium text-success-600">{deliveryRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Needing Attention */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Needs Attention</h3>
          <AlertTriangle className="w-5 h-5 text-warning-600" />
        </div>

        {ordersNeedingAttention.length > 0 ? (
          <div className="space-y-3">
            {ordersNeedingAttention.slice(0, 3).map((order) => (
              <div key={order._id} className="bg-warning-50 border border-warning-200 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-warning-900">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-xs text-warning-700">
                      {order.user?.name || 'Unknown Customer'}
                    </p>
                    <p className="text-xs text-warning-600">
                      Pending since {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs bg-warning-200 text-warning-800 px-2 py-1 rounded">
                    {Math.ceil((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            ))}
            
            {ordersNeedingAttention.length > 3 && (
              <p className="text-xs text-neutral-500 text-center">
                +{ordersNeedingAttention.length - 3} more orders need attention
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success-400" />
            <p className="text-sm text-neutral-600">All orders are up to date!</p>
            <p className="text-xs text-neutral-500">No orders require immediate attention</p>
          </div>
        )}
      </div>

      {/* Recent Updates */}
      <div className="card p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Recent Tracking Updates</h3>
          <MapPin className="w-5 h-5 text-primary-600" />
        </div>

        {recentUpdates.length > 0 ? (
          <div className="space-y-3">
            {recentUpdates.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    order.status === 'delivered' ? 'bg-success-500' :
                    order.status === 'shipped' ? 'bg-secondary-500' :
                    order.status === 'processing' ? 'bg-primary-500' :
                    'bg-warning-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Order #{order.orderNumber}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {order.user?.name || 'Unknown Customer'} • {order.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500">
                    {new Date(order.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {new Date(order.updatedAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
            <p className="text-sm text-neutral-600">No recent updates</p>
            <p className="text-xs text-neutral-500">Order updates will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingCard;