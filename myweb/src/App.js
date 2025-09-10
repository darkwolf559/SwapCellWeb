import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import PhonesPage from './pages/PhonesPage';
import PhoneDetailsPage from './pages/PhoneDetailsPage';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { CartProvider } from './utils/CartContext';
import SocketService from './utils/socket';
import './index.css';
import { FavoritesProvider } from './utils/FavoritesContext';
import AddPhonePage from './pages/AddPhonePage';
import CheckoutPage from './pages/CheckoutPage';
import EditPhonePage from './pages/EditPhonePage';

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
    
    if (page !== currentPage) {
      if (page === 'home') {
        setNavigationHistory(['home']);
        setNavigationData({});
        setSelectedPhone(null);
      } else {
        setNavigationHistory(prev => [...prev, page]);
        setNavigationData(data); // Store the navigation data
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
    } else {
      SocketService.disconnect();
    }

    return () => {
      SocketService.disconnect();
    };
  }, [user]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handlePageNavigation} onPhoneSelect={handlePhoneSelection} />;
      case 'phones':  
        return <PhonesPage onNavigate={handlePageNavigation} onPhoneSelect={handlePhoneSelection} />;
      case 'add-phone':
        return <AddPhonePage onNavigate={handlePageNavigation} />;  
      case 'edit-phone':
        return <EditPhonePage 
          onNavigate={handlePageNavigation} 
          phoneId={navigationData.phoneId} 
        />;
      case 'details':
        const phoneToShow = navigationData.phone || selectedPhone;        
        return <PhoneDetailsPage 
          phone={phoneToShow}
          phoneId={navigationData.phoneId}
          onNavigate={handlePageNavigation} 
        />;
      case 'cart':  
        return <CartPage onNavigate={handlePageNavigation} />;
      case 'checkout': 
        return <CheckoutPage onNavigate={handlePageNavigation} />;  
      case 'auth':
        return <AuthPage onNavigate={handlePageNavigation} />;
      case 'profile':
        return <ProfilePage onNavigate={handlePageNavigation} />;
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