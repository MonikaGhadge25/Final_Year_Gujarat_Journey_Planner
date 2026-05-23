const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentcontroller');
const { verifyToken, restrictToRoles } = require('../middleware/authMiddleware');

// Get all agents
router.get('/', agentController.getAgents);

// Search agents
router.get('/search', agentController.searchAgents);

// Add new agent (protected route)
router.post('/add', verifyToken, restrictToRoles('guide'), agentController.addAgent);

module.exports = router;
