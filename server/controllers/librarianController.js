const User = require('../models/User');

// @route   GET /api/librarians (Admin only)
exports.getLibrarians = async (req, res, next) => {
  try {
    const librarians = await User.find({ role: 'librarian' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: librarians
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/librarians (Admin only)
exports.createLibrarian = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password for the librarian'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const librarian = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'librarian',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      data: {
        id: librarian._id,
        name: librarian.name,
        email: librarian.email,
        role: librarian.role,
        status: librarian.status,
        createdAt: librarian.createdAt
      },
      message: 'Librarian account created successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/librarians/:id (Admin only)
exports.updateLibrarian = async (req, res, next) => {
  try {
    const librarian = await User.findOne({ _id: req.params.id, role: 'librarian' });
    if (!librarian) {
      return res.status(404).json({ success: false, message: 'Librarian not found' });
    }

    const { name, email, status } = req.body;

    if (email && email.toLowerCase().trim() !== librarian.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: librarian._id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email is already in use by another user' });
      }
      librarian.email = email.toLowerCase().trim();
    }

    if (name) librarian.name = name.trim();
    if (status && (status === 'active' || status === 'inactive')) {
      librarian.status = status;
    }

    await librarian.save();

    res.json({
      success: true,
      data: {
        id: librarian._id,
        name: librarian.name,
        email: librarian.email,
        role: librarian.role,
        status: librarian.status
      },
      message: 'Librarian updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/librarians/:id/status (Admin only)
exports.toggleLibrarianStatus = async (req, res, next) => {
  try {
    const librarian = await User.findOne({ _id: req.params.id, role: 'librarian' });
    if (!librarian) {
      return res.status(404).json({ success: false, message: 'Librarian not found' });
    }

    librarian.status = librarian.status === 'active' ? 'inactive' : 'active';
    await librarian.save();

    res.json({
      success: true,
      data: librarian,
      message: 'Librarian status set to ' + librarian.status
    });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/librarians/:id (Admin only)
exports.deleteLibrarian = async (req, res, next) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete their own currently logged-in account' });
    }

    const librarian = await User.findOne({ _id: req.params.id, role: 'librarian' });
    if (!librarian) {
      return res.status(404).json({ success: false, message: 'Librarian not found' });
    }

    await User.findByIdAndDelete(librarian._id);

    res.json({
      success: true,
      message: 'Librarian account deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/librarians/:id/reset-password (Admin only)
exports.resetLibrarianPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const librarian = await User.findOne({ _id: req.params.id, role: 'librarian' });
    if (!librarian) {
      return res.status(404).json({ success: false, message: 'Librarian not found' });
    }

    librarian.password = newPassword;
    await librarian.save();

    res.json({
      success: true,
      message: 'Password for ' + librarian.name + ' has been reset successfully'
    });
  } catch (err) {
    next(err);
  }
};
