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

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState(['home']);
  const { user } = useAuth();

  const handleNavigation = (page) => {
    if (page !== currentPage) {
      if (page === 'home') {
        // If navigating to home, reset history to just home
        setNavigationHistory(['home']);
      } else {
        // Add new page to history
        setNavigationHistory(prev => [...prev, page]);
      }
      setCurrentPage(page);
    }
  };

  const handleBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1];
      
      setNavigationHistory(newHistory);
      setCurrentPage(previousPage);
    }
  };

  // Show back button when not on home page AND there's navigation history
  const showBackButton = currentPage !== 'home' && navigationHistory.length > 1;

  // Update your existing navigation handler to use the new one
  const handlePageNavigation = (page) => {
    handleNavigation(page);
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
        return <HomePage onNavigate={handlePageNavigation} onPhoneSelect={setSelectedPhone} />;
      case 'phones':  
        return <PhonesPage onNavigate={handlePageNavigation} onPhoneSelect={setSelectedPhone} />;
      case 'add-phone':
        return <AddPhonePage onNavigate={handlePageNavigation} />;  
      case 'details':
        return <PhoneDetailsPage phone={selectedPhone} onNavigate={handlePageNavigation} />;
      case 'cart':
        return <CartPage onNavigate={handlePageNavigation} />;
      case 'auth':
        return <AuthPage onNavigate={handlePageNavigation} />;
      case 'profile':
        return <ProfilePage onNavigate={handlePageNavigation} />;
      default:
        return <HomePage onNavigate={handlePageNavigation} onPhoneSelect={setSelectedPhone} />;
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