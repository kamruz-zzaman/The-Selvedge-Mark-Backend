const Settings = require("../models/Settings");

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    const { category } = req.query;

    let query = {};
    if (category) {
      query.category = category;
    }

    const settings = await Settings.find(query);

    // Convert to key-value object
    const settingsObj = {};
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    res.status(200).json({
      success: true,
      data: settingsObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Update setting
// @route   PUT /api/settings/:key
// @access  Private/Admin
exports.updateSetting = async (req, res) => {
  try {
    const { value, category, description } = req.body;

    const setting = await Settings.findOneAndUpdate(
      { key: req.params.key },
      { value, category, description },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Bulk update settings
// @route   POST /api/settings/bulk
// @access  Private/Admin
exports.bulkUpdateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    const operations = Object.keys(settings).map((key) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value: settings[key] } },
        upsert: true,
      },
    }));

    await Settings.bulkWrite(operations);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
