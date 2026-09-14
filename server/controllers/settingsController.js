const Settings = require('../models/Settings');

// @route   GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/settings (Admin only)
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    const {
      libraryName, contactEmail, phone, address,
      maxBooksPerMember, borrowingDuration, finePerDay
    } = req.body;

    if (libraryName) settings.libraryName = libraryName.trim();
    if (contactEmail) settings.contactEmail = contactEmail.trim();
    if (phone) settings.phone = phone.trim();
    if (address) settings.address = address.trim();
    if (maxBooksPerMember !== undefined) settings.maxBooksPerMember = Number(maxBooksPerMember);
    if (borrowingDuration !== undefined) settings.borrowingDuration = Number(borrowingDuration);
    if (finePerDay !== undefined) settings.finePerDay = Number(finePerDay);

    await settings.save();

    res.json({
      success: true,
      data: settings,
      message: 'Library settings updated successfully'
    });
  } catch (err) {
    next(err);
  }
};
