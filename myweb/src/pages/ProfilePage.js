import React, { useState } from 'react';
import { User, ShoppingCart, Plus, Edit, Star, Eye, TrendingUp, DollarSign , Smartphone } from 'lucide-react';
import PhoneCard from '../components/PhoneCard';
import { useAuth } from '../utils/AuthContext';
import { mockPhones } from '../utils/mockData';

const ProfilePage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    onNavigate('auth');
    return null;
  }

  const TabButton = ({ tab, icon: Icon, children }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
        activeTab === tab
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {children}
    </button>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <div className="flex items-center">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="h-10 w-10" />
          </div>
          <div className="ml-6">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-blue-100">{user.email}</p>
            <div className="flex items-center mt-2">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              {user.role === 'seller' && (
                <div className="flex items-center ml-4">
                  <Star className="h-4 w-4 fill-current mr-1" />
                  <span>4.8 Rating</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {user.role === 'seller' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600">Active Listings</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">24</div>
            <div className="text-sm text-gray-600">Total Sold</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">$12,450</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Eye className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">1,234</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">5</div>
            <div className="text-sm text-gray-600">Orders Placed</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">$2,150</div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
        </div>
      )}
    </div>
  );

  const ListingsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Listings</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add New Phone
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPhones.slice(0, 3).map((phone) => (
          <div key={phone.id} className="relative">
            <PhoneCard
              phone={phone}
              onViewDetails={(phone) => {
                onNavigate('details');
              }}
              showAnimation={false}
            />
            <button className="absolute top-3 right-12 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
              <Edit className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const OrdersTab = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {user.role === 'seller' ? 'Recent Sales' : 'Order History'}
      </h2>
      <div className="space-y-4">
        {[1, 2, 3].map((order) => (
          <div key={order} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Order #{1000 + order}</h3>
                <p className="text-gray-600">Placed on Dec {order + 10}, 2024</p>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Completed
              </span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={mockPhones[order - 1]?.image}
                    alt="Phone"
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">{mockPhones[order - 1]?.title}</h4>
                    <p className="text-gray-600">Quantity: 1</p>
                  </div>
                </div>
                <span className="font-semibold text-blue-600">${mockPhones[order - 1]?.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 bg-white rounded-xl shadow-sm p-2">
            <TabButton tab="overview" icon={User}>Overview</TabButton>
            {user.role === 'seller' && (
              <TabButton tab="listings" icon={Smartphone}>My Listings</TabButton>
            )}
            <TabButton tab="orders" icon={ShoppingCart}>
              {user.role === 'seller' ? 'Sales' : 'Orders'}
            </TabButton>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'listings' && user.role === 'seller' && <ListingsTab />}
          {activeTab === 'orders' && <OrdersTab />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;