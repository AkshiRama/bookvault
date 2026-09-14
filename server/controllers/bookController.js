const Book = require('../models/Book');
const Borrowing = require('../models/Borrowing');

// @route   GET /api/books
exports.getBooks = async (req, res, next) => {
  try {
    const { search, category, availability, publishedYear, sort, page = 1, limit = 10 } = req.query;

    const query = {};

    // Live search by Title, Author, or ISBN
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { isbn: searchRegex }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Availability filter
    if (availability === 'available') {
      query.availableCopies = { $gt: 0 };
    } else if (availability === 'unavailable') {
      query.availableCopies = 0;
    }

    // Published Year filter
    if (publishedYear) {
      query.publishedYear = Number(publishedYear);
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort) {
      switch (sort) {
        case 'title_asc': sortOption = { title: 1 }; break;
        case 'title_desc': sortOption = { title: -1 }; break;
        case 'author_asc': sortOption = { author: 1 }; break;
        case 'author_desc': sortOption = { author: -1 }; break;
        case 'copies_desc': sortOption = { availableCopies: -1 }; break;
        case 'copies_asc': sortOption = { availableCopies: 1 }; break;
        case 'year_desc': sortOption = { publishedYear: -1 }; break;
        case 'year_asc': sortOption = { publishedYear: 1 }; break;
        default: sortOption = { createdAt: -1 }; break;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.json({
      success: true,
      data: {
        books,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/books/:id
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // If staff, also get recent borrowing history for this book
    let borrowings = [];
    if (req.user && (req.user.role === 'admin' || req.user.role === 'librarian')) {
      borrowings = await Borrowing.find({ book: book._id })
        .populate('member', 'name email membershipId')
        .sort({ issueDate: -1 })
        .limit(10);
    }

    res.json({
      success: true,
      data: {
        book,
        borrowings
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/books
exports.createBook = async (req, res, next) => {
  try {
    const {
      title, author, isbn, description, category, publisher,
      publishedYear, language, pages, quantity, coverUrl
    } = req.body;

    if (!title || !author || !isbn || !publishedYear || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, author, isbn, publishedYear, quantity'
      });
    }

    const existingBook = await Book.findOne({ isbn: isbn.trim() });
    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: 'A book with this ISBN already exists'
      });
    }

    const qty = parseInt(quantity, 10) || 1;
    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      description: description || '',
      category: category || 'Technology',
      publisher: publisher || 'Unknown',
      publishedYear: parseInt(publishedYear, 10),
      language: language || 'English',
      pages: parseInt(pages, 10) || 100,
      quantity: qty,
      availableCopies: qty,
      coverUrl: coverUrl || ''
    });

    res.status(201).json({
      success: true,
      data: book,
      message: 'Book added successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/books/:id
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const {
      title, author, isbn, description, category, publisher,
      publishedYear, language, pages, quantity, coverUrl
    } = req.body;

    // Check ISBN uniqueness if changed
    if (isbn && isbn.trim() !== book.isbn) {
      const existing = await Book.findOne({ isbn: isbn.trim(), _id: { $ne: book._id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'ISBN already in use by another book' });
      }
      book.isbn = isbn.trim();
    }

    if (title) book.title = title.trim();
    if (author) book.author = author.trim();
    if (description !== undefined) book.description = description;
    if (category) book.category = category;
    if (publisher) book.publisher = publisher;
    if (publishedYear) book.publishedYear = parseInt(publishedYear, 10);
    if (language) book.language = language;
    if (pages) book.pages = parseInt(pages, 10);
    if (coverUrl !== undefined) book.coverUrl = coverUrl;

    // Quantity adjustment: maintain consistency with issued copies
    if (quantity !== undefined) {
      const newQty = parseInt(quantity, 10);
      const currentlyIssued = book.quantity - book.availableCopies;
      
      if (newQty < currentlyIssued) {
        return res.status(400).json({
          success: false,
          message: 'Cannot reduce total quantity to ' + newQty + ' because ' + currentlyIssued + ' copies are currently issued to members'
        });
      }

      book.quantity = newQty;
      book.availableCopies = newQty - currentlyIssued;
    }

    await book.save();

    res.json({
      success: true,
      data: book,
      message: 'Book updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/books/:id
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Safety check: check for active or overdue borrowings
    const activeBorrowings = await Borrowing.countDocuments({
      book: book._id,
      status: { $in: ['Issued', 'Overdue'] }
    });

    if (activeBorrowings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book: ' + activeBorrowings + ' copy/copies are currently issued or overdue. Return all copies first.'
      });
    }

    await Book.findByIdAndDelete(book._id);

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
