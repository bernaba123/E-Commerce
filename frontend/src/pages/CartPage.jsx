import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  ShoppingBag,
  Heart,
  Tag
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { isAdmin } = useAuth();

  const shippingCost = getCartTotal() > 50 ? 0 : 9.99;
  const taxAmount = getCartTotal() * 0.19; // 19% VAT for Germany
  const finalTotal = getCartTotal() + shippingCost + taxAmount;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-neutral-400" />
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-4">Your Cart is Empty</h1>
              <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                Looks like you haven't added any Ethiopian products to your cart yet. 
                Start exploring our authentic collection!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products" className="btn-primary flex items-center justify-center space-x-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Browse Products</span>
                </Link>
                {/* Only show Request Products for non-admin users */}
                {!isAdmin && (
                  <Link to="/request" className="btn-outline flex items-center justify-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Request Products</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Shopping Cart</h1>
          <p className="text-neutral-600">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-neutral-600 text-sm mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-primary-600">
                        €{item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-neutral-500 line-through">
                          €{item.originalPrice}
                        </span>
                      )}
                      {item.originalPrice && (
                        <span className="bg-accent-100 text-accent-700 px-2 py-1 rounded-full text-xs font-medium">
                          <Tag className="w-3 h-3 inline mr-1" />
                          Save €{(item.originalPrice - item.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-neutral-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-neutral-100 transition-colors duration-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-neutral-100 transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-neutral-900">
                      €{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Clear Cart Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-end"
            >
              <button
                onClick={clearCart}
                className="text-error-600 hover:text-error-700 font-medium transition-colors duration-200"
              >
                Clear Cart
              </button>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 sticky top-8"
            >
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">€{getCartTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-success-600">Free</span>
                    ) : (
                      `€${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax (19% VAT)</span>
                  <span className="font-medium">€{taxAmount.toFixed(2)}</span>
                </div>
                
                {getCartTotal() < 50 && (
                  <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                    <p className="text-warning-700 text-sm">
                      Add €{(50 - getCartTotal()).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}
                
                <div className="border-t border-neutral-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">€{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full btn-primary flex items-center justify-center space-x-2 mb-4"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/products"
                className="w-full btn-outline flex items-center justify-center space-x-2"
              >
                <span>Continue Shopping</span>
              </Link>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="flex items-center space-x-2 text-sm text-neutral-600">
                  <div className="w-4 h-4 bg-success-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Secure checkout guaranteed</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Recommended Products */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">You might also like</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center text-neutral-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Recommended products will appear here</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CartPage;