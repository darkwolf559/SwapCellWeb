import React, { useState, useMemo } from 'react';
import { Filter, Smartphone } from 'lucide-react';
import PhoneCard from '../components/PhoneCard';
import FilterSidebar from '../components/FilterSidebar';
import { mockPhones } from '../utils/mockData';

const PhonesPage = ({ onNavigate, onPhoneSelect }) => {
  const [filters, setFilters] = useState({
    brand: 'all',
    condition: 'all',
    minPrice: 0,
    maxPrice: 2000,
    sortBy: 'featured'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredPhones = useMemo(() => {
    let filtered = mockPhones.filter(phone => {
      const matchesSearch = phone.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           phone.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = filters.brand === 'all' || phone.brand.toLowerCase() === filters.brand.toLowerCase();
      const matchesCondition = filters.condition === 'all' || phone.condition === filters.condition;
      const matchesPrice = phone.price >= filters.minPrice && phone.price <= filters.maxPrice;

      return matchesSearch && matchesBrand && matchesCondition && matchesPrice;
    });

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_low':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price_high':
        return filtered.sort((a, b) => b.price - a.price);
      case 'newest':
        return filtered.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      default:
        return filtered;
    }
  }, [searchQuery, filters]);

  const handlePhoneSelect = (phone) => {
    onPhoneSelect(phone);
    onNavigate('details');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search phones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <FilterSidebar filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Phone Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Phones ({filteredPhones.length})
              </h2>
              <select 
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {filteredPhones.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPhones.map((phone, index) => (
                  <div 
                    key={phone.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <PhoneCard
                      phone={phone}
                      onViewDetails={handlePhoneSelect}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <Smartphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No phones found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Load More Button */}
            {filteredPhones.length > 0 && filteredPhones.length >= 9 && (
              <div className="text-center mt-12">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-xl font-medium transition-colors shadow-sm hover:shadow-md">
                  Load More Phones
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhonesPage;