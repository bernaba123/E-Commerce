import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  Heart,
  ShoppingCart,
  Grid,
  List,
  Loader
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useApi';

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart } = useCart();

  // API call with filters
  const apiParams = useMemo(() => ({
    page: currentPage,
    limit: 12,
    ...(searchTerm && { search: searchTerm }),
    ...(selectedCategory !== 'all' && { category: selectedCategory }),
    ...(priceRange[0] > 0 && { minPrice: priceRange[0] }),
    ...(priceRange[1] < 100 && { maxPrice: priceRange[1] }),
    sort: sortBy
  }), [searchTerm, selectedCategory, sortBy, priceRange, currentPage]);

  const { data: productsData, loading, error, refetch } = useProducts(apiParams);

  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination || {};

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'coffee', name: 'Coffee' },
    { id: 'spices', name: 'Spices' },
    { id: 'food', name: 'Food' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'crafts', name: 'Crafts' }
  ];

  const handleAddToCart = (product) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      description: product.description
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  if (loading && !products.length) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-600 mb-4">Error loading products: {error}</p>
          <button onClick={refetch} className="btn-primary">
            Try Again
          </button>
        </div>
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
              Authentic Ethiopian Products
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Discover the rich flavors and traditions of Ethiopia, delivered fresh to Germany
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Search Products</h3>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </form>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'hover:bg-neutral-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Price Range</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-600">€{priceRange[0]}</span>
                  <span className="text-sm text-neutral-400">-</span>
                  <span className="text-sm text-neutral-600">€{priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[1]}
                  onChange={(e) => {
                    setPriceRange([priceRange[0], parseInt(e.target.value)]);
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg p-4 shadow-md mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <span className="text-neutral-600">
                    {pagination.total || 0} products found
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-neutral-400 hover:text-neutral-600'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-neutral-400 hover:text-neutral-600'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`card overflow-hidden group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                          viewMode === 'list' ? 'h-48' : 'h-64'
                        }`}
                      />
                      {product.featured && (
                        <div className="absolute top-4 left-4 bg-secondary-500 text-neutral-900 px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-medium">Out of Stock</span>
                        </div>
                      )}
                      <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-neutral-100 transition-colors duration-200">
                        <Heart className="w-5 h-5 text-neutral-600" />
                      </button>
                    </div>
                    
                    <div className={`p-6 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                      <div>
                        <Link to={`/products/${product._id}`}>
                          <h3 className="text-lg font-semibold text-neutral-900 mb-2 hover:text-primary-600 transition-colors duration-200">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-neutral-600 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.rating)
                                    ? 'text-secondary-500 fill-current'
                                    : 'text-neutral-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-neutral-600">
                            {product.rating} ({product.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-primary-600">
                            €{product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-neutral-500 line-through">
                              €{product.originalPrice}
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            product.inStock
                              ? 'bg-primary-600 text-white hover:bg-primary-700'
                              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 border rounded-lg ${
                        currentPage === i + 1
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-neutral-300 hover:bg-neutral-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    className="px-4 py-2 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-neutral-400 mb-4">
                  <Filter className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">No products found</h3>
                <p className="text-neutral-600">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;