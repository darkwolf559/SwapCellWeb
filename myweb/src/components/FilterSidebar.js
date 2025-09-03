import React, { useState } from 'react';
import { Filter, RotateCcw, DollarSign, Sparkles, ChevronDown, ChevronRight, Zap, Smartphone } from 'lucide-react';

const FilterSidebar = ({ filters, onFiltersChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    price: true,
    quickPrice: true
  });

  const brands = [
    { name: 'All', icon: '✨' },
    { name: 'Apple', icon: '🍎' },
    { name: 'Samsung', icon: '📱' },
    { name: 'Google', icon: '🔍' },
    { name: 'OnePlus', icon: '⚡' },
    { name: 'Xiaomi', icon: '🚀' },
    { name: 'Huawei', icon: '🌸' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    onFiltersChange({
      brand: 'all',
      minPrice: 0,
      maxPrice: 2000,
      sortBy: 'featured'
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.brand !== 'all') count++;
    if (filters.minPrice > 0 || filters.maxPrice < 2000) count++;
    return count;
  };

  return (
    <div className="relative">
      <div className="relative bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-700 overflow-hidden shadow-lg">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Filter className="h-5 w-5 text-cyan-400" />
            Smart Filters
          </h3>
          <button
            onClick={resetFilters}
            className="p-2 rounded-lg hover:bg-gray-700 transition relative"
          >
            <RotateCcw className="h-5 w-5 text-gray-400 hover:text-red-400 transition-transform hover:rotate-180" />
          </button>
        </div>

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="px-5 py-2">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-md">
              <Sparkles className="h-4 w-4" />
              {getActiveFiltersCount()} active
            </div>
          </div>
        )}

        <div className="p-5 space-y-6">
          {/* Brand */}
          <div>
            <button
              onClick={() => toggleSection('brand')}
              className="flex items-center justify-between w-full"
            >
              <span className="text-gray-200 font-semibold flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-400" /> Brand
              </span>
              {expandedSections.brand ? <ChevronDown /> : <ChevronRight />}
            </button>
            {expandedSections.brand && (
              <div className="mt-3 space-y-2 transition-all">
                {brands.map(brand => (
                  <label
                    key={brand.name}
                    className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition 
                      ${filters.brand === brand.name.toLowerCase() || (brand.name === 'All' && filters.brand === 'all')
                        ? 'bg-gradient-to-r from-cyan-600/40 to-purple-600/40 border border-cyan-500/40 shadow-md'
                        : 'hover:bg-gray-700/50 border border-transparent'}`}
                  >
                    <input
                      type="radio"
                      name="brand"
                      value={brand.name.toLowerCase()}
                      checked={filters.brand === brand.name.toLowerCase() || (brand.name === 'All' && filters.brand === 'all')}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                      className="hidden"
                    />
                    <span className="text-xl">{brand.icon}</span>
                    <span className="text-gray-300">{brand.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price */}
          <div>
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full"
            >
              <span className="text-gray-200 font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-400" /> Price Range
              </span>
              {expandedSections.price ? <ChevronDown /> : <ChevronRight />}
            </button>
            {expandedSections.price && (
              <div className="mt-3 space-y-4">
                <div className="text-gray-400 text-sm">Selected: ${filters.minPrice} - ${filters.maxPrice}</div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            )}
          </div>

          {/* Quick Price */}
          <div>
            <button
              onClick={() => toggleSection('quickPrice')}
              className="flex items-center justify-between w-full"
            >
              <span className="text-gray-200 font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-pink-400" /> Quick Filters
              </span>
              {expandedSections.quickPrice ? <ChevronDown /> : <ChevronRight />}
            </button>
            {expandedSections.quickPrice && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { label: 'Budget', min: 0, max: 300 },
                  { label: 'Mid-Range', min: 300, max: 600 },
                  { label: 'Premium', min: 600, max: 900 },
                  { label: 'Flagship', min: 900, max: 2000 }
                ].map(range => (
                  <button
                    key={range.label}
                    onClick={() => {
                      handleFilterChange('minPrice', range.min);
                      handleFilterChange('maxPrice', range.max);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm border transition font-medium
                      ${filters.minPrice === range.min && filters.maxPrice === range.max
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                        : 'border-gray-600 text-gray-300 hover:bg-gray-700/50'}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reset Button */}
        <div className="p-5 border-t border-gray-700">
          <button
            onClick={resetFilters}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 hover:from-red-500 hover:to-pink-500 hover:text-white transition shadow-md"
          >
            <RotateCcw className="h-5 w-5" />
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
