const express = require('express');
const router  = express.Router();

const adminController = require('../controllers/admincontroller');
const { verifyToken, restrictToRoles } = require('../middleware/authMiddleware');

// All admin routes require a valid JWT AND the user must have role = 'admin'
const adminOnly = [verifyToken, restrictToRoles('admin')];

// GET    /api/admin/users            – list all users
router.get('/users', adminOnly, adminController.getAllUsers);

// POST   /api/admin/users            – create a new user
router.post('/users', adminOnly, adminController.createUser);

// PATCH  /api/admin/users/:id/role   – change a user's role
router.patch('/users/:id/role', adminOnly, adminController.changeUserRole);

// DELETE /api/admin/users/:id        – delete a user
router.delete('/users/:id', adminOnly, adminController.deleteUser);

module.exports = router;