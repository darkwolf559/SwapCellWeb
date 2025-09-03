export const mockPhones = [
  {
    id: 1,
    title: "iPhone 14 Pro Max",
    brand: "Apple",
    price: 899,
    originalPrice: 1199,
    condition: "Excellent",
    rating: 4.8,
    reviews: 23,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
    seller: { 
      name: "John Doe", 
      phone: "+65 9123 4567", 
      rating: 4.9,
      id: 1
    },
    specs: {
      ram: "6GB",
      storage: "256GB",
      battery: "4323mAh",
      camera: "48MP Triple Camera",
      processor: "A16 Bionic",
      screen: "6.7 inch Super Retina XDR",
      os: "iOS 17"
    },
    location: "Orchard, Singapore",
    postedTime: "2 hours ago",
    description: "Like new iPhone 14 Pro Max in Space Black. Includes original box, charger, and case. No scratches or dents.",
    views: 156
  },
  {
    id: 2,
    title: "Samsung Galaxy S23 Ultra",
    brand: "Samsung",
    price: 749,
    originalPrice: 1299,
    condition: "Very Good",
    rating: 4.7,
    reviews: 31,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
    seller: { 
      name: "Sarah Lim", 
      phone: "+65 8765 4321", 
      rating: 4.8,
      id: 2
    },
    specs: {
      ram: "12GB",
      storage: "512GB",
      battery: "5000mAh",
      camera: "200MP Quad Camera",
      processor: "Snapdragon 8 Gen 2",
      screen: "6.8 inch Dynamic AMOLED",
      os: "Android 14"
    },
    location: "Marina Bay, Singapore",
    postedTime: "5 hours ago",
    description: "Samsung Galaxy S23 Ultra with S Pen. Minor wear on corners but screen is perfect. Comes with original accessories.",
    views: 203
  },
  {
    id: 3,
    title: "Google Pixel 8 Pro",
    brand: "Google",
    price: 649,
    originalPrice: 999,
    condition: "Good",
    rating: 4.6,
    reviews: 18,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    seller: { 
      name: "Mike Chen", 
      phone: "+65 9876 5432", 
      rating: 4.7,
      id: 3
    },
    specs: {
      ram: "12GB",
      storage: "128GB",
      battery: "5050mAh",
      camera: "50MP Triple Camera",
      processor: "Google Tensor G3",
      screen: "6.7 inch LTPO OLED",
      os: "Android 14"
    },
    location: "Tampines, Singapore",
    postedTime: "1 day ago",
    description: "Google Pixel 8 Pro with amazing camera capabilities. Some minor scratches on back but fully functional.",
    views: 89
  },
  {
    id: 4,
    title: "iPhone 13 Pro",
    brand: "Apple",
    price: 679,
    originalPrice: 999,
    condition: "Very Good",
    rating: 4.5,
    reviews: 15,
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400",
    seller: { 
      name: "Lisa Tan", 
      phone: "+65 8123 9876", 
      rating: 4.6,
      id: 4
    },
    specs: {
      ram: "6GB",
      storage: "128GB",
      battery: "3095mAh",
      camera: "12MP Triple Camera",
      processor: "A15 Bionic",
      screen: "6.1 inch Super Retina XDR",
      os: "iOS 17"
    },
    location: "Jurong East, Singapore",
    postedTime: "3 hours ago",
    description: "iPhone 13 Pro in Sierra Blue. Great condition with 88% battery health. Includes MagSafe case.",
    views: 134
  },
  {
    id: 5,
    title: "OnePlus 11",
    brand: "OnePlus",
    price: 549,
    originalPrice: 799,
    condition: "Excellent",
    rating: 4.4,
    reviews: 12,
    image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400",
    seller: { 
      name: "David Wong", 
      phone: "+65 9234 5678", 
      rating: 4.5,
      id: 5
    },
    specs: {
      ram: "16GB",
      storage: "256GB",
      battery: "5000mAh",
      camera: "50MP Triple Camera",
      processor: "Snapdragon 8 Gen 2",
      screen: "6.7 inch AMOLED",
      os: "OxygenOS 13"
    },
    location: "Clementi, Singapore",
    postedTime: "6 hours ago",
    description: "Brand new OnePlus 11 in Titan Black. Never dropped, always used with case and screen protector.",
    views: 67
  },
  {
    id: 6,
    title: "Samsung Galaxy Z Fold 5",
    brand: "Samsung",
    price: 1299,
    originalPrice: 1799,
    condition: "Excellent",
    rating: 4.9,
    reviews: 8,
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400",
    seller: { 
      name: "Emma Koh", 
      phone: "+65 8456 7890", 
      rating: 4.9,
      id: 6
    },
    specs: {
      ram: "12GB",
      storage: "512GB",
      battery: "4400mAh",
      camera: "50MP Triple Camera",
      processor: "Snapdragon 8 Gen 2",
      screen: "7.6 inch Foldable AMOLED",
      os: "Android 14"
    },
    location: "Raffles Place, Singapore",
    postedTime: "1 day ago",
    description: "Samsung Galaxy Z Fold 5 in Phantom Black. Foldable screen in perfect condition with minimal crease.",
    views: 245
  }
];

export const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+65 9123 4567",
    role: "seller",
    rating: 4.9,
    reviewCount: 45,
    joinDate: "2023-01-15",
    profilePicture: null
  },
  {
    id: 2,
    name: "Sarah Lim",
    email: "sarah@example.com",
    phone: "+65 8765 4321",
    role: "seller",
    rating: 4.8,
    reviewCount: 32,
    joinDate: "2023-03-22",
    profilePicture: null
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike@example.com",
    phone: "+65 9876 5432",
    role: "seller",
    rating: 4.7,
    reviewCount: 28,
    joinDate: "2023-02-10",
    profilePicture: null
  },
  {
    id: 4,
    name: "Alice Wang",
    email: "alice@example.com",
    phone: "+65 8123 9876",
    role: "buyer",
    rating: null,
    reviewCount: 0,
    joinDate: "2023-06-01",
    profilePicture: null
  }
];

export const mockOrders = [
  {
    id: 1001,
    userId: 4,
    items: [
      {
        phoneId: 1,
        quantity: 1,
        price: 899,
        sellerId: 1
      }
    ],
    totalAmount: 899,
    status: "completed",
    deliveryAddress: "123 Orchard Road, Singapore",
    contactNumber: "+65 8123 9876",
    createdAt: "2024-12-10T10:30:00Z"
  },
  {
    id: 1002,
    userId: 4,
    items: [
      {
        phoneId: 3,
        quantity: 1,
        price: 649,
        sellerId: 3
      }
    ],
    totalAmount: 649,
    status: "pending",
    deliveryAddress: "456 Marina Bay, Singapore",
    contactNumber: "+65 8123 9876",
    createdAt: "2024-12-12T14:20:00Z"
  }
];

export const phoneSpecs = {
  brands: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Sony', 'Nothing'],
  conditions: ['Excellent', 'Very Good', 'Good', 'Fair'],
  ramOptions: ['3GB', '4GB', '6GB', '8GB', '12GB', '16GB', '18GB'],
  storageOptions: ['64GB', '128GB', '256GB', '512GB', '1TB'],
  osOptions: ['iOS 17', 'iOS 16', 'Android 14', 'Android 13', 'OxygenOS 13', 'MIUI 14'],
  priceRanges: [
    { min: 0, max: 300, label: 'Under $300' },
    { min: 300, max: 600, label: '$300 - $600' },
    { min: 600, max: 900, label: '$600 - $900' },
    { min: 900, max: 1200, label: '$900 - $1200' },
    { min: 1200, max: 2000, label: 'Over $1200' }
  ]
};

export const mockCategories = [
  { id: 'flagship', name: 'Flagship Phones', icon: '📱' },
  { id: 'budget', name: 'Budget Phones', icon: '💰' },
  { id: 'gaming', name: 'Gaming Phones', icon: '🎮' },
  { id: 'camera', name: 'Camera Phones', icon: '📸' },
  { id: 'foldable', name: 'Foldable Phones', icon: '📲' }
];

// Utility functions for mock data
export const getMockPhoneById = (id) => {
  return mockPhones.find(phone => phone.id === parseInt(id));
};

export const getMockUserById = (id) => {
  return mockUsers.find(user => user.id === parseInt(id));
};

export const filterMockPhones = (filters) => {
  return mockPhones.filter(phone => {
    const matchesBrand = !filters.brand || filters.brand === 'all' || 
                        phone.brand.toLowerCase() === filters.brand.toLowerCase();
    const matchesCondition = !filters.condition || filters.condition === 'all' || 
                            phone.condition === filters.condition;
    const matchesPrice = (!filters.minPrice || phone.price >= filters.minPrice) &&
                        (!filters.maxPrice || phone.price <= filters.maxPrice);
    const matchesSearch = !filters.search || 
                         phone.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         phone.brand.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesBrand && matchesCondition && matchesPrice && matchesSearch;
  });
};

export const sortMockPhones = (phones, sortBy) => {
  const sorted = [...phones];
  
  switch (sortBy) {
    case 'price_low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.sort((a, b) => new Date(b.postedTime) - new Date(a.postedTime));
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'popular':
      return sorted.sort((a, b) => b.views - a.views);
    default:
      return sorted;
  }
};