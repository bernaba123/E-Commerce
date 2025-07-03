import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Link2, 
  Package, 
  MapPin, 
  Calculator,
  Info,
  Send,
  Globe,
  Truck,
  Shield,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

const RequestPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    productUrl: '',
    productName: '',
    productPrice: '',
    quantity: 1,
    description: '',
    category: 'other',
    urgency: 'medium',
    shippingAddress: {
      name: user?.name || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      country: 'Ethiopia',
      zipCode: user?.address?.zipCode || '',
      phone: user?.phone || ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Fashion' },
    { value: 'books', label: 'Books & Media' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'beauty', label: 'Beauty & Health' },
    { value: 'toys', label: 'Toys & Games' },
    { value: 'other', label: 'Other' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low - Standard delivery (2-4 weeks) - €20 shipping', color: 'text-success-600' },
    { value: 'medium', label: 'Medium - Express delivery (1-2 weeks) - €35 shipping', color: 'text-warning-600' },
    { value: 'high', label: 'High - Priority delivery (3-7 days) - €55 shipping', color: 'text-error-600' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateEstimate = () => {
    const basePrice = parseFloat(formData.productPrice.replace(/[^0-9.]/g, '')) || 0;
    const serviceFee = basePrice * 0.15; // 15% service fee
    
    // Variable shipping cost based on delivery urgency
    let shippingCost = 20; // Default/low urgency
    if (formData.urgency === 'medium') {
      shippingCost = 35; // Express delivery
    } else if (formData.urgency === 'high') {
      shippingCost = 55; // Priority delivery
    }
    
    const total = basePrice + serviceFee + shippingCost;

    setEstimatedCost({
      productPrice: basePrice,
      serviceFee,
      shippingCost,
      total
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.createRequest(formData);
      if (response.success) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-white p-12 rounded-xl shadow-lg max-w-md"
        >
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            Request Submitted Successfully!
          </h2>
          <p className="text-neutral-600 mb-6">
            We've received your product request and will review it shortly. You'll receive an email confirmation soon.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Request International Products
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Found something you love on an international website? We'll get it for you and deliver it to Ethiopia.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* How It Works */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="card p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Info className="w-6 h-6 text-primary-600" />
                  <span>How It Works</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: Link2, title: 'Copy Product Link', desc: 'Find the product on any international website and copy the URL' },
                    { icon: Package, title: 'Fill Details', desc: 'Provide product information and your shipping address' },
                    { icon: Calculator, title: 'Get Quote', desc: 'We calculate the total cost including fees and shipping' },
                    { icon: Truck, title: 'We Handle Rest', desc: 'We purchase, ship, and deliver to your address in Ethiopia' }
                  ].map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <step.icon className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900">{step.title}</h4>
                        <p className="text-sm text-neutral-600">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-success-600" />
                  <span>Why Choose Us?</span>
                </h3>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span>Secure payment processing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span>Real-time order tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span>Customs handling included</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                    <span>Insurance coverage</span>
                  </li>
                </ul>
              </div>

              {estimatedCost && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-6 bg-primary-50 border-primary-200"
                >
                  <h3 className="text-lg font-semibold mb-4 text-primary-900">Cost Estimate</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Product Price:</span>
                      <span>€{estimatedCost.productPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Fee (15%):</span>
                      <span>€{estimatedCost.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping to Ethiopia:</span>
                      <span>€{estimatedCost.shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-primary-200 pt-2 flex justify-between font-semibold">
                      <span>Total Estimate:</span>
                      <span>€{estimatedCost.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-primary-700 mt-3">
                    *Final price may vary based on actual product cost and shipping requirements
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Request Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="card p-8"
            >
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Submit Product Request</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Information */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Product Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Product URL *
                      </label>
                      <input
                        type="url"
                        name="productUrl"
                        value={formData.productUrl}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="https://amazon.de/product-link"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="Enter product name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Product Price *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="productPrice"
                          value={formData.productPrice}
                          onChange={handleChange}
                          required
                          className="input-field"
                          placeholder="€99.99"
                        />
                        <button
                          type="button"
                          onClick={calculateEstimate}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-700"
                        >
                          <Calculator className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Category
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
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="input-field"
                        placeholder="Any specific requirements or notes about the product..."
                      />
                    </div>
                  </div>
                </div>

                {/* Urgency Level */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Delivery Urgency</h3>
                  <div className="space-y-3">
                    {urgencyLevels.map(level => (
                      <label key={level.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="urgency"
                          value={level.value}
                          checked={formData.urgency === level.value}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className={`font-medium ${level.color}`}>{level.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Shipping Address in Ethiopia</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="shippingAddress.name"
                        value={formData.shippingAddress.name}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="shippingAddress.phone"
                        value={formData.shippingAddress.phone}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="+251 9XX XXX XXX"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="shippingAddress.street"
                        value={formData.shippingAddress.street}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="Street address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="shippingAddress.city"
                        value={formData.shippingAddress.city}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="City"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        State/Region
                      </label>
                      <input
                        type="text"
                        name="shippingAddress.state"
                        value={formData.shippingAddress.state}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="State or Region"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="shippingAddress.country"
                        value={formData.shippingAddress.country}
                        onChange={handleChange}
                        className="input-field"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="shippingAddress.zipCode"
                        value={formData.shippingAddress.zipCode}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Postal code"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    <span>{isLoading ? 'Submitting...' : 'Submit Request'}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={calculateEstimate}
                    className="btn-outline flex items-center justify-center space-x-2"
                  >
                    <Calculator className="w-5 h-5" />
                    <span>Calculate Estimate</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPage;