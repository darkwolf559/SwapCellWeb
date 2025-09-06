require('dotenv').config();
const nodemailer = require('nodemailer');
const { sendOrderConfirmation } = require('../Backend/controllers/orderController'); // adjust path
const Order = require('../Backend/models/Order'); // adjust path

// Mock data
const mockOrderId = '68bc8b473b230c7f536bfa05'; // Replace with a valid ObjectId in your DB
const mockEmail = 'getuser444@gmail.com';

// Mock request and response
const req = {
  body: {
    orderId: mockOrderId,
    email: mockEmail
  },
  user: {
    userId: '68b806605b279aadb2bb4c1b', // Replace with a valid userId
  }
};

const res = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log('Response:', data);
    return data;
  }
};

// Run the test
(async () => {
  try {
    console.log('Sending test order confirmation email...');
    await sendOrderConfirmation(req, res);
    console.log('Test finished.');
  } catch (err) {
    console.error('Test error:', err);
  }
})();
