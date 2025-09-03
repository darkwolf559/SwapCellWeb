import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const FilterSidebar = ({ filters, onFiltersChange }) => {
  const brands = ['All', 'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei'];
  const conditions = ['All', 'Excellent', 'Very Good', 'Good', 'Fair'];

  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    onFiltersChange({
      brand: 'all',
      condition: 'all',
      minPrice: 0,
      maxPrice: 2000,
      sortBy: 'featured'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg flex items-center">
          <Filter className="h-5 w-5 mr-2 text-blue-600" />
          Filters
        </h3>
        <button
          onClick={resetFilters}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center transition-colors"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Brand Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Brand</label>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="brand"
                  value={brand.toLowerCase()}
                  checked={filters.brand === brand.toLowerCase() || (brand === 'All' && filters.brand === 'all')}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Condition Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Condition</label>
          <div className="space-y-2">
            {conditions.map((condition) => (
              <label key={condition} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="condition"
                  value={condition.toLowerCase()}
                  checked={filters.condition === condition.toLowerCase() || (condition === 'All' && filters.condition === 'all')}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  {condition}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Price Range: ${filters.minPrice} - ${filters.maxPrice}
          </label>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>$0</span>
            <span>$2000+</span>
          </div>
        </div>

        {/* Quick Price Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Quick Price Filters</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Under $300', min: 0, max: 300 },
              { label: '$300-$600', min: 300, max: 600 },
              { label: '$600-$900', min: 600, max: 900 },
              { label: 'Over $900', min: 900, max: 2000 }
            ].map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  handleFilterChange('minPrice', range.min);
                  handleFilterChange('maxPrice', range.max);
                }}
                className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 py-2 px-3 rounded-lg transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;