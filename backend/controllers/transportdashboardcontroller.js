/**
 * transportdashboardcontroller.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Platform-wide transport dashboard — no per-manager scoping needed because
 * there is only one shared transport account (role:'transport').
 *
 * Static vehicle-type catalogue mirrors transport.html exactly (8 types).
 * Booking queries match any booking that has a transport sub-document.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BookingFormsData = require('../models/bookingformsdataModel');
const ProfileBooking   = require('../models/profileBooking');
const User             = require('../models/User');

// ─── Static vehicle catalogue (mirrors transport.html exactly) ───────────────
const VEHICLE_TYPES = [
  { type:'3-Seater',  seats:3,  fuel:'CNG',    ac:false, pricePerKm:10, minFare:50,  category:'Budget',  extras:'Compact Ride',                  emoji:'🛺' },
  { type:'4-Seater',  seats:4,  fuel:'Petrol', ac:true,  pricePerKm:15, minFare:100, category:'Budget',  extras:'Music, GPS',                    emoji:'🚗' },
  { type:'5-Seater',  seats:5,  fuel:'Petrol', ac:true,  pricePerKm:18, minFare:120, category:'Standard',extras:'Luggage, GPS',                  emoji:'🚙' },
  { type:'6-Seater',  seats:6,  fuel:'Diesel', ac:true,  pricePerKm:20, minFare:150, category:'Premium', extras:'WiFi, Luggage Space',           emoji:'🚐' },
  { type:'7-Seater',  seats:7,  fuel:'Diesel', ac:true,  pricePerKm:25, minFare:200, category:'Premium', extras:'Family Friendly, Luggage Space', emoji:'🚙' },
  { type:'Van',       seats:8,  fuel:'Diesel', ac:true,  pricePerKm:30, minFare:250, category:'Premium', extras:'Spacious, Family Group',         emoji:'🚌' },
  { type:'Ecco',      seats:5,  fuel:'Petrol', ac:false, pricePerKm:18, minFare:120, category:'Standard',extras:'Budget Family Ride',             emoji:'🚐' },
  { type:'Tempo',     seats:12, fuel:'Diesel', ac:true,  pricePerKm:35, minFare:300, category:'Premium', extras:'Tour Packages, Comfortable Seats',emoji:'🚌' },
];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transportdashboard/vehicle-types
// ─────────────────────────────────────────────────────────────────────────────
const getVehicleTypes = (req, res) => {
  res.json({ success: true, data: VEHICLE_TYPES, count: VEHICLE_TYPES.length });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transportdashboard/stats
// ─────────────────────────────────────────────────────────────────────────────
const getTransportDashboardStats = async (req, res) => {
  try {
    const hasTransport = { 'transport.vehicleType': { $exists: true, $ne: null } };

    const [total, pending, confirmed, cancelled] = await Promise.all([
      BookingFormsData.countDocuments(hasTransport),
      BookingFormsData.countDocuments({ ...hasTransport, transportConfirmed: false, status: { $nin: ['cancelled'] } }),
      BookingFormsData.countDocuments({ ...hasTransport, transportConfirmed: true }),
      BookingFormsData.countDocuments({ ...hasTransport, status: 'cancelled' }),
    ]);

    const earningsAgg = await BookingFormsData.aggregate([
      { $match: { ...hasTransport, transportConfirmed: true, 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$payment.totalAmount' } } }
    ]);
    const totalEarnings = earningsAgg[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        vehicleTypes   : VEHICLE_TYPES.length,
        totalBookings  : total,
        pendingRequests: pending,
        confirmedTrips : confirmed,
        cancelledTrips : cancelled,
        totalEarnings
      }
    });
  } catch (err) {
    console.error('❌ getTransportDashboardStats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transportdashboard/bookings/requests
// Returns bookings with a transport sub-doc that are not yet confirmed
// ─────────────────────────────────────────────────────────────────────────────
const getTransportBookingRequests = async (req, res) => {
  try {
    const bookings = await BookingFormsData.find({
      'transport.vehicleType': { $exists: true, $ne: null },
      transportConfirmed: false,
      status: { $nin: ['cancelled'] }
    })
    .sort({ createdAt: -1 })
    .lean();

    console.log(`✅ Found ${bookings.length} pending transport requests`);

    res.json({
      success  : true,
      requests : bookings.map(transformBooking),
      count    : bookings.length
    });
  } catch (err) {
    console.error('❌ getTransportBookingRequests:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transportdashboard/bookings/history
// ─────────────────────────────────────────────────────────────────────────────
const getTransportBookingHistory = async (req, res) => {
  try {
    const bookings = await BookingFormsData.find({
      'transport.vehicleType': { $exists: true, $ne: null },
      $or: [{ transportConfirmed: true }, { status: 'cancelled' }]
    })
    .sort({ transportConfirmedAt: -1, updatedAt: -1 })
    .lean();

    res.json({
      success : true,
      history : bookings.map(transformBooking),
      count   : bookings.length
    });
  } catch (err) {
    console.error('❌ getTransportBookingHistory:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/transportdashboard/bookings/:bookingId/handle
// action: 'accept' | 'reject'
// ─────────────────────────────────────────────────────────────────────────────
const handleTransportBookingRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action, notes } = req.body;
    const userId = req.user.id;

    console.log(`🔄 Transport ${userId} → booking ${bookingId} → ${action}`);

    const booking = await BookingFormsData.findOne({ bookingId });
    if (!booking)
      return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.transportConfirmed && action === 'accept')
      return res.status(400).json({ success: false, message: 'Booking already confirmed by transport.' });

    if (!booking.transport || !booking.transport.vehicleType)
      return res.status(400).json({ success: false, message: 'This booking has no transport request.' });

    if (action === 'accept') {
      booking.transportConfirmed   = true;
      booking.transportConfirmedAt = new Date();
      booking.transport.managerId           = userId;
      booking.transport.assignedAt          = new Date();
      booking.transport.confirmationStatus  = 'confirmed';

      // Find vehicle specs from static catalogue for confirmation record
      const vehicleSpec = VEHICLE_TYPES.find(v => v.type === booking.transport.vehicleType);
      if (vehicleSpec) {
        if (!booking.transport.pricePerKm) booking.transport.pricePerKm = `₹${vehicleSpec.pricePerKm}/km`;
        if (!booking.transport.features)   booking.transport.features   = vehicleSpec.extras;
      }

      if (notes) booking.specialRequests = (booking.specialRequests || '') + `\n[Transport Notes]: ${notes}`;

      // Advance status
      if (booking.hotelConfirmed && booking.agentConfirmed) {
        booking.status = 'confirmed';
      } else {
        booking.status = 'transport_confirmed';
      }

      await booking.save();
      console.log(`✅ Booking ${bookingId} accepted by transport`);

      // Update client profile booking
      const pbResult = await ProfileBooking.findOneAndUpdate(
        { $or: [{ bookingId }, { bookingId: booking._id.toString() }] },
        { status: booking.status === 'confirmed' ? 'Upcoming' : 'Upcoming' },
        { new: true }
      );
      console.log(pbResult ? `✅ ProfileBooking updated` : `⚠️  ProfileBooking not found for ${bookingId}`);

      return res.json({
        success: true,
        message: 'Transport booking accepted!',
        booking: { bookingId: booking.bookingId, status: booking.status, transportConfirmed: true }
      });

    } else if (action === 'reject') {
      booking.status = 'cancelled';
      booking.transport.confirmationStatus = 'rejected';
      if (notes) booking.specialRequests = (booking.specialRequests || '') + `\n[Transport Rejection]: ${notes}`;
      await booking.save();
      console.log(`❌ Booking ${bookingId} rejected by transport`);

      await ProfileBooking.findOneAndUpdate(
        { $or: [{ bookingId }, { bookingId: booking._id.toString() }] },
        { status: 'Cancelled' },
        { new: true }
      );

      return res.json({
        success: true,
        message: 'Booking rejected.',
        booking: { bookingId: booking.bookingId, status: 'cancelled' }
      });

    } else {
      return res.status(400).json({ success: false, message: "Invalid action. Use 'accept' or 'reject'." });
    }

  } catch (err) {
    console.error('❌ handleTransportBookingRequest:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transportdashboard/bookings/:bookingId
// Single booking detail
// ─────────────────────────────────────────────────────────────────────────────
const getBookingDetail = async (req, res) => {
  try {
    const { bookingId } = req.params;
    let booking = await BookingFormsData.findOne({ bookingId });
    if (!booking && bookingId.match(/^[0-9a-fA-F]{24}$/))
      booking = await BookingFormsData.findById(bookingId);
    if (!booking)
      return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Helper ──────────────────────────────────────────────────────────────────
function transformBooking(b) {
  return {
    _id            : b._id,
    bookingId      : b.bookingId,
    tourName       : b.tourName       || 'Tour Package',
    touristPlaces  : b.touristPlaces  || [],
    customer: {
      name  : b.user?.fullName || b.tourist?.name || 'Unknown',
      email : b.tourist?.email || '',
      phone : b.tourist?.phone || b.user?.phone   || ''
    },
    tripDetails: {
      travelers : b.tourist?.totalTravellers || 1,
      startDate : b.hotel?.fromDate,
      endDate   : b.hotel?.toDate,
      duration  : b.tourDuration
    },
    transport      : b.transport || {},
    payment: {
      totalAmount : b.payment?.totalAmount || 0,
      status      : b.payment?.status      || 'pending'
    },
    status             : b.status,
    transportConfirmed : b.transportConfirmed,
    hotelConfirmed     : b.hotelConfirmed,
    agentConfirmed     : b.agentConfirmed,
    specialRequests    : b.specialRequests,
    requestedAt        : b.createdAt,
    confirmedAt        : b.transportConfirmedAt
  };
}

module.exports = {
  getVehicleTypes,
  getTransportDashboardStats,
  getTransportBookingRequests,
  getTransportBookingHistory,
  handleTransportBookingRequest,
  getBookingDetail
};