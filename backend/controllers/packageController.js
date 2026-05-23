const Package = require('../models/Package');

// GET /api/packages  — return all active packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, packages });
  } catch (err) {
    console.error('getAllPackages error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/packages/:id — return one package
exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};