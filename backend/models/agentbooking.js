import express from "express";
import { getAgentBookings, getAgentBookingById, createAgentBooking } from "../controllers/agentbookingcontroller.js";

const router = express.Router();

router.get("/", getAgentBookings);           // all bookings
router.post("/", createAgentBooking);        // create booking
router.get("/:id", getAgentBookingById);     // booking by ID

export default router;
