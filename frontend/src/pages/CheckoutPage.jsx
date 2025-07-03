import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Lock, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  ArrowLeft,
  Check,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  const [formData, setFormData] = useState({
    // Shipping Information
    shippingAddress: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      country: user?.address?.country || 'Germany',
      zipCode: user?.address?.zipCode || ''
    },
    // Billing Information
    billingAddress: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      country: user?.address?.country || 'Germany',
      zipCode: user?.address?.zipCode || ''
    },
    // Payment Information
    payment: {
      method: 'credit_card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: ''
    },
    sameAsBilling: true,
    notes: ''
  });

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.19; // 19% VAT for Germany
  const total = subtotal + shipping + tax;

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSameAsBillingChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      sameAsBilling: checked,
      ...(checked && {
        billingAddress: { ...prev.shippingAddress }
      })
    }));
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        const shipping = formData.shippingAddress;
        return shipping.name && shipping.email && shipping.street && 
               shipping.city && shipping.country && shipping.zipCode;
      case 2:
        const billing = formData.billingAddress;
        return billing.name && billing.email && billing.street && 
               billing.city && billing.country && billing.zipCode;
      case 3:
        const payment = formData.payment;
        // Cash on delivery doesn't require card details
        if (payment.method === 'cash_on_delivery') {
          return true;
        }
        return payment.cardNumber && payment.expiryDate && 
               payment.cvv && payment.cardName;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handlePlaceOrder();
      }
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Prepare order data with payment information
      const orderData = {
        items: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity
        })),
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.sameAsBilling ? formData.shippingAddress : formData.billingAddress,
        paymentMethod: formData.payment.method,
        paymentInfo: {
          cardNumber: formData.payment.cardNumber,
          expiryDate: formData.payment.expiryDate,
          cvv: formData.payment.cvv,
          cardName: formData.payment.cardName
        },
        notes: formData.notes
      };

      const response = await apiService.createOrder(orderData);
      
      if (response.success) {
        setOrderNumber(response.data.order.orderNumber);
        setPaymentMethod(formData.payment.method);
        clearCart();
        setOrderComplete(true);
        
        // Redirect to order confirmation after delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Order failed:', error);
      
      // Show more specific error message
      let errorMessage = 'Failed to place order. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            Please sign in to continue
          </h2>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            Your cart is empty
          </h2>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-white p-12 rounded-xl shadow-lg max-w-md"
        >
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            {paymentMethod === 'cash_on_delivery' 
              ? 'Order Placed Successfully!' 
              : 'Order Placed & Payment Processed Successfully!'}
          </h2>
          <p className="text-neutral-600 mb-4">
            Order #{orderNumber}
          </p>
          <p className="text-neutral-600 mb-4">
            {paymentMethod === 'cash_on_delivery'
              ? 'Your order is confirmed. Please have the exact amount ready for cash payment upon delivery.'
              : 'Your payment has been processed and your order is confirmed.'}
          </p>
          <p className="text-neutral-600 mb-6">
            You will receive a confirmation email shortly with tracking information.
          </p>
          <div className="text-sm text-neutral-500">
            Redirecting to your dashboard...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
          
          <h1 className="text-3xl font-bold text-neutral-900">Checkout</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mt-6">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {stepNumber}
                </div>
                <span className={`ml-2 text-sm ${
                  step >= stepNumber ? 'text-primary-600' : 'text-neutral-500'
                }`}>
                  {stepNumber === 1 ? 'Shipping' : stepNumber === 2 ? 'Billing' : 'Payment'}
                </span>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 ml-4 ${
                    step > stepNumber ? 'bg-primary-600' : 'bg-neutral-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              {/* Step 1: Shipping Information */}
              {step === 1 && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <MapPin className="w-6 h-6 text-primary-600" />
                    <h2 className="text-2xl font-bold text-neutral-900">Shipping Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.name}
                        onChange={(e) => handleInputChange('shippingAddress', 'name', e.target.value)}
                        className="input-field"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.shippingAddress.email}
                        onChange={(e) => handleInputChange('shippingAddress', 'email', e.target.value)}
                        className="input-field"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.shippingAddress.phone}
                        onChange={(e) => handleInputChange('shippingAddress', 'phone', e.target.value)}
                        className="input-field"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.street}
                        onChange={(e) => handleInputChange('shippingAddress', 'street', e.target.value)}
                        className="input-field"
                        placeholder="Enter street address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.city}
                        onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
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
                        value={formData.shippingAddress.state}
                        onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
                        className="input-field"
                        placeholder="Enter state/province"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Country *
                      </label>
                      <select
                        value={formData.shippingAddress.country}
                        onChange={(e) => handleInputChange('shippingAddress', 'country', e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select country</option>
                        <option value="Germany">Germany</option>
                        <option value="Ethiopia">Ethiopia</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        ZIP/Postal Code *
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.zipCode}
                        onChange={(e) => handleInputChange('shippingAddress', 'zipCode', e.target.value)}
                        className="input-field"
                        placeholder="Enter ZIP/postal code"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Billing Information */}
              {step === 2 && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="w-6 h-6 text-primary-600" />
                    <h2 className="text-2xl font-bold text-neutral-900">Billing Information</h2>
                  </div>
                  
                  <div className="mb-6">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.sameAsBilling}
                        onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-700">
                        Same as shipping address
                      </span>
                    </label>
                  </div>
                  
                  {!formData.sameAsBilling && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.billingAddress.name}
                          onChange={(e) => handleInputChange('billingAddress', 'name', e.target.value)}
                          className="input-field"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={formData.billingAddress.email}
                          onChange={(e) => handleInputChange('billingAddress', 'email', e.target.value)}
                          className="input-field"
                          placeholder="Enter your email"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={formData.billingAddress.street}
                          onChange={(e) => handleInputChange('billingAddress', 'street', e.target.value)}
                          className="input-field"
                          placeholder="Enter street address"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={formData.billingAddress.city}
                          onChange={(e) => handleInputChange('billingAddress', 'city', e.target.value)}
                          className="input-field"
                          placeholder="Enter city"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Country *
                        </label>
                        <select
                          value={formData.billingAddress.country}
                          onChange={(e) => handleInputChange('billingAddress', 'country', e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select country</option>
                          <option value="Germany">Germany</option>
                          <option value="Ethiopia">Ethiopia</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          ZIP/Postal Code *
                        </label>
                        <input
                          type="text"
                          value={formData.billingAddress.zipCode}
                          onChange={(e) => handleInputChange('billingAddress', 'zipCode', e.target.value)}
                          className="input-field"
                          placeholder="Enter ZIP/postal code"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Payment Information */}
              {step === 3 && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <CreditCard className="w-6 h-6 text-primary-600" />
                    <h2 className="text-2xl font-bold text-neutral-900">Payment Information</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { id: 'credit_card', name: 'Credit Card', icon: CreditCard },
                          { id: 'debit_card', name: 'Debit Card', icon: CreditCard },
                          { id: 'paypal', name: 'PayPal', icon: CreditCard },
                          { id: 'cash_on_delivery', name: 'Cash on Delivery', icon: CreditCard }
                        ].map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => handleInputChange('payment', 'method', method.id)}
                            className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 ${
                              formData.payment.method === method.id
                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                : 'border-neutral-300 hover:border-primary-300'
                            }`}
                          >
                            <method.icon className="w-5 h-5" />
                            <span className="font-medium">{method.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Credit Card Form - Only show for card payments */}
                    {formData.payment.method !== 'cash_on_delivery' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Card Number *
                          </label>
                          <input
                            type="text"
                            value={formData.payment.cardNumber}
                            onChange={(e) => handleInputChange('payment', 'cardNumber', e.target.value)}
                            className="input-field"
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            value={formData.payment.expiryDate}
                            onChange={(e) => handleInputChange('payment', 'expiryDate', e.target.value)}
                            className="input-field"
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            value={formData.payment.cvv}
                            onChange={(e) => handleInputChange('payment', 'cvv', e.target.value)}
                            className="input-field"
                            placeholder="123"
                            maxLength="4"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Cardholder Name *
                          </label>
                          <input
                            type="text"
                            value={formData.payment.cardName}
                            onChange={(e) => handleInputChange('payment', 'cardName', e.target.value)}
                            className="input-field"
                            placeholder="Enter cardholder name"
                          />
                        </div>
                      </div>
                    )}

                    {/* Cash on Delivery Information */}
                    {formData.payment.method === 'cash_on_delivery' && (
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-900">Cash on Delivery</h4>
                            <p className="text-sm text-amber-700 mt-1">
                              You will pay cash when your order is delivered. Please have the exact amount ready (€{total.toFixed(2)}).
                            </p>
                            <p className="text-sm text-amber-700 mt-2">
                              A small cash handling fee may apply.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-neutral-50 p-4 rounded-lg flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-neutral-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Secure Payment</p>
                        <p className="text-sm text-neutral-600">
                          Your payment information is encrypted and secure.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <button
                  onClick={handleNextStep}
                  disabled={!validateStep(step) || isProcessing}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : step === 3 ? 'Place Order' : 'Next'}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-neutral-900">{item.name}</h4>
                      <p className="text-sm text-neutral-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-neutral-900">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-neutral-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="text-neutral-900">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="text-neutral-900">
                    {shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Tax (19%)</span>
                  <span className="text-neutral-900">€{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-neutral-900">Total</span>
                    <span className="text-primary-600">€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {shipping > 0 && (
                <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-warning-600 mt-0.5" />
                    <p className="text-sm text-warning-700">
                      Add €{(50 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;