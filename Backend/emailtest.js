require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing email configuration...\n');

// Environment check
console.log('Environment variables:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '[HIDDEN]' : 'NOT SET');

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('\nError: Email credentials not configured!');
  console.log('Please add these to your .env file:');
  console.log('SMTP_USER=your.email@gmail.com');
  console.log('SMTP_PASS=your_app_password_here');
  process.exit(1);
}

// Create transporter - CORRECTED: use createTransport, not createTransporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test function
async function testEmail() {
  try {
    console.log('\n1. Verifying transporter...');
    await transporter.verify();
    console.log('✅ Transporter verified successfully');

    console.log('\n2. Sending test email...');
    const result = await transporter.sendMail({
      from: `"Phone Marketplace Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Email Configuration Test - Success!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #28a745;">✅ Email Test Successful!</h2>
          <p>Your email configuration is working correctly.</p>
          <ul>
            <li><strong>Host:</strong> ${process.env.SMTP_HOST}</li>
            <li><strong>Port:</strong> ${process.env.SMTP_PORT}</li>
            <li><strong>User:</strong> ${process.env.SMTP_USER}</li>
            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>You can now proceed with testing your order confirmation emails.</p>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Check your email inbox for the test message.');
    
    return true;
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔑 Authentication failed. This usually means:');
      console.error('1. You\'re using your regular Gmail password instead of an App Password');
      console.error('2. 2-Factor Authentication is not enabled on your Google account');
      console.error('3. The App Password is incorrect');
      console.error('\nSolution: Go to Google Account > Security > App Passwords and generate a new one');
    }
    
    return false;
  }
}

// Run test
testEmail().then(success => {
  console.log('\n' + '='.repeat(50));
  console.log(success ? '🎉 Email system is working!' : '❌ Email system needs fixing');
  process.exit(success ? 0 : 1);
});