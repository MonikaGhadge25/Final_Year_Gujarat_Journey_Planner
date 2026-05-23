const Agent = require('../models/Agent');

// GET: Search Agents with Pagination and Dummy Images
exports.searchAgents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    // Optional filters (currently not used in frontend)
    const filters = {};
    if (req.query.district) filters.district = new RegExp(req.query.district, 'i');
    if (req.query.language) filters.language = new RegExp(req.query.language, 'i');
    if (req.query.specialties) filters.specialties = new RegExp(req.query.specialties, 'i');

    // ✅ Consistent sort order (prevents duplicates across pages)
    const agents = await Agent.find(filters)
      .sort({ rating: -1, createdAt: -1, _id: 1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Agent.countDocuments(filters);
    const totalPages = Math.ceil(totalCount / limit);

    const agentsWithImageUrls = agents.map(agent => {
      const getDummyAvatar = (gender) => {
        return gender?.toLowerCase() === 'female'
          ? 'https://randomuser.me/api/portraits/women/32.jpg'
          : 'https://randomuser.me/api/portraits/men/10.jpg';
      };

      return {
        _id: agent._id,
        name: agent.name,
        district: agent.district,
        language: agent.language,
        experience: agent.experience,
        age: agent.age,
        gender: agent.gender,
        rating: agent.rating,
        mobile_no: agent.mobile_no,
        contact: agent.contact,
        fees: agent.fees,
        specialties: agent.specialties,
        bio: agent.bio,
        imageUrl: getDummyAvatar(agent.gender),
      };
    });

    res.json({
      agents: agentsWithImageUrls,
      totalPages,
      currentPage: page,
      totalCount,
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Server error while fetching agents' });
  }
};

// GET: All Agents (With base64 image if present in DB)
exports.getAgents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const agents = await Agent.find()
      .sort({ rating: -1, createdAt: -1, _id: 1 }) // ✅ Apply same sort here
      .skip(skip)
      .limit(limit);

    const totalCount = await Agent.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const agentsWithImageUrls = agents.map(agent => {
      let imageUrl = null;

      if (agent.image) {
        const buffer = Buffer.isBuffer(agent.image) ? agent.image : agent.image?.buffer;
        if (buffer) {
          const base64 = buffer.toString('base64');
          imageUrl = `data:image/jpeg;base64,${base64}`;
        }
      }

      return {
        _id: agent._id,
        name: agent.name,
        district: agent.district,
        language: agent.language,
        experience: agent.experience,
        age: agent.age,
        gender: agent.gender,
        rating: agent.rating,
        mobile_no: agent.mobile_no,
        contact: agent.contact,
        fees: agent.fees,
        specialties: agent.specialties,
        bio: agent.bio,
        imageUrl: imageUrl || null,
      };
    });

    res.json({
      agents: agentsWithImageUrls,
      totalPages,
      currentPage: page,
      totalCount,
    });

  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ error: 'Server error while fetching agents' });
  }
};

// POST: Add New Agent
exports.addAgent = async (req, res) => {
  try {
    const newAgent = new Agent(req.body);
    await newAgent.save();
    res.status(201).json(newAgent);
  } catch (err) {
    console.error('Error adding agent:', err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    res.status(400).json({ error: err.message });
  }
};
