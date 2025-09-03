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
  const { user, isAuthenticated } = useAuth();

  // Wrap loadCart in useCallback to stabilize its reference
  const loadCart = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart from API when user logs in
  useEffect(() => {
    if (isAuthenticated()) {
      loadCart();
      
      // Listen for real-time cart updates
      SocketService.onCartUpdate((updatedCart) => {
        setCart(updatedCart.items || []);
      });
    } else {
      // Load cart from localStorage for non-authenticated users
      const savedCart = localStorage.getItem('guest_cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Failed to parse guest cart:', error);
          setCart([]);
        }
      }
    }

    // Cleanup socket listener on unmount
    return () => {
      SocketService.off('cartUpdate');
    };
  }, [user, isAuthenticated, loadCart]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated()) {
      localStorage.setItem('guest_cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const addToCart = async (phone, quantity = 1) => {
    try {
      if (isAuthenticated()) {
        // Add to server cart
        const response = await api.post('/cart/add', {
          phoneId: phone.id,
          quantity
        });
        setCart(response.data.items || []);
        
        // Show success notification
        return { success: true, message: 'Item added to cart' };
      } else {
        // Add to local cart for guest users
        setCart(prevCart => {
          const existingItem = prevCart.find(item => item.id === phone.id);
          
          if (existingItem) {
            return prevCart.map(item =>
              item.id === phone.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            return [...prevCart, { ...phone, quantity }];
          }
        });
        
        return { success: true, message: 'Item added to cart' };
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to add item to cart' 
      };
    }
  };

  const removeFromCart = async (phoneId) => {
    try {
      if (isAuthenticated()) {
        // Remove from server cart
        const response = await api.delete(`/cart/remove/${phoneId}`);
        setCart(response.data.items || []);
        
        return { success: true, message: 'Item removed from cart' };
      } else {
        // Remove from local cart for guest users
        setCart(prevCart => prevCart.filter(item => item.id !== phoneId));
        
        return { success: true, message: 'Item removed from cart' };
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to remove item from cart' 
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
        const response = await api.put('/cart/update', {
          phoneId,
          quantity
        });
        setCart(response.data.items || []);
        
        return { success: true, message: 'Quantity updated' };
      } else {
        // Update local cart for guest users
        setCart(prevCart =>
          prevCart.map(item =>
            item.id === phoneId
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
        message: error.response?.data?.message || 'Failed to update quantity' 
      };
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated()) {
        // Clear server cart
        await api.delete('/cart/clear');
        setCart([]);
        
        return { success: true, message: 'Cart cleared' };
      } else {
        // Clear local cart for guest users
        setCart([]);
        localStorage.removeItem('guest_cart');
        
        return { success: true, message: 'Cart cleared' };
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to clear cart' 
      };
    }
  };

  const mergeGuestCart = async () => {
    // Merge guest cart with user cart when user logs in
    if (!isAuthenticated()) return;

    const guestCart = localStorage.getItem('guest_cart');
    if (!guestCart) return;

    try {
      const guestItems = JSON.parse(guestCart);
      if (guestItems.length === 0) return;

      // Send guest cart items to server for merging
      const response = await api.post('/cart/merge', {
        guestItems
      });

      setCart(response.data.items || []);
      
      // Clear guest cart from localStorage
      localStorage.removeItem('guest_cart');
      
      return { success: true, message: 'Cart items merged successfully' };
    } catch (error) {
      console.error('Failed to merge guest cart:', error);
      return { 
        success: false, 
        message: 'Failed to merge cart items' 
      };
    }
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
    return cart.some(item => item.id === phoneId);
  };

  const getItemQuantity = (phoneId) => {
    const item = cart.find(item => item.id === phoneId);
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
      
      const response = await api.post('/checkout/initialize', {
        items: cart,
        shippingAddress,
        paymentMethod,
        total: getCartTotal()
      });

      return {
        success: true,
        checkoutSession: response.data.checkoutSession,
        orderId: response.data.orderId
      };
    } catch (error) {
      console.error('Failed to initialize checkout:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to initialize checkout'
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (orderId, paymentDetails) => {
    try {
      setLoading(true);
      
      const response = await api.post('/checkout/confirm', {
        orderId,
        paymentDetails
      });

      // Clear cart after successful order
      if (response.data.success) {
        setCart([]);
      }

      return {
        success: response.data.success,
        order: response.data.order,
        message: response.data.message
      };
    } catch (error) {
      console.error('Failed to confirm order:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to confirm order'
      );
    } finally {
      setLoading(false);
    }
  };

  // Validate cart items (check availability, pricing)
  const validateCart = async () => {
    if (cart.length === 0) return { valid: true, items: [] };

    try {
      const phoneIds = cart.map(item => item.id);
      const response = await api.post('/phones/validate', { phoneIds });
      
      const validatedItems = response.data.phones || [];
      const updatedCart = [];
      const issues = [];

      cart.forEach(cartItem => {
        const validatedItem = validatedItems.find(item => item.id === cartItem.id);
        
        if (!validatedItem) {
          issues.push({
            phoneId: cartItem.id,
            title: cartItem.title,
            issue: 'Phone no longer available'
          });
        } else if (validatedItem.price !== cartItem.price) {
          issues.push({
            phoneId: cartItem.id,
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