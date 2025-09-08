import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, MapPin, User, Phone, Mail, CreditCard, Truck, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useCart } from '../utils/CartContext';
import { useAuth } from '../utils/AuthContext';
import { orderAPI, apiUtils } from '../utils/api';

// Sample data - replace with your actual data
const provinces = [
  'Western Province',
  'Central Province',
  'Southern Province',
  'Northern Province',
  'Eastern Province',
  'North Western Province',
  'North Central Province',
  'Uva Province',
  'Sabaragamuwa Province'
];

const districts = {
  'Western Province': ['Colombo', 'Gampaha', 'Kalutara'],
  'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern Province': ['Galle', 'Matara', 'Hambantota'],
  'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar','Mullaitivu','Vavuniya'],
  'Eastern Province': ['Trincomalee', 'Batticaloa', 'Ampara'],
  'North Western Province': ['Kurunegala', 'Puttalam'],
  'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
  'Uva Province': ['Badulla', 'Moneragala'],
  'Sabaragamuwa Province': ['Ratnapura', 'Kegalle']
};

const courierTypes = [
  { id: 'courier', name: 'Standard Courier', price: 1000, days: '3-5 business days' },
  { id: 'speed_post', name: 'Speed Post', price: 1500, days: '1-2 business days' }
];

const CheckoutPage = ({ onNavigate }) => {
  const { cart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    otherMobile: '',
    email: user?.email || '',
    province: '',
    district: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    courierType: 'courier'
  });

  const [formErrors, setFormErrors] = useState({});
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    if (!user) {
      onNavigate('auth');
      return;
    }
    if (cart.length === 0 && !success) {
      onNavigate('cart');
      return;
    }
  }, [user, cart, onNavigate, success]);

  const subtotal = getCartTotal();
  const selectedCourier = courierTypes.find(c => c.id === formData.courierType) || courierTypes[0];
  const shippingCost = selectedCourier.price;
  const total = subtotal + shippingCost;

  const validateStep1 = () => {
    const errors = apiUtils.validateCheckoutForm(formData);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = apiUtils.validatePaymentData(paymentData);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear district when province changes
    if (field === 'province') {
      setFormData(prev => ({
        ...prev,
        district: ''
      }));
    }
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePaymentInputChange = (field, value) => {
    let formattedValue = value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    }
    
    // Format expiry date
    if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
    }
    
    // Limit CVV to 4 digits
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setPaymentData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const simulatePayment = async () => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For sandbox testing - in production, integrate with real payment gateway
    return {
      success: true,
      transactionId: 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      message: 'Payment processed successfully'
    };
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Starting order placement...');

      // Process payment (sandbox simulation)
      console.log('Processing payment...');
      const paymentResult = await simulatePayment();
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.message || 'Payment failed');
      }


      // Generate unique order number
      const generatedOrderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Prepare order data
      const orderData = {
        orderNumber: generatedOrderNumber,
        items: cart.map(item => ({
          phoneId: item._id || item.id,
          quantity: item.quantity,
          price: item.price,
          sellerId: item.sellerId._id || item.sellerId
        })),
        deliveryAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          mobile: formData.mobile,
          otherMobile: formData.otherMobile,
          email: formData.email,
          province: formData.province,
          district: formData.district,
          city: formData.city,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2
        },
        courierType: formData.courierType,
        shippingCost,
        totalAmount: total,
        paymentDetails: {
          transactionId: paymentResult.transactionId,
          method: 'card',
          cardLast4: paymentData.cardNumber.replace(/\s/g, '').slice(-4),
          status: 'completed',
          gateway: 'sandbox'
        }
      };


      // Create order
      const response = await orderAPI.createOrder(orderData);
      

      // Handle different response formats
      let orderIdFromResponse;
      if (response.data) {
        // If response is wrapped in data property
        orderIdFromResponse = response.data.orderId || response.data._id || response.data.id;
      } else {
        // Direct response
        orderIdFromResponse = response.orderId || response._id || response.id;
      }

      console.log('Order ID from response:', orderIdFromResponse);

      if (!orderIdFromResponse) {
        console.warn('Order was created but no order ID was returned');
        // Still consider it successful if we got a response
        orderIdFromResponse = generatedOrderNumber; // Use order number as fallback
      }

      setOrderId(orderIdFromResponse);
      setOrderNumber(generatedOrderNumber);


      // Send confirmation email
      try {
        await orderAPI.sendConfirmation(orderIdFromResponse, formData.email);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the order if email fails
      }

      // Clear cart and show success
      await clearCart();
      console.log('Cart cleared, setting success state...');
      
      setSuccess(true);
      console.log('Success state set to true');

    } catch (err) {
      console.error('Order placement failed:', err);
      
      // More detailed error handling
      if (err.response) {
        console.error('Server error response:', err.response.data);
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        console.error('Network error:', err.request);
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-8 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Delivery Information
        </h2>
        <p className="text-gray-400">Please provide your delivery details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <User className="h-5 w-5 mr-2 text-cyan-400" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full bg-gray-800/50 border ${formErrors.firstName ? 'border-red-500' : 'border-gray-600'} rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors`}
                placeholder="John"
              />
              {formErrors.firstName && <p className="text-red-400 text-sm mt-1">{formErrors.firstName}</p>}
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full bg-gray-800/50 border ${formErrors.lastName ? 'border-red-500' : 'border-gray-600'} rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors`}
                placeholder="Doe"
              />
              {formErrors.lastName && <p className="text-red-400 text-sm mt-1">{formErrors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Mobile Number *</label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              className={`w-full bg-gray-800/50 border ${formErrors.mobile ? 'border-red-500' : 'border-gray-600'} rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors`}
              placeholder="+94 77 123 4567"
            />
            {formErrors.mobile && <p className="text-red-400 text-sm mt-1">{formErrors.mobile}</p>}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Other Mobile (Optional)</label>
            <input
              type="tel"
              value={formData.otherMobile}
              onChange={(e) => handleInputChange('otherMobile', e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="+94 71 123 4567"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full bg-gray-800/50 border ${formErrors.email ? 'border-red-500' : 'border-gray-600'} rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors`}
              placeholder="john.doe@example.com"
            />
            {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-cyan-400" />
            Delivery Address
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Province *</label>
              <select
                value={formData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
                className={`w-full bg-gray-800/50 border ${formErrors.province ? 'border-red-500' : 'border-gray-600'} rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors`}
              >
                <option value="">Select Province</option>
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              {formErrors.province && <p className="text-red-400 text-sm mt-1">{formErrors.province}</p>}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">District *</label>
              <select
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                className={`w-full bg-gray-800/50 border ${formErrors.district ? 'border-red-500' : 'border-gray-600'} rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors`}
                disabled={!formData.province}
              >
                <option value="">Select District</option>
                {formData.province && districts[formData.province]?.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              {formErrors.district && <p className="text-red-400 text-sm mt-1">{formErrors.district}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">City *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full bg-gray-800/50 border ${formErrors.city ? 'border-red-500' : 'border-gray-600'} rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors`}
              placeholder="Colombo"
            />
            {formErrors.city && <p className="text-red-400 text-sm mt-1">{formErrors.city}</p>}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Address Line 1 *</label>
            <input
              type="text"
              value={formData.addressLine1}
              onChange={(e) => handleInputChange('addressLine1', e.target.value)}
              className={`w-full bg-gray-800/50 border ${formErrors.addressLine1 ? 'border-red-500' : 'border-gray-600'} rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors`}
              placeholder="123 Main Street"
            />
            {formErrors.addressLine1 && <p className="text-red-400 text-sm mt-1">{formErrors.addressLine1}</p>}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={formData.addressLine2}
              onChange={(e) => handleInputChange('addressLine2', e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Apartment, floor, etc."
            />
          </div>

          {/* Courier Selection */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2 text-cyan-400" />
              Delivery Method
            </h4>
            <div className="space-y-3">
              {courierTypes.map(courier => (
                <div key={courier.id} className={`p-4 border rounded-xl cursor-pointer transition-all ${
                  formData.courierType === courier.id 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                }`}
                onClick={() => handleInputChange('courierType', courier.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="courierType"
                        value={courier.id}
                        checked={formData.courierType === courier.id}
                        onChange={() => handleInputChange('courierType', courier.id)}
                        className="text-purple-500 mr-3"
                      />
                      <div>
                        <h5 className="font-semibold text-white">{courier.name}</h5>
                        <p className="text-gray-400 text-sm">{courier.days}</p>
                      </div>
                    </div>
                    <span className="font-bold text-cyan-400">LKR {courier.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Payment Information
        </h2>
        <p className="text-gray-400">Enter your card details securely</p>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-6 border border-gray-600">
          <div className="flex items-center mb-4">
            <CreditCard className="h-6 w-6 text-cyan-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">Card Details</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Card Number *</label>
              <input
                type="text"
                value={paymentData.cardNumber}
                onChange={(e) => handlePaymentInputChange('cardNumber', e.target.value)}
                className={`w-full bg-gray-900/50 border ${formErrors.cardNumber ? 'border-red-500' : 'border-gray-600'} rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors font-mono`}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              {formErrors.cardNumber && <p className="text-red-400 text-sm mt-1">{formErrors.cardNumber}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Expiry Date *</label>
                <input
                  type="text"
                  value={paymentData.expiryDate}
                  onChange={(e) => handlePaymentInputChange('expiryDate', e.target.value)}
                  className={`w-full bg-gray-900/50 border ${formErrors.expiryDate ? 'border-red-500' : 'border-gray-600'} rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors font-mono`}
                  placeholder="MM/YY"
                  maxLength={5}
                />
                {formErrors.expiryDate && <p className="text-red-400 text-sm mt-1">{formErrors.expiryDate}</p>}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">CVV *</label>
                <input
                  type="password"
                  value={paymentData.cvv}
                  onChange={(e) => handlePaymentInputChange('cvv', e.target.value)}
                  className={`w-full bg-gray-900/50 border ${formErrors.cvv ? 'border-red-500' : 'border-gray-600'} rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors font-mono`}
                  placeholder="123"
                  maxLength={4}
                />
                {formErrors.cvv && <p className="text-red-400 text-sm mt-1">{formErrors.cvv}</p>}
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Cardholder Name *</label>
              <input
                type="text"
                value={paymentData.cardholderName}
                onChange={(e) => handlePaymentInputChange('cardholderName', e.target.value.toUpperCase())}
                className={`w-full bg-gray-900/50 border ${formErrors.cardholderName ? 'border-red-500' : 'border-gray-600'} rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors`}
                placeholder="JOHN DOE"
              />
              {formErrors.cardholderName && <p className="text-red-400 text-sm mt-1">{formErrors.cardholderName}</p>}
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center text-green-400 mb-2">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Secure Payment</span>
          </div>
          <p className="text-green-300 text-sm">
            Your payment information is encrypted and secure. This is a sandbox environment for testing.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Order Confirmation
        </h2>
        <p className="text-gray-400">Review your order before placing</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Delivery Address */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-cyan-400" />
            Delivery Address
          </h3>
          <div className="text-gray-300 space-y-1">
            <p className="font-medium">{formData.firstName} {formData.lastName}</p>
            <p>{formData.addressLine1}</p>
            {formData.addressLine2 && <p>{formData.addressLine2}</p>}
            <p>{formData.city}, {formData.district}</p>
            <p>{formData.province}</p>
            <p className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              {formData.mobile}
            </p>
            <p className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              {formData.email}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Order Items</h3>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item._id || item.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                <div className="flex items-center">
                  <img
                    src={item.image || item.images?.[0] || '/api/placeholder/64/64'}
                    alt={item.title}
                    className="w-12 h-12 object-cover rounded-lg mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-cyan-400">
                  LKR {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Subtotal</span>
              <span className="text-white">LKR {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Shipping ({selectedCourier.name})</span>
              <span className="text-white">LKR {shippingCost.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-600 pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Total</span>
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  LKR {total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-cyan-400" />
            Payment Method
          </h3>
          <div className="flex items-center text-gray-300">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded p-2 mr-3">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium">Card ending in {paymentData.cardNumber.replace(/\s/g, '').slice(-4)}</p>
              <p className="text-sm text-gray-400">{paymentData.cardholderName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccessPage = () => (
    <div className="text-center space-y-8 animate-slide-up">
      <div className="relative">
        <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-green-400/20 to-green-500/20 rounded-full mx-auto animate-ping"></div>
      </div>
      
      <div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent mb-4">
          Order Placed Successfully!
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Thank you for your purchase. A confirmation email has been sent to {formData.email}
        </p>
        {orderNumber && (
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 max-w-md mx-auto mb-8">
            <p className="text-gray-300 text-sm">Order Number:</p>
            <p className="text-white font-mono text-lg font-bold">{orderNumber}</p>
          </div>
        )}
      </div>

      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-white mb-4">What happens next?</h3>
        <div className="space-y-3 text-left">
          <div className="flex items-center text-gray-300">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
            <span className="text-sm">You'll receive an order confirmation email</span>
          </div>
          <div className="flex items-center text-gray-300">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
            <span className="text-sm">Sellers will contact you within 24 hours</span>
          </div>
          <div className="flex items-center text-gray-300">
            <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
            <span className="text-sm">Your items will be dispatched via {selectedCourier.name}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
            <span className="text-sm">Expected delivery: {selectedCourier.days}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => onNavigate('profile')}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
        >
          View Order History
        </button>
        <button
          onClick={() => onNavigate('phones')}
          className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-medium transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  // Debug logging
  console.log('CheckoutPage render - Current state:', {
    success,
    currentStep,
    loading,
    cart: cart.length,
    orderNumber
  });

  // Early return for success page
  if (success) {
    console.log('Rendering success page');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderSuccessPage()}
        </div>
      </div>
    );
  }

  console.log('Rendering checkout form');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-24 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight mb-4">
            Checkout
          </h1>
          
          {/* Progress Steps */}
          <div className="flex justify-center items-center space-x-8 mt-8">
            {[
              { step: 1, title: 'Delivery', icon: MapPin },
              { step: 2, title: 'Payment', icon: CreditCard },
              { step: 3, title: 'Confirm', icon: CheckCircle }
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 border-transparent text-white' 
                    : 'border-gray-600 text-gray-400'
                }`}>
                  <Icon className="h-5 w-5" />
                  {currentStep > step && (
                    <div className="absolute inset-0 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <span className={`ml-3 font-medium ${
                  currentStep >= step ? 'text-white' : 'text-gray-400'
                }`}>
                  {title}
                </span>
                {step < 3 && (
                  <div className={`w-16 h-0.5 ml-6 ${
                    currentStep > step ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-900/20 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-400 mr-3" />
              <div className="flex-1">
                <h3 className="text-red-300 font-semibold">Error</h3>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-2xl p-8 border border-purple-500/20 text-center">
              <Loader className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Processing Your Order</h3>
              <p className="text-gray-400">Please don't close this window...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-purple-500/20">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={currentStep === 1 ? () => onNavigate('cart') : handleBack}
            disabled={loading}
            className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {currentStep === 1 ? 'Back to Cart' : 'Previous'}
          </button>

          <button
            onClick={currentStep === 3 ? handlePlaceOrder : handleNext}
            disabled={loading}
            className="flex items-center bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : currentStep === 3 ? (
              <>
                Place Order
                <CheckCircle className="h-5 w-5 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
        </div>

        {/* Order Summary Sidebar (for steps 1 & 2) */}
        {currentStep < 3 && (
          <div className="mt-8 bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Items ({cart.length})</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span>LKR {shippingCost.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-white">Total</span>
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    LKR {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;