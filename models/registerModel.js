const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  otp: String,
  otpExpiresAt: Date,
  role: {
    type: String,
    enum: ['admin', 'agent', 'subagent'],
    required: true,
  },
  shareId: {
    type: String,
    default: 'EMP',
  },
  cusId: {
    type: String,
    default: 'EMPZZ',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  admissionFee: [{
    customerId: String,
    amount: Number,
    date: {
      type: Date,
      default: Date.now, // Sets the current date by default
    },
  }],
  paymentDetails: [{
    customerId: String,
    amount: Number,
    date: {
      type: Date,
      default: Date.now, // Sets the current date by default
    },
  }],
});

module.exports = mongoose.model('User', UserSchema);
