// socket.js - Fixed version with better error handling and debugging
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

console.log('🔧 Socket URL:', SOCKET_URL); // Debug log

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(userId) {
    if (this.socket) {
      console.log('🔌 Disconnecting existing socket...');
      this.disconnect();
    }

    console.log('🔌 Attempting to connect to:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      console.log('🆔 Socket ID:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      if (userId) {
        console.log('👤 Joining user room:', userId);
        this.socket.emit('join_room', userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, reconnect manually
        console.log('🔄 Server disconnected, attempting to reconnect...');
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('✅ Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Socket reconnect attempt:', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Socket reconnection failed');
      this.isConnected = false;
    });

    // Test connection immediately
    setTimeout(() => {
      if (!this.isConnected) {
        console.warn('⚠️  Socket not connected after 5 seconds');
        this.testConnection();
      }
    }, 5000);

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('✅ Socket disconnected');
    }
  }

  // Test if socket connection is working
  testConnection() {
    if (this.socket) {
      console.log('🔍 Testing socket connection...');
      this.socket.emit('ping', 'test');
      
      const timeout = setTimeout(() => {
        console.error('❌ Socket ping timeout - connection may be broken');
      }, 5000);

      this.socket.once('pong', () => {
        clearTimeout(timeout);
        console.log('✅ Socket ping successful');
      });
    }
  }

  // Cart updates
  onCartUpdate(callback) {
    if (this.socket) {
      console.log('📺 Listening for cart updates...');
      this.socket.on('cart_updated', callback);
    }
  }

  offCartUpdate() {
    if (this.socket) {
      this.socket.off('cart_updated');
    }
  }

  // New phone listings
  onNewListing(callback) {
    if (this.socket) {
      console.log('📺 Listening for new listings...');
      this.socket.on('new_phone_listing', callback);
    }
  }

  offNewListing() {
    if (this.socket) {
      this.socket.off('new_phone_listing');
    }
  }

  // New orders (for sellers)
  onNewOrder(callback) {
    if (this.socket) {
      console.log('📺 Listening for new orders...');
      this.socket.on('new_order', callback);
    }
  }

  offNewOrder() {
    if (this.socket) {
      this.socket.off('new_order');
    }
  }

  // Price updates
  onPriceUpdate(callback) {
    if (this.socket) {
      console.log('📺 Listening for price updates...');
      this.socket.on('price_updated', callback);
    }
  }

  offPriceUpdate() {
    if (this.socket) {
      this.socket.off('price_updated');
    }
  }

  // User status updates
  onUserStatusUpdate(callback) {
    if (this.socket) {
      console.log('📺 Listening for user status updates...');
      this.socket.on('user_status_update', callback);
    }
  }

  offUserStatusUpdate() {
    if (this.socket) {
      this.socket.off('user_status_update');
    }
  }

  // Generic event emitter
  emit(event, data) {
    if (this.socket && this.isConnected) {
      console.log('📤 Emitting event:', event, data);
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️  Cannot emit - socket not connected');
    }
  }

  // Generic event listener
  on(event, callback) {
    if (this.socket) {
      console.log('📺 Adding listener for:', event);
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Check connection status
  isSocketConnected() {
    const connected = this.isConnected && this.socket?.connected;
    console.log('🔍 Socket status check:', connected);
    return connected;
  }

  // Join specific room
  joinRoom(roomName) {
    if (this.socket && this.isConnected) {
      console.log('🏠 Joining room:', roomName);
      this.socket.emit('join_room', roomName);
    } else {
      console.warn('⚠️  Cannot join room - socket not connected');
    }
  }

  // Leave specific room
  leaveRoom(roomName) {
    if (this.socket && this.isConnected) {
      console.log('🚪 Leaving room:', roomName);
      this.socket.emit('leave_room', roomName);
    }
  }

  // Get connection statistics
  getStats() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id,
      transport: this.socket?.io?.engine?.transport?.name
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;