import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import PhonesPage from './pages/PhonesPage';
import PhoneDetailsPage from './pages/PhoneDetailsPage';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AddPhonePage from './pages/AddPhonePage';
import CheckoutPage from './pages/CheckoutPage';
import EditPhonePage from './pages/EditPhonePage';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { CartProvider } from './utils/CartContext';
import { FavoritesProvider } from './utils/FavoritesContext';
import SocketService from './utils/socket';
import './index.css';
import AdminDashboard from './pages/AdminDashboard';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState(['home']);
  const [navigationData, setNavigationData] = useState({}); 
  const { user } = useAuth();

  // Updated navigation handler to accept data
  const handleNavigation = (page, data = {}) => {
    console.log('=== App Navigation Debug ===');
    console.log('Navigating to:', page);
    console.log('Navigation data:', data);
    console.log('Current user role:', user?.role);
    
    if (page !== currentPage) {
      if (page === 'home') {
        setNavigationHistory(['home']);
        setNavigationData({});
        setSelectedPhone(null);
      } else {
        setNavigationHistory(prev => [...prev, page]);
        setNavigationData(data);
        if (page === 'details' && data.phone) {
          console.log('Setting selectedPhone from navigation data:', data.phone);
          setSelectedPhone(data.phone);
        }
      }
      setCurrentPage(page);
    }
  };

  const handleBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); 
      const previousPage = newHistory[newHistory.length - 1];
      
      setNavigationHistory(newHistory);
      setCurrentPage(previousPage);
      setNavigationData({}); 
      setSelectedPhone(null); 
    }
  };

  const showBackButton = currentPage !== 'home' && navigationHistory.length > 1;
  
  const handlePageNavigation = (page, data = {}) => {
    handleNavigation(page, data);
  };

  const handlePhoneSelection = (phone) => {
    setSelectedPhone(phone);
  };

  useEffect(() => {
    if (user) {
      SocketService.connect(user.id);
      
      // Listen for admin-specific notifications
      if (user.role === 'admin') {
        SocketService.on('new_pending_listing', (data) => {
          console.log('New pending listing for admin review:', data);
          // Show notification or update dashboard
          showAdminNotification(`New listing "${data.phone.title}" needs review`, 'info');
        });

        SocketService.on('listing_updated_pending', (data) => {
          console.log('Listing updated and needs re-review:', data);
          showAdminNotification(`Updated listing "${data.phone.title}" needs review`, 'info');
        });
      }
      
      // Listen for seller notifications
      if (user.role === 'seller') {
        SocketService.on('listing_approved', (data) => {
          console.log('Listing approved:', data);
          showSellerNotification(`Your listing "${data.phone.title}" has been approved!`, 'success');
        });
        
        SocketService.on('listing_rejected', (data) => {
          console.log('Listing rejected:', data);
          showSellerNotification(`Your listing "${data.phone.title}" was rejected: ${data.reason}`, 'error');
        });

        SocketService.on('listing_deleted', (data) => {
          if (data.isAdminAction) {
            console.log('Listing deleted by admin:', data);
            showSellerNotification('One of your listings was removed by admin', 'error');
          }
        });
      }
    } else {
      SocketService.disconnect();
    }

    return () => {
      SocketService.disconnect();
    };
  }, [user]);

  // Notification helpers
  const showAdminNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-6 right-6 px-6 py-3 rounded-2xl text-white z-50 animate-slide-in ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    }`;
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        ${message}
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  };

  const showSellerNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-6 right-6 px-6 py-3 rounded-2xl text-white z-50 animate-slide-in ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${type === 'success' ? 
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' :
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
          }
        </svg>
        ${message}
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 6000);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handlePageNavigation} onPhoneSelect={handlePhoneSelection} />;
        
      case 'phones':  
        return <PhonesPage onNavigate={handlePageNavigation} onPhoneSelect={handlePhoneSelection} />;
        
      case 'add-phone':
        // Only sellers can add phones
        if (user && user.role === 'seller') {
          return <AddPhonePage onNavigate={handlePageNavigation} />;
        } else {
          showAdminNotification('Only sellers can add phone listings', 'error');
          handleNavigation('home');
          return <HomePage onNavigate={handlePageNavigation} onPhoneSelect={handlePhoneSelection} />;
        }
        
      case 'edit-phone':
        // Only sellers can edit phones (and only their own)
        if (user && user.role === 'seller') {
          return <EditPhonePage 
            onNavigate={handlePageNavigation} 
            phoneId={navigationData.phoneId} 
          />;
        } else {
          showAdminNotification('Only sellers can edit listings', 'error');
          handleNavigation('home');
          return <HomePage onNavigate={handlePageNavigation} onPhoneSelect={handlePhoneSelection} />;
        }
        
      case 'details':
        const phoneToShow = navigationData.phone || selectedPhone;        
        return <PhoneDetailsPage 
          phone={phoneToShow}
          phoneId={navigationData.phoneId}
          onNavigate={handlePageNavigation} 
        />;
        
      case 'cart':  
        // Only buyers can access cart
        if (user && user.role === 'buyer') {
          return <CartPage onNavigate={handlePageNavigation} />;
        } else {
          showAdminNotification('Cart access is for buyers only', 'error');
          handleNavigation('home');
          return <HomePage onNavigate={handlePageNavigation} onPhoneSelect={handlePhoneSelection} />;
        }
        
      case 'checkout': 
        // Only buyers can checkout
        if (user && user.role === 'buyer') {
          return <CheckoutPage onNavigate={handlePageNavigation} />;
        } else {
          showAdminNotification('Checkout access is for buyers only', 'error');
          handleNavigation('home');
          return <HomePage onNavigate={handlePageNavigation} onPhoneSelect={handlePhoneSelection} />;
        }
        
      case 'auth':
        return <AuthPage onNavigate={handlePageNavigation} />;
        
      case 'profile':
        // All authenticated users can access profile
        if (user) {
          return <ProfilePage onNavigate={handlePageNavigation} />;
        } else {
          handleNavigation('auth');
          return <AuthPage onNavigate={handlePageNavigation} />;
        }
        
      case 'admin':
        // Only show admin dashboard to admin users
        if (user && user.role === 'admin') {
          return <AdminDashboard onNavigate={handlePageNavigation} />;
        } else {
          // Redirect non-admin users to home with error message
          showAdminNotification('Access denied. Admin privileges required.', 'error');
          handleNavigation('home');
          return <HomePage onNavigate={handlePageNavigation} onPhoneSelect={handlePhoneSelection} />;
        }
        
      default:
        return <HomePage onNavigate={handlePageNavigation} onPhoneSelect={handlePhoneSelection} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        currentPage={currentPage} 
        onNavigate={handlePageNavigation}
        showBackButton={showBackButton}
        onBack={handleBack}
      />
      {renderPage()}
      
      {/* CSS for notifications and animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-out {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        
        .animate-fade-out {
          animation: fade-out 0.3s ease-out forwards;
        }
        
        /* Global notification styles */
        .notification {
          max-width: 400px;
          word-wrap: break-word;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
        }
        
        /* Loading states */
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid #ffffff33;
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Page transition effects */
        .page-transition {
          animation: page-fade-in 0.5s ease-out forwards;
        }
        
        @keyframes page-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .notification {
            max-width: calc(100vw - 32px);
            margin: 0 16px;
          }
        }
        
        /* Dark mode compatibility */
        @media (prefers-color-scheme: dark) {
          .notification {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .notification {
            border: 2px solid currentColor;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-in,
          .animate-fade-out,
          .page-transition {
            animation: none;
          }
          
          .loading-spinner {
            animation: none;
            border-top-color: transparent;
          }
        }
      `}</style>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <AppContent />
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;