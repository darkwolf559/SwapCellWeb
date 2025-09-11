import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Plus, Smartphone, DollarSign, MapPin, Star, ArrowLeft, Save, Zap, Shield } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

const AddPhonePage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    price: '',
    originalPrice: '',
    condition: 'Excellent',
    description: '',
    location: '',
    specs: {
      ram: '',
      storage: '',
      battery: '',
      camera: '',
      processor: '',
      screen: '',
      os: ''
    }
  });

  const brandOptions = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Sony', 'LG', 'Motorola', 'Nokia', 'Other'];
  const conditionOptions = [
    { value: 'Excellent', label: 'Excellent - Like new', color: 'from-green-500 to-emerald-600' },
    { value: 'Very Good', label: 'Very Good - Minor wear', color: 'from-blue-500 to-cyan-600' },
    { value: 'Good', label: 'Good - Visible wear', color: 'from-yellow-500 to-orange-600' },
    { value: 'Fair', label: 'Fair - Heavy wear', color: 'from-red-500 to-pink-600' }
  ];

  // Check if user is a seller
  if (!user || user.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 backdrop-blur-lg rounded-3xl border border-gray-700">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">Only sellers can create new phone listings.</p>
          <button
            onClick={() => onNavigate('phones')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all"
          >
            Back to Phones
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('specs.')) {
      const specKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specs: { ...prev.specs, [specKey]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (files) => {
    const fileArray = Array.from(files);
    const maxFiles = 6;
    
    if (images.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    fileArray.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            file: file,
            url: e.target.result,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.brand || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      alert('Please add at least one image');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload with Cloudinary
      const submitData = new FormData();
      
      // Append form data
      submitData.append('title', formData.title);
      submitData.append('brand', formData.brand);
      submitData.append('price', Number(formData.price));
      if (formData.originalPrice) submitData.append('originalPrice', Number(formData.originalPrice));
      submitData.append('condition', formData.condition);
      submitData.append('description', formData.description);
      submitData.append('location', formData.location);
      
      // Append specs as JSON string
      submitData.append('specs', JSON.stringify(formData.specs));
      
      // Append images - Cloudinary will handle the processing
      images.forEach((image) => {
        submitData.append('images', image.file);
      });

      // Make API call to backend
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/phones`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show success message with animation
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-20 right-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-bounce';
        successMessage.innerHTML = `
          <div class="flex items-center">
            <svg class="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Phone listing created successfully!
          </div>
        `;
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
          document.body.removeChild(successMessage);
          onNavigate('phones');
        }, 2000);
        
        console.log('New phone created:', result);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Error creating phone listing:', error);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-20 right-6 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50';
      errorMessage.innerHTML = `
        <div class="flex items-center">
          <svg class="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Error: ${error.message}
        </div>
      `;
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-900/20 to-gray-900 pt-24 pb-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-float-delay" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('phones')}
            className="flex items-center bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white px-4 py-3 rounded-2xl transition-all duration-300 backdrop-blur-lg border border-gray-700/50"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Phones
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Add New Phone
          </h1>
          <div className="w-32" />
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Images */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Camera className="h-6 w-6 mr-3 text-purple-400" />
                  Phone Images
                  <div className="ml-auto text-xs bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-3 py-1 rounded-full pr-0">
                    Powered by Radun Senula
                  </div>
                </h3>

                {/* Image Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                    dragActive 
                      ? 'border-purple-400 bg-purple-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                  
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Drag & drop images here</p>
                  <p className="text-gray-500 text-sm mb-4">Images will be automatically optimized</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Choose Files
                  </button>
                  <p className="text-gray-500 text-xs mt-3">Max 6 images • Auto-converted to WebP • Cloud storage</p>
                </div>

                {/* Image Preview Grid */}
                {images.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {images.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Main
                          </div>
                        )}
                        {/* Cloudinary optimization indicator */}
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center">
                          <Zap className="h-3 w-3 mr-1" />
                          Auto-optimized
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Basic Info */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Smartphone className="h-6 w-6 mr-3 text-cyan-400" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Phone Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. iPhone 14 Pro Max 128GB"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Brand *
                    </label>
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-2xl px-4 py-3 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    >
                      <option value="">Select Brand</option>
                      {brandOptions.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Price (LKR) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">LKR</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Original Price (LKR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">LKR</span>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        placeholder="Optional"
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Condition *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {conditionOptions.map(condition => (
                        <div key={condition.value} className="relative cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, condition: condition.value }))}>
                          <input
                            type="radio"
                            name="condition"
                            value={condition.value}
                            checked={formData.condition === condition.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className={`p-3 rounded-2xl border-2 transition-all duration-300 text-center ${
                            formData.condition === condition.value
                              ? `bg-gradient-to-r ${condition.color} border-transparent text-white shadow-lg`
                              : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                          }`}>
                            <div className="font-medium text-sm">{condition.value}</div>
                            <div className="text-xs opacity-80 mt-1">{condition.label.split(' - ')[1]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, Area"
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Zap className="h-6 w-6 mr-3 text-yellow-400" />
                  Technical Specifications
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">RAM</label>
                    <input
                      type="text"
                      name="specs.ram"
                      value={formData.specs.ram}
                      onChange={handleInputChange}
                      placeholder="e.g. 6GB, 8GB"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Storage</label>
                    <input
                      type="text"
                      name="specs.storage"
                      value={formData.specs.storage}
                      onChange={handleInputChange}
                      placeholder="e.g. 128GB, 256GB"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Battery</label>
                    <input
                      type="text"
                      name="specs.battery"
                      value={formData.specs.battery}
                      onChange={handleInputChange}
                      placeholder="e.g. 4000mAh"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Camera</label>
                    <input
                      type="text"
                      name="specs.camera"
                      value={formData.specs.camera}
                      onChange={handleInputChange}
                      placeholder="e.g. 48MP Triple"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Processor</label>
                    <input
                      type="text"
                      name="specs.processor"
                      value={formData.specs.processor}
                      onChange={handleInputChange}
                      placeholder="e.g. A16 Bionic"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Screen</label>
                    <input
                      type="text"
                      name="specs.screen"
                      value={formData.specs.screen}
                      onChange={handleInputChange}
                      placeholder="e.g. 6.1inch OLED"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Operating System</label>
                    <input
                      type="text"
                      name="specs.os"
                      value={formData.specs.os}
                      onChange={handleInputChange}
                      placeholder="e.g. iOS 16, Android 13"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Description</h3>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe the phone's condition, included accessories, reason for selling, etc."
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => onNavigate('phones')}
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 backdrop-blur-lg border border-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 text-white px-12 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Uploading to Cloud...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-5 w-5 mr-3" />
                      Create Listing
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-2deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delay {
          animation: float-delay 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
  };

export default AddPhonePage;