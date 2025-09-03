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

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPhone, setSelectedPhone] = useState(null);
  const { user } = useAuth();

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
        return <HomePage onNavigate={setCurrentPage} onPhoneSelect={setSelectedPhone} />;
      case 'phones':
        return <PhonesPage onNavigate={setCurrentPage} onPhoneSelect={setSelectedPhone} />;
      case 'details':
        return <PhoneDetailsPage phone={selectedPhone} onNavigate={setCurrentPage} />;
      case 'cart':
        return <CartPage onNavigate={setCurrentPage} />;
      case 'auth':
        return <AuthPage onNavigate={setCurrentPage} />;
      case 'profile':
        return <ProfilePage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} onPhoneSelect={setSelectedPhone} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
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