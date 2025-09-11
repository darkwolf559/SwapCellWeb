const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configure nodemailer with your SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp.gmail.com
  port: process.env.SMTP_PORT, // 587
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Your Gmail address
    pass: process.env.SMTP_PASS  // Your Gmail App Password
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request password reset (send verification code)
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

    // Save verification code to user
    user.passwordResetCode = verificationCode;
    user.passwordResetExpires = expiresAt;
    await user.save();

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Password Reset - SwapCell</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .content {
            padding: 40px 30px;
          }
          .verification-code {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            letter-spacing: 4px;
            margin: 30px 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">SwapCell - Mobile Marketplace</p>
          </div>
          
          <div class="content">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>You requested to reset your password for your SwapCell account. Use the verification code below to proceed with resetting your password:</p>
            
            <div class="verification-code">
              ${verificationCode}
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>This code expires in <strong>10 minutes</strong></li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Never share this code with anyone</li>
              </ul>
            </div>
            
            <p>If you're having trouble, please contact our support team.</p>
            
            <p style="margin-bottom: 0;">Best regards,<br><strong>SwapCell Team</strong></p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">This email was sent to ${email}</p>
            <p style="margin: 5px 0 0 0;">© 2024 SwapCell. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: {
        name: 'SwapCell',
        address: process.env.SMTP_USER
      },
      to: email,
      subject: 'Password Reset Verification Code - SwapCell',
      html: emailHtml,
      text: `Hi ${user.name},\n\nYour password reset verification code is: ${verificationCode}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nSwapCell Team`
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      message: 'Verification code sent to your email',
      email: email.replace(/(.{2}).*@/, '$1***@') // Mask email for privacy
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Failed to send verification code. Please try again.' });
  }
};

// Verify code and reset password
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find user with valid reset code
    const user = await User.findOne({
      email,
      passwordResetCode: code,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✅ Password Changed Successfully</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">SwapCell Account Security</p>
          </div>
          <div class="content">
            <div class="success-icon">🔒</div>
            <h2 style="color: #333; text-align: center;">Password Reset Complete!</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Your SwapCell account password has been successfully changed. You can now log in with your new password.</p>
            <p><strong>Security Tips:</strong></p>
            <ul>
              <li>Keep your password secure and don't share it with anyone</li>
              <li>Use a unique password for your SwapCell account</li>
              <li>If you notice any suspicious activity, contact support immediately</li>
            </ul>
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <p>Best regards,<br><strong>SwapCell Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: {
        name: 'SwapCell',
        address: process.env.SMTP_USER
      },
      to: email,
      subject: 'Password Changed Successfully - SwapCell',
      html: confirmationHtml
    });

    res.json({ 
      message: 'Password reset successful. You can now log in with your new password.',
      success: true
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword
};