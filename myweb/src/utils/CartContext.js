import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI, apiUtils } from './api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Load cart from API when user logs in
  const loadCart = useCallback(async () => {
    if (!isAuthenticated()) {
      setCart([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Loading cart for authenticated user...');
      
      const response = await cartAPI.getCart();
      console.log('Cart API response:', response);
      
      // Handle the response data structure
      let cartItems = [];
      
      if (response.data?.items) {
        cartItems = response.data.items;
      } else if (response.data?.cart?.items) {
        cartItems = response.data.cart.items;
      } else if (Array.isArray(response.data)) {
        cartItems = response.data;
      }

      // Format cart items for consistency
      const formattedItems = cartItems.map(item => apiUtils.formatCartItem(item));
      
      console.log('Formatted cart items:', formattedItems);
      setCart(formattedItems);
      
    } catch (error) {
      console.error('Failed to load cart:', error);
      const errorMessage = apiUtils.handleError(error);
      setError(`Failed to load cart: ${errorMessage}`);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart data when auth state changes
  useEffect(() => {
    if (isAuthenticated()) {
      loadCart();
    } else {
      // Clear cart when user logs out
      setCart([]);
    }
  }, [user, isAuthenticated, loadCart]);

  const addToCart = async (phone, quantity = 1) => {
    try {
      console.log('Adding to cart:', phone, 'Quantity:', quantity, 'Authenticated:', isAuthenticated());
      setError(null);
      
      if (isAuthenticated()) {
        // Add to server cart for authenticated users
        console.log('Adding to server cart...');
        
        const result = await cartAPI.addToCart(phone._id || phone.id, quantity);
        console.log('Server cart response:', result);
        
        if (result.success) {
          // Handle different response data structures
          let cartItems = [];
          
          if (result.data?.cart?.items) {
            cartItems = result.data.cart.items;
          } else if (result.data?.items) {
            cartItems = result.data.items;
          } else if (Array.isArray(result.data)) {
            cartItems = result.data;
          }

          // Format cart items for consistency
          const formattedItems = cartItems.map(item => apiUtils.formatCartItem(item));
          setCart(formattedItems);
          
          return { 
            success: true, 
            message: result.message || 'Item added to cart successfully' 
          };
        } else {
          setError(result.message);
          return result;
        }
      } else {
        // Add to local cart for guest users (in-memory only)
        console.log('Adding to guest cart...');
        
        setCart(prevCart => {
          const phoneId = phone._id || phone.id;
          const existingItemIndex = prevCart.findIndex(item => 
            (item._id || item.id) === phoneId
          );
          
          if (existingItemIndex > -1) {
            // Update quantity if item exists
            return prevCart.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // Add new item to cart
            const newItem = apiUtils.formatCartItem({
              ...phone,
              _id: phoneId,
              id: phoneId,
              quantity
            });
            return [...prevCart, newItem];
          }
        });
        
        return { success: true, message: 'Item added to cart' };
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      const errorMessage = apiUtils.handleError(error);
      setError(`Failed to add to cart: ${errorMessage}`);
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const removeFromCart = async (phoneId) => {
    try {
      setError(null);
      
      if (isAuthenticated()) {
        // Remove from server cart
        const result = await cartAPI.removeFromCart(phoneId);
        
        if (result.success) {
          // Handle different response data structures
          let cartItems = [];
          
          if (result.data?.cart?.items) {
            cartItems = result.data.cart.items;
          } else if (result.data?.items) {
            cartItems = result.data.items;
          } else if (Array.isArray(result.data)) {
            cartItems = result.data;
          }

          // Format cart items for consistency
          const formattedItems = cartItems.map(item => apiUtils.formatCartItem(item));
          setCart(formattedItems);
          
          return { 
            success: true, 
            message: result.message || 'Item removed from cart' 
          };
        } else {
          setError(result.message);
          return result;
        }
      } else {
        // Remove from local cart for guest users
        setCart(prevCart => prevCart.filter(item => 
          (item._id || item.id) !== phoneId
        ));
        
        return { success: true, message: 'Item removed from cart' };
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      const errorMessage = apiUtils.handleError(error);
      setError(`Failed to remove from cart: ${errorMessage}`);
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const updateQuantity = async (phoneId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(phoneId);
    }

    try {
      setError(null);
      
      if (isAuthenticated()) {
        // Update on server
        const result = await cartAPI.updateCart(phoneId, quantity);
        
        if (result.success) {
          // Handle different response data structures
          let cartItems = [];
          
          if (result.data?.cart?.items) {
            cartItems = result.data.cart.items;
          } else if (result.data?.items) {
            cartItems = result.data.items;
          } else if (Array.isArray(result.data)) {
            cartItems = result.data;
          }

          // Format cart items for consistency
          const formattedItems = cartItems.map(item => apiUtils.formatCartItem(item));
          setCart(formattedItems);
          
          return { 
            success: true, 
            message: result.message || 'Quantity updated' 
          };
        } else {
          setError(result.message);
          return result;
        }
      } else {
        // Update local cart for guest users
        setCart(prevCart =>
          prevCart.map(item =>
            (item._id || item.id) === phoneId
              ? { ...item, quantity }
              : item
          )
        );
        
        return { success: true, message: 'Quantity updated' };
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      const errorMessage = apiUtils.handleError(error);
      setError(`Failed to update quantity: ${errorMessage}`);
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      
      if (isAuthenticated()) {
        // Clear server cart
        const result = await cartAPI.clearCart();
        
        if (result.success) {
          setCart([]);
          return { 
            success: true, 
            message: result.message || 'Cart cleared successfully' 
          };
        } else {
          setError(result.message);
          return result;
        }
      } else {
        // Clear local cart for guest users
        setCart([]);
        return { success: true, message: 'Cart cleared' };
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      const errorMessage = apiUtils.handleError(error);
      setError(`Failed to clear cart: ${errorMessage}`);
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const mergeGuestCart = async (guestItems = []) => {
    if (!isAuthenticated() || guestItems.length === 0) {
      return { success: true, message: 'No guest cart to merge' };
    }

    try {
      setError(null);
      const result = await cartAPI.mergeGuestCart(guestItems);
      
      if (result.success) {
        // Reload cart after merging
        await loadCart();
        return { 
          success: true, 
          message: result.message || 'Guest cart merged successfully' 
        };
      } else {
        setError(result.message);
        return result;
      }
    } catch (error) {
      console.error('Failed to merge guest cart:', error);
      const errorMessage = apiUtils.handleError(error);
      setError(`Failed to merge cart: ${errorMessage}`);
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  // Utility functions
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + (item.quantity || 0), 0);
  };

  const isInCart = (phoneId) => {
    return cart.some(item => (item._id || item.id) === phoneId);
  };

  const getItemQuantity = (phoneId) => {
    const item = cart.find(item => (item._id || item.id) === phoneId);
    return item ? item.quantity : 0;
  };

  const contextValue = {
    // State
    cart,
    loading,
    error,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    mergeGuestCart,
    
    // Utilities
    getCartTotal,
    getCartItemsCount,
    isInCart,
    getItemQuantity,
    
    // Data refresh
    loadCart,
    
    // Error handling
    setError: (message) => setError(message),
    clearError: () => setError(null)
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};