const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    index: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    index: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Education', 'Other'],
    default: 'Technology',
    index: true
  },
  publisher: {
    type: String,
    default: 'Unknown'
  },
  publishedYear: {
    type: Number,
    required: [true, 'Published year is required']
  },
  language: {
    type: String,
    default: 'English'
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be greater than 0'],
    default: 100
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 5
  },
  availableCopies: {
    type: Number,
    required: true,
    min: [0, 'Available copies cannot be negative'],
    default: 5
  },
  coverUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

bookSchema.pre('validate', function(next) {
  if (this.availableCopies > this.quantity) {
    this.availableCopies = this.quantity;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
