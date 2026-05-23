const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportcontroller');
const { verifyToken, restrictToRoles } = require('../middleware/authMiddleware');

router.get('/', transportController.getTransports);
router.post('/add', verifyToken, restrictToRoles('transport'), transportController.addTransport);

module.exports = router;
