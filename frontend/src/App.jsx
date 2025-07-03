import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './index.css';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';

// Route Protection Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import UserRoute from './components/auth/UserRoute';
import GuestRoute from './components/auth/GuestRoute';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import RequestPage from './pages/RequestPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import UserDashboard from './pages/dashboard/UserDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-neutral-50 flex flex-col">
              <Header />
              <main className="flex-1">
                <AnimatePresence mode="wait">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailsPage />} />
                    <Route path="/tracking" element={<OrderTrackingPage />} />

                    {/* Guest Only Routes (Login/Register) */}
                    <Route 
                      path="/login" 
                      element={
                        <GuestRoute>
                          <LoginPage />
                        </GuestRoute>
                      } 
                    />
                    <Route 
                      path="/signup" 
                      element={
                        <GuestRoute>
                          <SignupPage />
                        </GuestRoute>
                      } 
                    />

                    {/* Protected Routes (Require Authentication) */}
                    <Route 
                      path="/request" 
                      element={
                        <UserRoute>
                          <RequestPage />
                        </UserRoute>
                      } 
                    />
                    <Route 
                      path="/cart" 
                      element={
                        <ProtectedRoute>
                          <CartPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/checkout" 
                      element={
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      } 
                    />

                    {/* User Dashboard (Users Only) */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <UserRoute>
                          <UserDashboard />
                        </UserRoute>
                      } 
                    />

                    {/* Admin Dashboard (Admins Only) */}
                    <Route 
                      path="/admin" 
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      } 
                    />
                  </Routes>
                </AnimatePresence>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;