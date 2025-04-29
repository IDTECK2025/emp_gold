const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your EMPAIR Verification Code",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>EMPAIR Verification Code</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
          }
          .logo {
            max-width: 150px;
          }
          .otp-container {
            background-color: #f5f7fa;
            border-radius: 8px;
            padding: 25px;
            text-align: center;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 3px;
            color: #2c3e50;
            margin: 15px 0;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #7f8c8d;
            text-align: center;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://www.empair.com/logo.png" alt="EMPAIR Logo" class="logo">
          <h2>Welcome to EMPAIR</h2>
        </div>
        
        <p>Hello,</p>
        <p>Thank you for registering with EMPAIR. To complete your registration, please use the following One-Time Password (OTP):</p>
        
        <div class="otp-container">
          <p>Your verification code is:</p>
          <div class="otp-code">${otp}</div>
          <p>This code will expire in 10 minutes.</p>
        </div>
        
        <p>If you didn't request this code, please ignore this email or contact our support team immediately.</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} EMPAIR. All rights reserved.</p>
          <p>EMPAIR Technologies, 123 Business Avenue, Tech City, TC 10001</p>
          <p><a href="https://www.empair.com">www.empair.com</a> | <a href="mailto:support@empair.com">support@empair.com</a></p>
        </div>
      </body>
      </html>
      `,
      text: `Welcome to EMPAIR\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email or contact our support team immediately.\n\n© ${new Date().getFullYear()} EMPAIR Technologies`
    };
  
    await transporter.sendMail(mailOptions);
  };
  

const sendLoginPIN = async (email, pin) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to EMPAIR – Your Login PIN",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>EMPAIR Login PIN</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
        }
        .logo {
          max-width: 150px;
        }
        .pin-container {
          background-color: #e8f0fe;
          border-radius: 8px;
          padding: 25px;
          text-align: center;
          margin: 20px 0;
        }
        .pin-code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 3px;
          color: #2c3e50;
          margin: 15px 0;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #7f8c8d;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://www.empair.com/logo.png" alt="EMPAIR Logo" class="logo">
        <h2>Welcome to EMPAIR</h2>
      </div>
      
      <p>Hello,</p>
      <p>We're excited to have you on board! To log in to your EMPAIR account, please use the following 4-digit PIN:</p>
      
      <div class="pin-container">
        <p>Your login PIN is:</p>
        <div class="pin-code">${pin}</div>
        <p>This PIN is confidential. Do not share it with anyone.</p>
      </div>
      
      <p>If you didn’t request this, please ignore this email or contact our support team immediately.</p>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} EMPAIR. All rights reserved.</p>
        <p>EMPAIR Technologies, 123 Business Avenue, Tech City, TC 10001</p>
        <p><a href="https://www.empair.com">www.empair.com</a> | <a href="mailto:support@empair.com">support@empair.com</a></p>
      </div>
    </body>
    </html>
    `,
    text: `Welcome to EMPAIR\n\nYour login PIN is: ${pin}\n\nThis PIN is confidential. Do not share it with anyone.\n\nIf you didn’t request this, please ignore this email or contact support.\n\n© ${new Date().getFullYear()} EMPAIR Technologies`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTP, sendLoginPIN };
