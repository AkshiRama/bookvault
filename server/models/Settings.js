const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  libraryName: {
    type: String,
    default: 'BookVault Central Library'
  },
  contactEmail: {
    type: String,
    default: 'contact@bookvault.com'
  },
  phone: {
    type: String,
    default: '+1 (555) 019-2834'
  },
  address: {
    type: String,
    default: '452 Innovation Blvd, Tech Park, Suite 300'
  },
  maxBooksPerMember: {
    type: Number,
    default: 5,
    min: 1
  },
  borrowingDuration: {
    type: Number,
    default: 14, // in days
    min: 1
  },
  finePerDay: {
    type: Number,
    default: 10, // in currency units (₹)
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
