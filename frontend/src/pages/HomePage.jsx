import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Globe, 
  Package, 
  Truck, 
  Shield, 
  Clock,
  Star,
  Coffee,
  ShoppingBag,
  Loader
} from 'lucide-react';
import { useFeaturedProducts } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { data: featuredData, loading: featuredLoading } = useFeaturedProducts();
  const { isAdmin } = useAuth();
  const featuredProducts = featuredData?.data?.products || [];

  const features = [
    {
      icon: Globe,
      title: 'Global Connectivity',
      description: 'Seamlessly connecting Ethiopian and German markets'
    },
    {
      icon: Package,
      title: 'Product Requests',
      description: 'Request any international product for delivery to Ethiopia'
    },
    {
      icon: Coffee,
      title: 'Authentic Ethiopian Products',
      description: 'Genuine Ethiopian coffee, spices, and traditional goods'
    },
    {
      icon: Truck,
      title: 'Reliable Shipping',
      description: 'Fast and secure delivery to both countries'
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Protected payments and guaranteed satisfaction'
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Track your orders from purchase to delivery'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Customers' },
    { number: '50,000+', label: 'Products Delivered' },
    { number: '99.9%', label: 'Success Rate' },
    { number: '24/7', label: 'Customer Support' }
  ];

  const testimonials = [
    {
      name: 'Sarah Mueller',
      location: 'Berlin, Germany',
      text: 'The Ethiopian coffee I ordered was absolutely amazing! Authentic taste delivered right to my door.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      name: 'Dawit Tadesse',
      location: 'Addis Ababa, Ethiopia',
      text: 'I finally got my dream laptop from Amazon delivered to Ethiopia. The service was incredible!',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      name: 'Anna Schmidt',
      location: 'Munich, Germany',
      text: 'The traditional Ethiopian spices are so fresh and flavorful. Will definitely order again!',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Connecting{' '}
                <span className="text-secondary-400">Ethiopia</span>
                {' '}&{' '}
                <span className="text-secondary-400">Germany</span>
              </h1>
              <p className="text-xl mb-8 text-primary-100 leading-relaxed">
                Your gateway to international shopping and authentic Ethiopian products. 
                Bridging continents, delivering dreams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* Only show Request Products button for non-admin users */}
                {!isAdmin && (
                  <Link to="/request" className="btn-secondary flex items-center justify-center space-x-2">
                    <ShoppingBag className="w-5 h-5" />
                    <span>Request Products</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
                <Link to="/products" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 flex items-center justify-center space-x-2">
                  <Coffee className="w-5 h-5" />
                  <span>Shop Ethiopian</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="section-title">Featured Ethiopian Products</h2>
              <p className="section-subtitle">
                Discover our handpicked selection of authentic Ethiopian goods
              </p>
            </motion.div>

            {featuredLoading ? (
              <div className="flex justify-center">
                <Loader className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.slice(0, 4).map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="card overflow-hidden group hover:scale-105 transition-transform duration-300"
                  >
                    <div className="relative">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 bg-secondary-500 text-neutral-900 px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{product.name}</h3>
                      <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary-600">€{product.price}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-secondary-500 fill-current" />
                          <span className="text-sm text-neutral-600">{product.rating}</span>
                        </div>
                      </div>
                      <Link
                        to={`/products/${product._id}`}
                        className="mt-4 w-full btn-primary text-center block"
                      >
                        View Product
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link to="/products" className="btn-outline">
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Simple steps to connect you with products from around the world
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* For Ethiopian Customers */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  For Ethiopian Customers
                </h3>
                <p className="text-neutral-600">
                  Get international products delivered to Ethiopia
                </p>
              </div>
              
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Find & Copy Link', desc: 'Browse international sites and copy the product URL' },
                  { step: '02', title: 'Submit Request', desc: 'Paste the link on our platform and confirm details' },
                  { step: '03', title: 'We Handle Everything', desc: 'We purchase, ship, and handle customs for you' },
                  { step: '04', title: 'Receive in Ethiopia', desc: 'Get your product delivered safely to your address' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-bold">{item.step}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900">{item.title}</h4>
                      <p className="text-neutral-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* For German Customers */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  For German Customers
                </h3>
                <p className="text-neutral-600">
                  Discover authentic Ethiopian products
                </p>
              </div>
              
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Browse Catalog', desc: 'Explore our curated Ethiopian products collection' },
                  { step: '02', title: 'Add to Cart', desc: 'Select your favorite coffee, spices, or traditional items' },
                  { step: '03', title: 'Secure Checkout', desc: 'Complete your purchase with our secure payment system' },
                  { step: '04', title: 'Fast Delivery', desc: 'Receive authentic Ethiopian products in Germany' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-secondary-700 font-bold">{item.step}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900">{item.title}</h4>
                      <p className="text-neutral-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="section-title">Why Choose EthioConnect</h2>
            <p className="section-subtitle">
              Experience the best of both worlds with our comprehensive platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-8 text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-600 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-primary-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">
              Real stories from satisfied customers across two continents
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="card p-8"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-secondary-500 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                    <div className="text-sm text-neutral-500">{testimonial.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of satisfied customers connecting Ethiopia and Germany
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-secondary">
                Create Account
              </Link>
              <Link to="/products" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
                Browse Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;