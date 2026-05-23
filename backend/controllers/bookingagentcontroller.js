const Agent = require('../models/AgentModel');

exports.searchAgents = async (req, res) => {
  try {
    const {
      location, language, gender, experience, rating,
      page = 1, limit = 8
    } = req.query;

    const filter = {};

    if (location) {
      filter.$or = [
        { district: new RegExp(location, 'i') },
        { city: new RegExp(location, 'i') },
        { location: new RegExp(location, 'i') }
      ];
    }

    if (language) {
      filter.$or = [
        { language: new RegExp(language, 'i') },
        { languages: new RegExp(language, 'i') }
      ];
    }

    if (gender) {
      filter.gender = new RegExp(gender, 'i');
    }

    if (experience) {
      filter.experience = { $gte: parseInt(experience) };
    }

    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Agent.countDocuments(filter);
    const agents = await Agent.find(filter).skip(skip).limit(parseInt(limit)).lean();

    res.json({
      agents,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
