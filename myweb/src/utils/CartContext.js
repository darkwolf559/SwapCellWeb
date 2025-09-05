import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from './api';
import SocketService from './socket';

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
  const { user, isAuthenticated, getAuthHeaders } = useAuth();

  // Create a more robust API instance with auth headers
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers
    };

    const response = await fetch(`http://localhost:5000/api${url}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }, [getAuthHeaders]);

  // Load cart from API when user logs in
  const loadCart = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    try {
      setLoading(true);
      console.log('Loading cart for authenticated user...');
      
      const response = await makeAuthenticatedRequest('/cart');
      console.log('Cart loaded:', response);
      
      setCart(response.items || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
      // Fallback to empty cart on error
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, makeAuthenticatedRequest]);

  // Load cart data when auth state changes
  useEffect(() => {
    if (isAuthenticated()) {
      loadCart();
      
      // Listen for real-time cart updates
      if (SocketService && typeof SocketService.onCartUpdate === 'function') {
        SocketService.onCartUpdate((updatedCart) => {
          console.log('Cart updated via socket:', updatedCart);
          setCart(updatedCart.items || []);
        });
      }
    } else {
      // Load cart from memory for non-authenticated users (no localStorage)
      console.log('Loading guest cart from memory...');
      setCart([]); // Start with empty cart for guests
    }

    // Cleanup socket listener on unmount
    return () => {
      if (SocketService && typeof SocketService.off === 'function') {
        SocketService.off('cartUpdate');
      }
    };
  }, [user, isAuthenticated, loadCart]);

  const addToCart = async (phone, quantity = 1) => {
    try {
      console.log('Adding to cart:', phone, 'Quantity:', quantity, 'Authenticated:', isAuthenticated());
      
      if (isAuthenticated()) {
        // Add to server cart for authenticated users
        console.log('Adding to server cart...');
        
        const response = await makeAuthenticatedRequest('/cart/add', {
          method: 'POST',
          body: JSON.stringify({
            phoneId: phone._id || phone.id,
            quantity
          })
        });
        
        console.log('Server cart response:', response);
        setCart(response.items || []);
        
        return { success: true, message: 'Item added to cart' };
      } else {
        // Add to local cart for guest users (in-memory only)
        console.log('Adding to guest cart...');
        
        setCart(prevCart => {
          const existingItem = prevCart.find(item => 
            (item._id || item.id) === (phone._id || phone.id)
          );
          
          if (existingItem) {
            return prevCart.map(item =>
              (item._id || item.id) === (phone._id || phone.id)
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            return [...prevCart, { 
              ...phone, 
              id: phone._id || phone.id, // Ensure consistent ID
              quantity 
            }];
          }
        });
        
        return { success: true, message: 'Item added to cart' };
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to add item to cart' 
      };
    }
  };

  const removeFromCart = async (phoneId) => {
    try {
      if (isAuthenticated()) {
        // Remove from server cart
        const response = await makeAuthenticatedRequest(`/cart/remove/${phoneId}`, {
          method: 'DELETE'
        });
        setCart(response.items || []);
        
        return { success: true, message: 'Item removed from cart' };
      } else {
        // Remove from local cart for guest users
        setCart(prevCart => prevCart.filter(item => 
          (item._id || item.id) !== phoneId
        ));
        
        return { success: true, message: 'Item removed from cart' };
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to remove item from cart' 
      };
    }
  };

  const updateQuantity = async (phoneId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(phoneId);
    }

    try {
      if (isAuthenticated()) {
        // Update on server
        const response = await makeAuthenticatedRequest('/cart/update', {
          method: 'PUT',
          body: JSON.stringify({
            phoneId,
            quantity
          })
        });
        setCart(response.items || []);
        
        return { success: true, message: 'Quantity updated' };
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
      return { 
        success: false, 
        message: error.message || 'Failed to update quantity' 
      };
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated()) {
        // Clear server cart
        await makeAuthenticatedRequest('/cart/clear', {
          method: 'DELETE'
        });
        setCart([]);
        
        return { success: true, message: 'Cart cleared' };
      } else {
        // Clear local cart for guest users
        setCart([]);
        
        return { success: true, message: 'Cart cleared' };
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to clear cart' 
      };
    }
  };

  const mergeGuestCart = async () => {
    // For this version, we'll skip guest cart merging since we're not using localStorage
    // You can implement this later if needed
    console.log('Guest cart merging not implemented in this version');
    return { success: true, message: 'No guest cart to merge' };
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.salePrice || item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (phoneId) => {
    return cart.some(item => (item._id || item.id) === phoneId);
  };

  const getItemQuantity = (phoneId) => {
    const item = cart.find(item => (item._id || item.id) === phoneId);
    return item ? item.quantity : 0;
  };

  // Checkout process
  const initializeCheckout = async (shippingAddress, paymentMethod) => {
    if (!isAuthenticated()) {
      throw new Error('Authentication required for checkout');
    }

    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    try {
      setLoading(true);
      
      const response = await makeAuthenticatedRequest('/checkout/initialize', {
        method: 'POST',
        body: JSON.stringify({
          items: cart,
          shippingAddress,
          paymentMethod,
          total: getCartTotal()
        })
      });

      return {
        success: true,
        checkoutSession: response.checkoutSession,
        orderId: response.orderId
      };
    } catch (error) {
      console.error('Failed to initialize checkout:', error);
      throw new Error(error.message || 'Failed to initialize checkout');
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (orderId, paymentDetails) => {
    try {
      setLoading(true);
      
      const response = await makeAuthenticatedRequest('/checkout/confirm', {
        method: 'POST',
        body: JSON.stringify({
          orderId,
          paymentDetails
        })
      });

      // Clear cart after successful order
      if (response.success) {
        setCart([]);
      }

      return {
        success: response.success,
        order: response.order,
        message: response.message
      };
    } catch (error) {
      console.error('Failed to confirm order:', error);
      throw new Error(error.message || 'Failed to confirm order');
    } finally {
      setLoading(false);
    }
  };

  // Validate cart items (check availability, pricing)
  const validateCart = async () => {
    if (cart.length === 0) return { valid: true, items: [] };

    try {
      const phoneIds = cart.map(item => item._id || item.id);
      const response = await makeAuthenticatedRequest('/phones/validate', {
        method: 'POST',
        body: JSON.stringify({ phoneIds })
      });
      
      const validatedItems = response.phones || [];
      const updatedCart = [];
      const issues = [];

      cart.forEach(cartItem => {
        const validatedItem = validatedItems.find(item => 
          item._id === (cartItem._id || cartItem.id)
        );
        
        if (!validatedItem) {
          issues.push({
            phoneId: cartItem._id || cartItem.id,
            title: cartItem.title,
            issue: 'Phone no longer available'
          });
        } else if (validatedItem.price !== cartItem.price) {
          issues.push({
            phoneId: cartItem._id || cartItem.id,
            title: cartItem.title,
            issue: `Price changed from $${cartItem.price} to $${validatedItem.price}`
          });
          updatedCart.push({
            ...cartItem,
            ...validatedItem,
            quantity: cartItem.quantity
          });
        } else {
          updatedCart.push({
            ...cartItem,
            ...validatedItem,
            quantity: cartItem.quantity
          });
        }
      });

      // Update cart with validated items
      if (updatedCart.length !== cart.length || issues.length > 0) {
        setCart(updatedCart);
      }

      return {
        valid: issues.length === 0,
        items: updatedCart,
        issues
      };
    } catch (error) {
      console.error('Failed to validate cart:', error);
      return {
        valid: false,
        items: cart,
        issues: [{ issue: 'Failed to validate cart items' }]
      };
    }
  };

  const contextValue = {
    // State
    cart,
    loading,
    
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
    
    // Checkout
    initializeCheckout,
    confirmOrder,
    validateCart,
    
    // Data refresh
    loadCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};