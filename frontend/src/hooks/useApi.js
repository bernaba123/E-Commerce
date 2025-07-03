import { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';

export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    const fetchData = async () => {
      // Create cache key from dependencies
      const cacheKey = JSON.stringify(dependencies);
      
      // Check cache first
      if (cacheRef.current.has(cacheKey)) {
        const cachedData = cacheRef.current.get(cacheKey);
        const cacheAge = Date.now() - cachedData.timestamp;
        
        // Use cache if less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          setData(cachedData.data);
          setLoading(false);
          setError(null);
          return;
        }
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);
        
        const result = await apiCall();
        
        // Cache the result
        cacheRef.current.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        setData(result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('API Hook Error:', err);
          setError(err.message || 'An error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  const refetch = async () => {
    // Clear cache for this request
    const cacheKey = JSON.stringify(dependencies);
    cacheRef.current.delete(cacheKey);
    
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      
      // Update cache
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      setData(result);
      return result;
    } catch (err) {
      console.error('API Refetch Error:', err);
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

export const useProducts = (params = {}) => {
  return useApi(() => apiService.getProducts(params), [JSON.stringify(params)]);
};

export const useRequests = (params = {}) => {
  return useApi(() => apiService.getRequests(params), [JSON.stringify(params)]);
};

export const useProduct = (id) => {
  return useApi(() => apiService.getProduct(id), [id]);
};

export const useFeaturedProducts = () => {
  return useApi(() => apiService.getFeaturedProducts(), []);
};

export const useUserOrders = (params = {}) => {
  return useApi(() => apiService.getUserOrders(params), [JSON.stringify(params)]);
};

export const useUserRequests = (params = {}) => {
  return useApi(() => apiService.getUserRequests(params), [JSON.stringify(params)]);
};

export const useOrderStats = () => {
  return useApi(() => apiService.getOrderStats(), []);
};

export const useProductStats = () => {
  return useApi(() => apiService.getProductStats(), []);
};

export const useRequestStats = () => {
  return useApi(() => apiService.getRequestStats(), []);
};

export const useUserStats = () => {
  return useApi(() => apiService.getUserStats(), []);
};

// New hook for getting recent orders
export const useRecentOrders = (params = {}) => {
  return useApi(() => apiService.getOrders(params), [JSON.stringify(params)]);
};

// New hooks for admin dashboard
export const useUsers = (params = {}) => {
  return useApi(() => apiService.getUsers(params), [JSON.stringify(params)]);
};

export const useAllOrders = (params = {}) => {
  return useApi(() => apiService.getOrders(params), [JSON.stringify(params)]);
};