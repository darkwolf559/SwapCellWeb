import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Mock API for favorites (replace with your actual API)
const favoritesAPI = {
  getFavorites: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const storedFavorites = localStorage.getItem('user_favorites');
    return { data: storedFavorites ? JSON.parse(storedFavorites) : [] };
  },
  
  toggleFavorite: async (phoneId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const storedFavorites = localStorage.getItem('user_favorites');
    let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    
    const index = favorites.indexOf(phoneId);
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(phoneId);
    }
    
    localStorage.setItem('user_favorites', JSON.stringify(favorites));
    return { data: { favorites } };
  },
  
  addToFavorites: async (phoneId) => {
    const storedFavorites = localStorage.getItem('user_favorites');
    let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    
    if (!favorites.includes(phoneId)) {
      favorites.push(phoneId);
      localStorage.setItem('user_favorites', JSON.stringify(favorites));
    }
    
    return { data: { favorites } };
  },
  
  removeFromFavorites: async (phoneId) => {
    const storedFavorites = localStorage.getItem('user_favorites');
    let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    
    const index = favorites.indexOf(phoneId);
    if (index > -1) {
      favorites.splice(index, 1);
      localStorage.setItem('user_favorites', JSON.stringify(favorites));
    }
    
    return { data: { favorites } };
  }
};

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Wrap loadFavorites in useCallback to stabilize its reference
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated()) {
      // Load favorites from localStorage for guests
      const savedFavorites = localStorage.getItem('guest_favorites');
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (error) {
          console.error('Failed to parse guest favorites:', error);
          setFavorites([]);
        }
      }
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await favoritesAPI.getFavorites();
      const favoriteIds = response.data.map(fav => fav.id || fav._id || fav);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setError('Failed to load favorites');
      // Fallback to localStorage if API fails
      const savedFavorites = localStorage.getItem('guest_favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load favorites when user logs in or component mounts
  useEffect(() => {
    loadFavorites();
  }, [user, isAuthenticated, loadFavorites]);

  // Save guest favorites to localStorage
  useEffect(() => {
    if (!isAuthenticated()) {
      localStorage.setItem('guest_favorites', JSON.stringify(favorites));
    }
  }, [favorites, isAuthenticated]);

  const toggleFavorite = async (phoneId) => {
    try {
      setError(null);
      const wasInFavorites = favorites.includes(phoneId);
      
      // Optimistic update
      setFavorites(prevFavorites => {
        if (wasInFavorites) {
          return prevFavorites.filter(id => id !== phoneId);
        } else {
          return [...prevFavorites, phoneId];
        }
      });
      
      // Set action for UI feedback
      setLastAction({
        type: wasInFavorites ? 'removed' : 'added',
        phoneId,
        timestamp: Date.now()
      });
      
      if (isAuthenticated()) {
        // Update on server
        const response = await favoritesAPI.toggleFavorite(phoneId);
        const serverFavorites = response.data.favorites || [];
        
        // Sync with server response
        setFavorites(serverFavorites);
      } else {
        // For guests, the optimistic update is final
        // localStorage is already updated via useEffect
      }
      
      return !wasInFavorites;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      setError('Failed to update favorites');
      
      // Revert optimistic update on error
      setFavorites(prevFavorites => {
        const wasInFavorites = !prevFavorites.includes(phoneId);
        if (wasInFavorites) {
          return prevFavorites.filter(id => id !== phoneId);
        } else {
          return [...prevFavorites, phoneId];
        }
      });
      
      throw error;
    }
  };

  const addToFavorites = async (phoneId) => {
    if (!favorites.includes(phoneId)) {
      try {
        setError(null);
        
        // Optimistic update
        setFavorites(prev => [...prev, phoneId]);
        
        setLastAction({
          type: 'added',
          phoneId,
          timestamp: Date.now()
        });
        
        if (isAuthenticated()) {
          const response = await favoritesAPI.addToFavorites(phoneId);
          setFavorites(response.data.favorites || [...favorites, phoneId]);
        }
        
        return true;
      } catch (error) {
        console.error('Failed to add to favorites:', error);
        setError('Failed to add to favorites');
        
        // Revert optimistic update
        setFavorites(prev => prev.filter(id => id !== phoneId));
        throw error;
      }
    }
    return false;
  };

  const removeFromFavorites = async (phoneId) => {
    if (favorites.includes(phoneId)) {
      try {
        setError(null);
        
        // Optimistic update
        setFavorites(prev => prev.filter(id => id !== phoneId));
        
        setLastAction({
          type: 'removed',
          phoneId,
          timestamp: Date.now()
        });
        
        if (isAuthenticated()) {
          const response = await favoritesAPI.removeFromFavorites(phoneId);
          setFavorites(response.data.favorites || favorites.filter(id => id !== phoneId));
        }
        
        return true;
      } catch (error) {
        console.error('Failed to remove from favorites:', error);
        setError('Failed to remove from favorites');
        
        // Revert optimistic update
        setFavorites(prev => [...prev, phoneId]);
        throw error;
      }
    }
    return false;
  };

  const isFavorite = (phoneId) => {
    return favorites.includes(phoneId);
  };

  const getFavoritesCount = () => {
    return favorites.length;
  };

  const clearFavorites = async () => {
    try {
      setError(null);
      const originalFavorites = [...favorites];
      
      // Optimistic update
      setFavorites([]);
      
      setLastAction({
        type: 'cleared',
        count: originalFavorites.length,
        timestamp: Date.now()
      });
      
      if (isAuthenticated()) {
        // If you have a clear API endpoint, call it here
        // await favoritesAPI.clearFavorites();
      }
      
      localStorage.removeItem('guest_favorites');
      localStorage.removeItem('user_favorites');
      
      return true;
    } catch (error) {
      console.error('Failed to clear favorites:', error);
      setError('Failed to clear favorites');
      throw error;
    }
  };

  const getFavoritesByCategory = (category) => {
    // This would require additional phone data to categorize
    // For now, return all favorites
    return favorites;
  };

  const getRecentlyAddedFavorites = (limit = 5) => {
    // This would require timestamps for each favorite
    // For now, return last N favorites
    return favorites.slice(-limit).reverse();
  };

  const bulkAddToFavorites = async (phoneIds) => {
    try {
      setError(null);
      const uniqueIds = phoneIds.filter(id => !favorites.includes(id));
      
      if (uniqueIds.length === 0) {
        return { added: 0, skipped: phoneIds.length };
      }
      
      // Optimistic update
      setFavorites(prev => [...prev, ...uniqueIds]);
      
      setLastAction({
        type: 'bulk_added',
        count: uniqueIds.length,
        timestamp: Date.now()
      });
      
      if (isAuthenticated()) {
        // If you have a bulk add API endpoint, call it here
        // const response = await favoritesAPI.bulkAddToFavorites(uniqueIds);
        // setFavorites(response.data.favorites);
      }
      
      return { added: uniqueIds.length, skipped: phoneIds.length - uniqueIds.length };
    } catch (error) {
      console.error('Failed to bulk add to favorites:', error);
      setError('Failed to add multiple favorites');
      throw error;
    }
  };

  const bulkRemoveFromFavorites = async (phoneIds) => {
    try {
      setError(null);
      const existingIds = phoneIds.filter(id => favorites.includes(id));
      
      if (existingIds.length === 0) {
        return { removed: 0, notFound: phoneIds.length };
      }
      
      // Optimistic update
      setFavorites(prev => prev.filter(id => !phoneIds.includes(id)));
      
      setLastAction({
        type: 'bulk_removed',
        count: existingIds.length,
        timestamp: Date.now()
      });
      
      if (isAuthenticated()) {
        // If you have a bulk remove API endpoint, call it here
        // const response = await favoritesAPI.bulkRemoveFromFavorites(existingIds);
        // setFavorites(response.data.favorites);
      }
      
      return { removed: existingIds.length, notFound: phoneIds.length - existingIds.length };
    } catch (error) {
      console.error('Failed to bulk remove from favorites:', error);
      setError('Failed to remove multiple favorites');
      throw error;
    }
  };

  // Sync favorites between guest and authenticated user
  const syncGuestFavorites = async () => {
    if (!isAuthenticated()) return;
    
    const guestFavorites = localStorage.getItem('guest_favorites');
    if (!guestFavorites) return;
    
    try {
      const guestFavIds = JSON.parse(guestFavorites);
      if (guestFavIds.length === 0) return;
      
      // Add guest favorites to user account
      const result = await bulkAddToFavorites(guestFavIds);
      
      // Clear guest favorites
      localStorage.removeItem('guest_favorites');
      
      return result;
    } catch (error) {
      console.error('Failed to sync guest favorites:', error);
      throw error;
    }
  };

  const refreshFavorites = async () => {
    await loadFavorites();
  };

  const getLastAction = () => {
    return lastAction;
  };

  const clearLastAction = () => {
    setLastAction(null);
  };

  const value = {
    // State
    favorites,
    loading,
    error,
    lastAction,
    
    // Basic operations
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoritesCount,
    clearFavorites,
    
    // Advanced operations
    getFavoritesByCategory,
    getRecentlyAddedFavorites,
    bulkAddToFavorites,
    bulkRemoveFromFavorites,
    syncGuestFavorites,
    
    // Utility functions
    refreshFavorites,
    loadFavorites,
    getLastAction,
    clearLastAction
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};