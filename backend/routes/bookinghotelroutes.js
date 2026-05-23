// const express = require("express");
// const { getHotels } = require("../controllers/bookinghotelcontroller.js");

// const router = express.Router();

// router.get("/", getHotels);

// module.exports = router;


const express = require("express");
const { getHotels } = require("../controllers/bookinghotelcontroller.js");

const router = express.Router();

router.get("/", getHotels);

module.exports = router;
