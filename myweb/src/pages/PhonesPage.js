import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Filter, Smartphone, Search, Zap, Grid, List, Star, TrendingUp, Plus, User } from 'lucide-react';
import PhoneCard from '../components/PhoneCard';
import FilterSidebar from '../components/FilterSidebar';
import { phoneAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

const PhonesPage = ({ onNavigate, onPhoneSelect }) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    brand: 'all',
    condition: 'all',
    minPrice: 0,
    maxPrice: 1000000,
    sortBy: 'featured'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  
  // API State
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  const [stats, setStats] = useState({
    total: 0,
    avgRating: '4.7',
    bestDeal: 0,
    trending: 'iPhone 14'
  });

  const containerRef = useRef(null);

  // Handle mouse movement for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch phones from API
  const fetchPhones = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 12,
        search: searchQuery || undefined,
        brand: filters.brand !== 'all' ? filters.brand : undefined,
        condition: filters.condition !== 'all' ? filters.condition : undefined,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < 1000000 ? filters.maxPrice : undefined,
        sort: filters.sortBy
      };

      // Remove undefined values
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await phoneAPI.getPhones(params);
      const { phones: fetchedPhones, pagination: paginationData } = response.data;

      setPhones(fetchedPhones);
      setPagination(paginationData);
      
      // Update stats
      if (fetchedPhones.length > 0) {
        const prices = fetchedPhones.map(p => p.price);
        const minPrice = Math.min(...prices);
        setStats(prev => ({
          ...prev,
          total: paginationData.totalItems,
          bestDeal: minPrice
        }));
      }

    } catch (err) {
      console.error('Failed to fetch phones:', err);
      setError(err.response?.data?.message || 'Failed to load phones');
      setPhones([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch phones when filters or search changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPhones(1);
    }, 500); // Debounce search

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters]);

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

  const handleLoadMore = () => {
    if (pagination.hasNext) {
      fetchPhones(pagination.currentPage + 1);
    }
  };

  return (
    <>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float"
          style={{
            left: `${mousePosition.x * 0.02}%`,
            top: `${mousePosition.y * 0.03}%`,
            transform: `translateY(${scrollY * -0.1}px)`
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-float-delay"
          style={{
            right: `${(100 - mousePosition.x) * 0.02}%`,
            bottom: `${(100 - mousePosition.y) * 0.03}%`,
            transform: `translateY(${scrollY * -0.15}px)`
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${mousePosition.x * 0.01}%`,
            bottom: `${(100 - mousePosition.y) * 0.02}%`,
            transform: `translateY(${scrollY * -0.2}px)`
          }}
        />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-grid-pattern animate-grid-flow" />
        </div>
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/60 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="min-h-screen relative" ref={containerRef}>
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div 
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-flow"
            style={{
              transform: `translateX(${mousePosition.x * 0.1 - 50}px) translateY(${mousePosition.y * 0.1 - 50}px)`
            }}
          />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Centered Header */}
            <div className="text-center mb-8">
              <h1 className="mt-6 text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-glow mb-4">
                PHONES
              </h1>
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="h-1 w-20 bg-gradient-to-r from-transparent to-cyan-400 animate-pulse" />
                <Zap className="h-8 w-8 text-yellow-400 animate-bounce" />
                <div className="h-1 w-20 bg-gradient-to-l from-transparent to-purple-400 animate-pulse" />
              </div>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
                Discover the future of mobile technology with our premium collection of pre-owned smartphones
              </p>
              
              {/* Centered Add New Phone Button */}
              {user && user.role === 'seller' && (
                <div className="flex justify-center">
                  <button
                    onClick={() => onNavigate('add-phone')}
                    className="group relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-500 inline-flex items-center shadow-2xl shadow-green-500/25 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <Plus className="h-5 w-5 mr-2 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="relative z-10">Add New Phone</span>
                  </button>
                </div>
              )}
            </div>

            {/* Advanced Search Bar */}
            <div className="relative max-w-4xl mx-auto mb-8">
              <div 
                className={`relative bg-gray-800/40 backdrop-blur-xl rounded-3xl border transition-all duration-500 overflow-hidden
                           ${isSearchFocused ? 'border-cyan-400/50 shadow-2xl shadow-cyan-400/20 scale-105' : 'border-gray-700/50'}`}
              >
                {/* Animated border */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl animate-border-flow opacity-0 transition-opacity duration-300" 
                     style={{ opacity: isSearchFocused ? 1 : 0 }} />
                
                <div className="relative flex items-center p-6">
                  <Search className={`h-6 w-6 mr-4 transition-all duration-300 ${isSearchFocused ? 'text-cyan-400 scale-110' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search for your dream phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="flex-1 bg-transparent text-white placeholder-gray-400 text-lg focus:outline-none"
                    disabled={loading}
                  />
                  {searchQuery && (
                    <div className="ml-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white text-sm font-semibold animate-pulse">
                      {phones.length} found
                    </div>
                  )}
                </div>

                {/* Search suggestions */}
                {isSearchFocused && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden z-50">
                    <div className="p-4">
                      <p className="text-gray-400 text-sm mb-3">Popular Searches</p>
                      <div className="flex flex-wrap gap-2">
                        {['iPhone 14', 'Samsung Galaxy', 'Google Pixel', 'OnePlus'].map((suggestion, i) => (
                          <button
                            key={suggestion}
                            onClick={() => setSearchQuery(suggestion)}
                            className="px-3 py-2 bg-gray-700/50 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 text-gray-300 hover:text-white rounded-lg text-sm transition-all duration-300 hover:scale-105"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                           text-white rounded-2xl px-6 py-4 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 
                           transform hover:scale-105 backdrop-blur-lg border border-purple-500/50"
                >
                  <Filter className="h-5 w-5 mr-3 animate-pulse" />
                  <span className="font-semibold">Filters</span>
                  {showFilters && <div className="ml-2 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />}
                </button>
              </div>

              {/* Enhanced Filters Sidebar */}
              <div className={`lg:w-72 transition-all duration-500 ${showFilters ? 'block animate-slide-in' : 'hidden lg:block'}`}>
                <div className="sticky top-8">
                  <FilterSidebar filters={filters} onFiltersChange={setFilters} />
                </div>
              </div>

              {/* Phone Grid Section */}
              <div className="flex-1">
                {/* Control Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
                  <div className="flex items-center space-x-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Available Phones
                    </h2>
                    <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-lg px-4 py-2 rounded-2xl border border-gray-700/50">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${loading ? 'bg-yellow-400' : 'bg-green-400'}`} />
                      <span className={`font-semibold text-lg ${loading ? 'text-yellow-400' : 'text-green-400'}`}>
                        {loading ? '...' : pagination.totalItems}
                      </span>
                      <span className="text-gray-400">found</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-gray-800/50 backdrop-blur-lg rounded-2xl p-1 border border-gray-700/50">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          viewMode === 'grid' 
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                      >
                        <Grid className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          viewMode === 'list' 
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                      >
                        <List className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <select 
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      disabled={loading}
                      className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl px-4 py-3 text-white 
                               focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 
                               hover:bg-gray-700/50 cursor-pointer disabled:opacity-50"
                    >
                      <option className="bg-purple-800 text-white" value="featured">✨ Featured</option>
                      <option className="bg-pink-700 text-white" value="price_low">💰 Price: Low to High</option>
                      <option className="bg-purple-700 text-white" value="price_high">💎 Price: High to Low</option>
                      <option className="bg-pink-600 text-white" value="newest">🆕 Newest First</option>
                      <option className="bg-purple-600 text-white" value="rating">⭐ Highest Rated</option>
                    </select>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Phones', value: stats.total, icon: Smartphone, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Avg Rating', value: stats.avgRating, icon: Star, color: 'from-yellow-500 to-orange-500' },
                    { label: 'Best Deal', value: `LKR ${stats.bestDeal}`, icon: Zap, color: 'from-green-500 to-teal-500' },
                    { label: 'Trending', value: stats.trending, icon: TrendingUp, color: 'from-purple-500 to-pink-500' }
                  ].map((stat, i) => (
                    <div key={stat.label} className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">{stat.label}</p>
                          <p className="text-white text-xl font-bold">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-400 text-xl">Loading amazing phones...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="text-center py-20 bg-red-900/20 backdrop-blur-lg rounded-3xl border border-red-500/30">
                    <Smartphone className="h-24 w-24 text-red-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-red-300 mb-4">Failed to Load Phones</h3>
                    <p className="text-red-400 mb-8">{error}</p>
                    <button
                      onClick={() => fetchPhones(1)}
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
                {!loading && !error && phones.length > 0 && (
                  <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {phones.map((phone, index) => (
                      <div 
                        key={phone._id} 
                        className="animate-fade-in-up"
                        style={{ 
                          animationDelay: `${index * 0.1}s`,
                          animationFillMode: 'both'
                        }}
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

                {/* No Results */}
                {!loading && !error && phones.length === 0 && (
                  <div className="text-center py-20 bg-gray-800/20 backdrop-blur-lg rounded-3xl border border-gray-700/30">
                    <div className="relative">
                      {/* Animated background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-pink-500/10 rounded-3xl animate-pulse" />
                      
                      <div className="relative">
                        <Smartphone className="h-24 w-24 text-gray-600 mx-auto mb-6 animate-bounce" />
                        <h3 className="text-2xl font-bold text-gray-300 mb-4">No phones found</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                          Try adjusting your search criteria or explore our full collection
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setFilters({
                              brand: 'all',
                              condition: 'all',
                              minPrice: 0,
                              maxPrice: 2000,
                              sortBy: 'featured'
                            });
                          }}
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 
                                   text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 
                                   transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                        >
                          <Zap className="inline h-5 w-5 mr-2" />
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Load More Button */}
                {!loading && phones.length > 0 && pagination.hasNext && (
                  <div className="text-center mt-16">
                    <button 
                      onClick={handleLoadMore}
                      className="group relative bg-gray-800/50 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-500 
                               text-gray-300 hover:text-white px-12 py-4 rounded-2xl font-semibold transition-all duration-500 
                               transform hover:scale-105 hover:shadow-2xl border border-gray-700/50 hover:border-transparent backdrop-blur-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                      <span className="relative flex items-center">
                        <TrendingUp className="h-5 w-5 mr-3 group-hover:animate-bounce" />
                        Load More Phones ({pagination.totalPages - pagination.currentPage} pages left)
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-2deg); }
        }
        
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(34, 211, 238, 0.5); }
          50% { text-shadow: 0 0 30px rgba(168, 85, 247, 0.8), 0 0 40px rgba(236, 72, 153, 0.5); }
        }
        
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes border-flow {
          0% { opacity: 0; transform: rotate(0deg); }
          50% { opacity: 1; transform: rotate(180deg); }
          100% { opacity: 0; transform: rotate(360deg); }
        }
        
        @keyframes grid-flow {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(20px) translateY(20px); }
        }
        
        @keyframes slide-in {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delay {
          animation: float-delay 8s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        
        .animate-gradient-flow {
          background-size: 200% 200%;
          animation: gradient-flow 10s ease infinite;
        }
        
        .animate-border-flow {
          animation: border-flow 2s ease-in-out infinite;
        }
        
        .animate-grid-flow {
          animation: grid-flow 20s linear infinite;
        }
        
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </>
  );
};

export default PhonesPage;