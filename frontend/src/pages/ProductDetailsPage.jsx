import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Truck, 
  Shield, 
  ArrowLeft,
  Plus,
  Minus,
  Share2,
  MessageCircle,
  Loader
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProduct } from '../hooks/useApi';
import apiService from '../services/api';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { addToCart } = useCart();

  const { data: productData, loading, error, refetch } = useProduct(id);
  const product = productData?.data?.product;

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        description: product.description
      }, quantity);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product?.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    
    try {
      await apiService.addProductReview(id, reviewData);
      setReviewData({ rating: 5, comment: '' });
      refetch(); // Refresh product data to show new review
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-600 mb-4">Product not found</p>
          <Link to="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            to="/products"
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Products</span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="relative">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover rounded-xl shadow-lg"
              />
              {product.featured && (
                <div className="absolute top-4 left-4 bg-secondary-500 text-neutral-900 px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </div>
              )}
              <button className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-md hover:bg-neutral-100 transition-colors duration-200">
                <Heart className="w-6 h-6 text-neutral-600" />
              </button>
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                      selectedImage === index ? 'border-primary-600' : 'border-neutral-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-secondary-500 fill-current'
                          : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-neutral-600">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-primary-600">
                  €{product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-neutral-500 line-through">
                      €{product.originalPrice}
                    </span>
                    <span className="bg-error-100 text-error-700 px-2 py-1 rounded-full text-sm font-medium">
                      Save €{(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-neutral-700 font-medium">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="p-2 border border-neutral-300 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-neutral-500">
                  {product.stock} in stock
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-6 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors duration-200">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-neutral-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-primary-600" />
                <span className="font-medium">Free shipping on orders over €50</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-primary-600" />
                <span className="font-medium">30-day money-back guarantee</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <div className="border-b border-neutral-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'description', name: 'Description' },
                { id: 'reviews', name: `Reviews (${product.reviewCount})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
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

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-neutral-600 leading-relaxed">
                  {product.description}
                </p>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review._id} className="border-b border-neutral-200 pb-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={review.user.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'}
                          alt={review.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-neutral-900">{review.user.name}</h4>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-secondary-500 fill-current'
                                      : 'text-neutral-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-neutral-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-neutral-600">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-600">No reviews yet. Be the first to review this product!</p>
                )}
                
                {/* Add Review Form */}
                <form onSubmit={handleSubmitReview} className="bg-neutral-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">Write a Review</h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setReviewData({ ...reviewData, rating })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              rating <= reviewData.rating
                                ? 'text-secondary-500 fill-current'
                                : 'text-neutral-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Comment
                    </label>
                    <textarea
                      value={reviewData.comment}
                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Share your thoughts about this product..."
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;