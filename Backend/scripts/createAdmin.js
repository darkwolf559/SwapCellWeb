// scripts/createAdmin.js - Script to create the first admin user

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phone-marketplace', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Admin user details
    const adminData = {
      name: 'Swap Cell',
      email: 'swapcellstore@gmail.com', 
      password: 'Shaggy99', 
      role: 'admin',
      phone: '+94771234567', 
      isActive: true,
      adminPermissions: {
        canApproveListings: true,
        canManageUsers: true,
        canViewAnalytics: true
      }
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    adminData.password = hashedPassword;

    // Create admin user
    const adminUser = await User.create(adminData);

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password: Admin@123 (Please change this after first login)');
    console.log('🛡️ Role:', adminUser.role);
    console.log('✨ Permissions:', adminUser.adminPermissions);

    console.log('\n🚀 You can now log in to the admin dashboard with these credentials');
    console.log('⚠️  IMPORTANT: Change the default password after your first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the script
createAdminUser();

