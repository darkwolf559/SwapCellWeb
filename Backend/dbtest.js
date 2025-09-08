require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Database connection test with correct options
const testDatabaseConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('Node environment:', process.env.NODE_ENV || 'development');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    // Connect to MongoDB with modern connection options
    await mongoose.connect(process.env.MONGODB_URI, {
      // Remove deprecated options that cause errors
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000
    });

    console.log('✅ MongoDB connected successfully');
    
    // Test connection by running a simple query
    const connectionState = mongoose.connection.readyState;
    console.log('Connection state:', connectionState === 1 ? 'Connected' : 'Not Connected');
    console.log('Database name:', mongoose.connection.db.databaseName);
    
    // Test if we can perform basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Connection closed');
    }
  }
};

// Email configuration test with proper nodemailer usage
const testEmailConfiguration = async () => {
  try {
    console.log('\n📧 Testing email configuration...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
    console.log('SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Email credentials not configured');
    }

    // Create transporter with correct syntax
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter
    console.log('🔍 Verifying email transporter...');
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
    
    // Send test email to the sender's email
    console.log('📤 Sending test email...');
    const testResult = await transporter.sendMail({
      from: `"Phone Marketplace Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to self for testing
      subject: 'Test Email Configuration - Phone Marketplace',
      text: 'This is a test email to verify the email configuration is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">✅ Email Test Successful</h1>
            <p style="margin: 10px 0 0 0;">Your email configuration is working correctly!</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Configuration Details:</h2>
            <ul style="color: #666;">
              <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</li>
              <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</li>
              <li><strong>SMTP User:</strong> ${process.env.SMTP_USER}</li>
              <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p style="color: #666; margin-top: 20px;">
              This test confirms that your Phone Marketplace application can successfully send emails 
              for order confirmations and other notifications.
            </p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', testResult.messageId);
    console.log('Response:', testResult.response);
    
    return true;
  } catch (error) {
    console.error('❌ Email configuration test failed:', error.message);
    
    // Provide specific error guidance
    if (error.code === 'EAUTH') {
      console.error('\n🔑 Authentication Error - Possible solutions:');
      console.error('1. If using Gmail, ensure you\'re using an App Password, not your regular password');
      console.error('2. Enable 2-Factor Authentication first, then generate App Password');
      console.error('3. Check that SMTP_USER and SMTP_PASS are correct in .env file');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('\n🌐 Connection Error - Possible solutions:');
      console.error('1. Check your internet connection');
      console.error('2. Verify SMTP_HOST and SMTP_PORT are correct');
      console.error('3. Check if firewall is blocking the connection');
    }
    
    return false;
  }
};

// Simplified order confirmation test without database dependencies
const testOrderEmailTemplate = async () => {
  try {
    console.log('\n📧 Testing order confirmation email template...');
    
    // Create mock order data
    const mockOrder = {
      orderNumber: 'TEST-' + Date.now(),
      totalAmount: 50000,
      shippingCost: 350,
      courierType: 'courier',
      createdAt: new Date(),
      deliveryAddress: {
        firstName: 'John',
        lastName: 'Doe',
        mobile: '+94771234567',
        email: process.env.SMTP_USER, // Use your email for testing
        province: 'Western Province',
        district: 'Colombo',
        city: 'Colombo',
        addressLine1: '123 Test Street',
        addressLine2: 'Test Area'
      },
      items: [{
        phoneId: {
          title: 'iPhone 14 Pro',
          brand: 'Apple',
          images: [],
          price: 45000
        },
        quantity: 1,
        price: 45000
      }]
    };

    // Generate email HTML
    const emailHTML = generateOrderConfirmationEmail(mockOrder);

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Send order confirmation email
    const result = await transporter.sendMail({
      from: `"Phone Marketplace" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: `Order Confirmation Test - ${mockOrder.orderNumber}`,
      html: emailHTML
    });

    console.log('✅ Order confirmation email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Check your email for the order confirmation test message.');

    return true;
  } catch (error) {
    console.error('❌ Order email test failed:', error.message);
    return false;
  }
};

// Enhanced email template
const generateOrderConfirmationEmail = (order) => {
  const courierNames = {
    'courier': 'Standard Courier',
    'speed_post': 'Speed Post'
  };

  const courierName = courierNames[order.courierType] || 'Standard Courier';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background-color: #f5f5f5; 
                line-height: 1.6;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 28px; 
            }
            .test-badge {
                background: #ff9800;
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                font-weight: bold;
                display: inline-block;
                margin-bottom: 10px;
            }
            .content { 
                padding: 30px 20px; 
            }
            .order-info { 
                background: #f8f9fa; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0; 
            }
            .order-info h2 { 
                margin-top: 0; 
                color: #333; 
            }
            .address-section { 
                background: #e3f2fd; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0; 
            }
            .address-section h3 { 
                margin-top: 0; 
                color: #1976d2; 
            }
            .items-list { 
                margin: 20px 0; 
            }
            .item { 
                display: flex; 
                align-items: center; 
                padding: 15px 0; 
                border-bottom: 1px solid #eee; 
            }
            .item:last-child { 
                border-bottom: none; 
            }
            .item-placeholder {
                width: 60px; 
                height: 60px; 
                background: #f0f0f0; 
                border-radius: 8px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: #999; 
                font-size: 12px;
                margin-right: 15px;
            }
            .item-details { 
                flex: 1; 
            }
            .item-title { 
                font-weight: bold; 
                color: #333; 
                margin-bottom: 5px; 
            }
            .item-price { 
                color: #667eea; 
                font-weight: bold; 
            }
            .total-section { 
                background: #e8f5e8; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0; 
                text-align: center; 
            }
            .total-amount { 
                font-size: 24px; 
                font-weight: bold; 
                color: #2e7d32; 
            }
            .footer { 
                background: #f8f9fa; 
                padding: 20px; 
                text-align: center; 
                color: #666; 
            }
            .summary-row {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                color: #555;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="test-badge">TEST EMAIL</div>
                <h1>Order Confirmation</h1>
                <p>Thank you for your purchase!</p>
            </div>
            
            <div class="content">
                <div class="order-info">
                    <h2>Order Details</h2>
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p><strong>Status:</strong> <span style="color: #2e7d32; font-weight: bold;">Confirmed</span></p>
                    <p><strong>Delivery Method:</strong> ${courierName}</p>
                </div>

                <div class="address-section">
                    <h3>Delivery Address</h3>
                    <p><strong>${order.deliveryAddress.firstName} ${order.deliveryAddress.lastName}</strong></p>
                    <p>${order.deliveryAddress.addressLine1}</p>
                    ${order.deliveryAddress.addressLine2 ? `<p>${order.deliveryAddress.addressLine2}</p>` : ''}
                    <p>${order.deliveryAddress.city}, ${order.deliveryAddress.district}</p>
                    <p>${order.deliveryAddress.province}</p>
                    <p><strong>Phone:</strong> ${order.deliveryAddress.mobile}</p>
                    <p><strong>Email:</strong> ${order.deliveryAddress.email}</p>
                </div>

                <div class="items-list">
                    <h3>Items Ordered</h3>
                    ${order.items.map(item => `
                        <div class="item">
                            <div class="item-placeholder">
                                IMG
                            </div>
                            <div class="item-details">
                                <div class="item-title">${item.phoneId.title}</div>
                                <div>Brand: ${item.phoneId.brand}</div>
                                <div>Quantity: ${item.quantity}</div>
                            </div>
                            <div class="item-price">
                                LKR ${(item.price * item.quantity).toLocaleString()}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="total-section">
                    <h3>Order Summary</h3>
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>LKR ${(order.totalAmount - order.shippingCost).toLocaleString()}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping (${courierName}):</span>
                        <span>LKR ${order.shippingCost.toLocaleString()}</span>
                    </div>
                    <hr style="margin: 15px 0;">
                    <div class="total-amount">
                        Total: LKR ${order.totalAmount.toLocaleString()}
                    </div>
                </div>
            </div>

            <div class="footer">
                <p><strong>Thank you for choosing Phone Marketplace!</strong></p>
                <p>This is a test email to verify your email configuration is working.</p>
                <p style="font-size: 12px; color: #999;">
                    Test sent at: ${new Date().toLocaleString()}
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Environment validation
const validateEnvironmentVariables = () => {
  console.log('🔍 Validating environment variables...\n');
  
  const required = [
    'MONGODB_URI',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS'
  ];
  
  const missing = [];
  const present = [];
  
  required.forEach(variable => {
    if (process.env[variable]) {
      present.push(variable);
    } else {
      missing.push(variable);
    }
  });
  
  console.log('✅ Present variables:', present.join(', '));
  
  if (missing.length > 0) {
    console.log('❌ Missing variables:', missing.join(', '));
    return false;
  }
  
  console.log('✅ All required environment variables are present\n');
  return true;
};

// Run comprehensive test
const runComprehensiveTest = async () => {
  console.log('🚀 Starting comprehensive system test...\n');
  
  // Step 1: Validate environment
  if (!validateEnvironmentVariables()) {
    process.exit(1);
  }
  
  // Step 2: Test database connection
  console.log('=' .repeat(50));
  const dbSuccess = await testDatabaseConnection();
  
  // Step 3: Test email configuration
  console.log('\n' + '='.repeat(50));
  const emailSuccess = await testEmailConfiguration();
  
  // Step 4: Test order email template
  if (emailSuccess) {
    console.log('\n' + '='.repeat(50));
    await testOrderEmailTemplate();
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Final Test Results:');
  console.log('Database Connection:', dbSuccess ? '✅ WORKING' : '❌ FAILED');
  console.log('Email Configuration:', emailSuccess ? '✅ WORKING' : '❌ FAILED');
  
  if (dbSuccess && emailSuccess) {
    console.log('\n🎉 All systems are working correctly!');
    console.log('Your Phone Marketplace email functionality should work properly now.');
  } else {
    console.log('\n⚠️ Some systems need attention. Check the errors above.');
  }
  
  process.exit(dbSuccess && emailSuccess ? 0 : 1);
};

// Export functions for reuse
module.exports = {
  testDatabaseConnection,
  testEmailConfiguration,
  testOrderEmailTemplate,
  generateOrderConfirmationEmail
};

// Run test if this file is executed directly
if (require.main === module) {
  runComprehensiveTest();
}