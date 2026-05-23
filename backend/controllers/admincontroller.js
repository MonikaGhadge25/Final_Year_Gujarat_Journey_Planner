const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users
// Returns all users (admin only). Passwords are excluded.
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')          // never send passwords to frontend
      .sort({ _id: -1 });           // newest first (User model has no timestamps, _id contains creation order)

    res.json({ users, total: users.length });
  } catch (err) {
    console.error('getAllUsers error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/users/:id/role
// Changes the role of a user. Body: { role: 'hotel' | 'guide' | 'agent' | 'transport' | 'client' | 'admin' }
// ─────────────────────────────────────────────────────────────────────────────
exports.changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const allowedRoles = ['admin', 'agent', 'client', 'hotel', 'guide', 'transport'];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent admin from removing their own admin role
    if (user._id.toString() === req.user.id && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot change your own admin role.' });
    }

    const oldRole = user.role;
    user.role = role;

    // Reset profile_completed when role changes to hotel (they need to fill hotel profile)
    if (role === 'hotel' && oldRole !== 'hotel') {
      user.profile_completed = false;
      user.hotel_id = null;
    }

    // When changing away from hotel, clear hotel link
    if (oldRole === 'hotel' && role !== 'hotel') {
      user.profile_completed = true;
      user.hotel_id = null;
    }

    await user.save();

    res.json({
      message: `Role updated from "${oldRole}" to "${role}" successfully.`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('changeUserRole error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/users
// Admin creates a new user directly (bypasses normal registration flow).
// Body: { fullName, email, password, phone, gender, dob, role }
// ─────────────────────────────────────────────────────────────────────────────
exports.createUser = async (req, res) => {
  const { fullName, email, password, phone, gender, dob, role = 'client' } = req.body;

  if (!fullName || !email || !password || !gender || !dob) {
    return res.status(400).json({ message: 'fullName, email, password, gender, and dob are required.' });
  }

  const allowedRoles = ['admin', 'agent', 'client', 'hotel', 'guide', 'transport'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashed,
      phone: phone || '',
      gender,
      dob: new Date(dob),
      role,
      profile_completed: role !== 'hotel'
    });

    await newUser.save();

    res.status(201).json({
      message: `User "${fullName}" created successfully as ${role}.`,
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('createUser error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/users/:id
// Permanently deletes a user. Admin cannot delete themselves.
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: `User "${user.fullName}" deleted successfully.`,
      deletedId: id
    });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};