import React, { useState, useEffect } from 'react';
import { Search, Star, ShoppingCart, Zap, Shield, Smartphone } from 'lucide-react';
import PhoneCard from '../components/PhoneCard';
import { phoneAPI } from '../utils/api';

const HomePage = ({ onNavigate, onPhoneSelect }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [featuredPhones, setFeaturedPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 0.5 + 0.2,
      color: ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'][Math.floor(Math.random() * 5)]
    }));
    setParticles(newParticles);

    // Mouse movement tracking
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch featured phones
  const fetchFeaturedPhones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await phoneAPI.getPhones({ 
        limit: 12, // Fetch more phones to have variety for random selection
        sort: 'newest' // Get newest phones
      });
      
      const phones = response.data.phones;
      
      // Randomly select 3 phones from available phones
      if (phones && phones.length > 0) {
        const shuffled = [...phones].sort(() => 0.5 - Math.random());
        setFeaturedPhones(shuffled.slice(0, 3));
      } else {
        setFeaturedPhones([]);
      }
    } catch (err) {
      console.error('Failed to fetch featured phones:', err);
      setError('Failed to load featured phones');
      setFeaturedPhones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedPhones();

    // Auto-refresh featured phones every 30 seconds for variety
    const interval = setInterval(fetchFeaturedPhones, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handlePhoneSelect = async (phone) => {
    try {
      // Fetch full phone details
      const response = await phoneAPI.getPhone(phone._id);
      onPhoneSelect(response.data);
      onNavigate('details');
    } catch (err) {
      console.error('Failed to fetch phone details:', err);
      // Still navigate with basic data
      onPhoneSelect(phone);
      onNavigate('details');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`
          }}
        />
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-60 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animation: `float ${3 + particle.speed}s ease-in-out infinite alternate`,
            animationDelay: `${particle.id * 0.2}s`
          }}
        />
      ))}

      {/* Moving Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full bg-grid-pattern animate-grid-move"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            {/* Animated Title */}
            <div className="relative mb-8">
              <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4 animate-subtle-glow">
                Find Your Perfect
              </h1>
              <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-blue-400 to-cyan-400 animate-subtle-glow">
                Used Phone
              </h2>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-ping opacity-75" />
              <div className="absolute top-12 -left-8 w-6 h-6 bg-green-400 rounded-full animate-bounce" />
            </div>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto animate-fade-in-up leading-relaxed">
              Discover quality pre-owned smartphones with 
              <span className="text-cyan-400 font-semibold"> unbeatable prices</span>, 
              <span className="text-purple-400 font-semibold"> certified sellers</span>, and 
              <span className="text-pink-400 font-semibold"> trusted quality checks</span>
            </p>

            {/* Animated Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
              {[
                { value: `${featuredPhones.length}+`, label: "Verified Phones", color: "from-cyan-400 to-blue-500", icon: Smartphone },
                { value: "98%", label: "Customer Satisfaction", color: "from-purple-400 to-pink-500", icon: Star },
                { value: "24h", label: "Fast Response", color: "from-green-400 to-teal-500", icon: Zap }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="relative group animate-gentle-float"
                  style={{ animationDelay: `${index * 0.3}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r opacity-20 group-hover:opacity-40 rounded-2xl blur-xl transition-opacity" 
                       style={{ background: `linear-gradient(135deg, ${stat.color.split(' ').join(', ')})` }} />
                  <div className="relative bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 hover:border-gray-500 transition-all duration-300 transform hover:scale-105">
                    <div className="flex justify-center mb-4">
                      <stat.icon className={`h-8 w-8 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                    </div>
                    <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                      {stat.value}
                    </div>
                    <div className="text-gray-300 font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Phones Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4 animate-subtle-glow">
            Featured Phones
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto rounded-full animate-pulse" />
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-xl">Loading featured phones...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20 bg-red-900/20 backdrop-blur-lg rounded-3xl border border-red-500/30 max-w-2xl mx-auto">
            <Smartphone className="h-24 w-24 text-red-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-red-300 mb-4">Failed to Load Phones</h3>
            <p className="text-red-400 mb-8">{error}</p>
            <button
              onClick={fetchFeaturedPhones}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 
                       text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 
                       transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
            >
              <Zap className="inline h-5 w-5 mr-2" />
              Try Again
            </button>
          </div>
        )}

        {/* Phone Grid */}
        {!loading && !error && featuredPhones.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPhones.map((phone, index) => (
              <div 
                key={`${phone._id}-${index}`} // Unique key for re-renders
                className="animate-fade-in-up transform hover:scale-105 transition-all duration-500"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <PhoneCard
                  phone={phone}
                  onViewDetails={handlePhoneSelect}
                  showAnimation={true}
                />
              </div>
            ))}
          </div>
        )}

        {/* No Phones Available */}
        {!loading && !error && featuredPhones.length === 0 && (
          <div className="text-center py-20 bg-gray-800/20 backdrop-blur-lg rounded-3xl border border-gray-700/30 max-w-2xl mx-auto">
            <Smartphone className="h-24 w-24 text-gray-600 mx-auto mb-6 animate-bounce" />
            <h3 className="text-2xl font-bold text-gray-300 mb-4">No Phones Available</h3>
            <p className="text-gray-500 mb-8">
              Be the first to list a phone on our platform!
            </p>
            <button
              onClick={() => onNavigate('auth')}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 
                       text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 
                       transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              Get Started
            </button>
          </div>
        )}
        
        {/* Explore All Phones Button */}
        {featuredPhones.length > 0 && (
          <div className="text-center mt-16">
            <button
              onClick={() => onNavigate('phones')}
              className="relative group bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <span className="relative flex items-center">
                <Smartphone className="h-6 w-6 mr-3 animate-pulse" />
                Explore All Phones
                <div className="ml-3 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-20 mt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Smart Search",
                description: "Advanced search algorithms help you find your perfect phone match instantly",
                gradient: "from-cyan-500 to-blue-600",
                bgGradient: "from-cyan-500/10 to-blue-600/10"
              },
              {
                icon: Shield,
                title: "Verified Sellers",
                description: "Every seller undergoes thorough verification for your peace of mind and security",
                gradient: "from-purple-500 to-pink-600",
                bgGradient: "from-purple-500/10 to-pink-600/10"
              },
              {
                icon: Zap,
                title: "Fast Transactions",
                description: "Lightning-fast and secure transactions with real-time updates and notifications",
                gradient: "from-green-500 to-teal-600",
                bgGradient: "from-green-500/10 to-teal-600/10"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="relative group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                <div className="relative bg-gray-800/80 backdrop-blur-lg border border-gray-700 rounded-3xl p-8 hover:border-gray-500 transition-all duration-500 transform hover:scale-105">
                  <div className="text-center">
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-all duration-300`}>
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className={`text-2xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent mb-4`}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes subtle-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-gentle-float {
          animation: gentle-float 4s ease-in-out infinite;
        }
        
        .animate-subtle-glow {
          animation: subtle-glow 3s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-grid-move {
          animation: grid-move 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;