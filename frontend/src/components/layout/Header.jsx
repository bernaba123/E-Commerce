import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  LogOut,
  Package,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { getCartItemsCount } = useCart();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Ethiopian Products', href: '/products', current: location.pathname === '/products' },
    // Only show Request Products for non-admin users
    ...(isAdmin ? [] : [{ name: 'Request Products', href: '/request', current: location.pathname === '/request' }]),
    { name: 'Track Orders', href: '/tracking', current: location.pathname === '/tracking' },
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient-primary">
                EthioConnect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  item.current
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-neutral-600 hover:text-primary-600'
                } px-3 py-2 text-sm font-medium transition-colors duration-200`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-neutral-600 hover:text-primary-600 transition-colors duration-200">
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-neutral-600 hover:text-primary-600 transition-colors duration-200">
              <ShoppingCart className="w-5 h-5" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        console.error('Header avatar failed to load:', user.avatar);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center ${user.avatar ? 'hidden' : ''}`}>
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-neutral-700">
                    {user.name}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-neutral-200"
                  >
                    <Link
                      to={isAdmin ? '/admin' : '/dashboard'}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{isAdmin ? 'Admin Dashboard' : 'Dashboard'}</span>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      <div className="flex items-center space-x-2">
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary text-sm py-2 px-4"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-neutral-600 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-neutral-200 py-4"
          >
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-600'
                  } block px-3 py-2 rounded-lg text-base font-medium hover:bg-neutral-100 transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;