import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Download, 
  Printer,  // ✅ Changed from Print to Printer
  FileText, 
  Calendar,
  User,
  MapPin,
  Package
} from 'lucide-react';

const InvoiceModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handleDownload = () => {
    console.log('Downloading invoice for order:', order.orderNumber);
    // TODO: Add actual PDF generation logic
  };

  const handlePrint = () => {
    window.print();
  };

  const generateInvoiceNumber = (orderNumber, date) => {
    const dateStr = new Date(date).toISOString().slice(0, 10).replace(/-/g, '');
    return `INV-${orderNumber}-${dateStr}`;
  };

  const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const shippingCost = order.shippingCost || 0;
  const tax = order.tax || (subtotal * 0.1); // Assuming 10% tax if not provided
  const total = order.finalAmount || order.totalAmount || (subtotal + shippingCost + tax);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 print:hidden">
          <h2 className="text-2xl font-bold text-neutral-900">Invoice</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="btn-outline flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" /> {/* ✅ Changed */}
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8" id="invoice-content">
          {/* Company Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary-600 mb-2">EthioConnect</h1>
              <div className="text-sm text-neutral-600">
                <p>Authentic Ethiopian Products Marketplace</p>
                <p>123 Business Street</p>
                <p>Addis Ababa, Ethiopia</p>
                <p>contact@ethioconnect.com</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-neutral-900 mb-2">INVOICE</div>
              <div className="text-sm text-neutral-600">
                <p><strong>Invoice #:</strong> {generateInvoiceNumber(order.orderNumber, order.createdAt)}</p>
                <p><strong>Order #:</strong> {order.orderNumber}</p>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Bill To
              </h3>
              <div className="text-sm text-neutral-700">
                <p className="font-medium">{order.user?.name}</p>
                <p>{order.user?.email}</p>
                {order.user?.phone && <p>{order.user?.phone}</p>}
              </div>
            </div>

            {order.shippingAddress && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                  Ship To
                </h3>
                <div className="text-sm text-neutral-700">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>{order.shippingAddress.country} {order.shippingAddress.zipCode}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary-600" />
              Order Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left p-4 border-b border-neutral-200 font-semibold text-neutral-700">Item</th>
                    <th className="text-center p-4 border-b border-neutral-200 font-semibold text-neutral-700">Quantity</th>
                    <th className="text-right p-4 border-b border-neutral-200 font-semibold text-neutral-700">Unit Price</th>
                    <th className="text-right p-4 border-b border-neutral-200 font-semibold text-neutral-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, index) => (
                    <tr key={index} className="border-b border-neutral-100">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                          )}
                          <div>
                            <div className="font-medium text-neutral-900">{item.name}</div>
                            {item.description && <div className="text-sm text-neutral-600">{item.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">{item.quantity}</td>
                      <td className="p-4 text-right">€{item.price.toFixed(2)}</td>
                      <td className="p-4 text-right font-medium">€{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-sm">
              <div className="bg-neutral-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal:</span>
                    <span className="text-neutral-900">€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Shipping:</span>
                    <span className="text-neutral-900">€{shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Tax:</span>
                    <span className="text-neutral-900">€{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-neutral-300 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-neutral-900">Total:</span>
                      <span className="text-primary-600">€{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Payment Information</h3>
              <div className="text-sm text-neutral-700">
                <p><strong>Payment Method:</strong> {order.paymentMethod || 'Credit Card'}</p>
                <p><strong>Payment Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'paid' 
                      ? 'bg-success-100 text-success-700' 
                      : 'bg-warning-100 text-warning-700'
                  }`}>
                    {order.paymentStatus || 'Paid'}
                  </span>
                </p>
                <p><strong>Transaction ID:</strong> {order.transactionId || 'TXN-' + order.orderNumber}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Order Status</h3>
              <div className="text-sm text-neutral-700">
                <p><strong>Current Status:</strong> 
                  <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </p>
                <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                {order.estimatedDelivery && (
                  <p><strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Terms & Conditions</h3>
            <div className="text-xs text-neutral-600 leading-relaxed">
              <p className="mb-2">1. Payment is due within 30 days of invoice date.</p>
              <p className="mb-2">2. Returns are accepted within 14 days of delivery for unopened items.</p>
              <p className="mb-2">3. Shipping costs are non-refundable unless the return is due to our error.</p>
              <p>4. For questions about this invoice, please contact our customer service team.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-neutral-200">
            <div className="text-sm text-neutral-600">
              <p>Thank you for choosing EthioConnect!</p>
              <p>For support, visit our website or email support@ethioconnect.com</p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-4 p-6 border-t border-neutral-200 print:hidden">
          <button onClick={onClose} className="btn-outline">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InvoiceModal;
