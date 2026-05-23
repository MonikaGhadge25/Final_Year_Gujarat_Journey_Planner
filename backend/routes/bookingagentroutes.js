const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Booking agents route is not implemented yet."
  });
});

module.exports = router;
