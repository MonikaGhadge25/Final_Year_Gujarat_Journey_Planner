const User = require("../models/User");
const ProfileBooking = require("../models/profileBooking");
const BookingFormsData = require("../models/bookingformsdataModel");

exports.getProfileData = async (req, res) => {
  try {
    // 1️⃣ Get user ID from JWT/session (middleware must set req.user.id)
    const userId = req.user.id;

    // 2️⃣ Fetch user data (exclude password)
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Fetch detailed bookings from bookingformsdatas collection
    const detailedBookings = await BookingFormsData.find({ userId })
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    // 4️⃣ Transform detailed bookings into profile-friendly format
    const tours = detailedBookings.map(booking => ({
      bookingId: booking.bookingId,
      tourName: booking.tourName,
      touristPlaces: booking.touristPlaces,
      status: getBookingStatusForProfile(booking),
      date: booking.hotel.fromDate || booking.createdAt,
      checkIn: booking.hotel.fromDate,
      checkOut: booking.hotel.toDate,
      travelers: booking.tourist.totalTravellers,
      totalAmount: booking.payment.totalAmount,
      paymentStatus: booking.payment.status,
      
      // Booking progress and confirmation status
      progress: {
        submitted: true,
        agentConfirmed: booking.agentConfirmed || false,
        hotelConfirmed: booking.hotelConfirmed || false,
        transportConfirmed: booking.transportConfirmed || false,
        paymentCompleted: booking.payment?.status === 'completed'
      },
      
      // Direct confirmation flags for easy access
      agentConfirmed: booking.agentConfirmed || false,
      hotelConfirmed: booking.hotelConfirmed || false,
      transportConfirmed: booking.transportConfirmed || false,
      
      // Hotel details
      hotel: {
        name: booking.hotel.name || "TBD",
        checkIn: booking.hotel.fromDate,
        checkOut: booking.hotel.toDate,
        address: booking.hotel.address
      },
      
      // Agent details
      agent: {
        name: booking.agent.name || "TBD",
        experience: booking.agent.experience,
        location: booking.agent.location,
        languages: booking.agent.languages
      },
      
      // Transport details (assigned by transport manager)
      transport: {
        vehicleType: booking.transport?.vehicleType || "TBD",
        vehicleName: booking.transport?.vehicleName || "TBD", 
        vehicleNumber: booking.transport?.vehicleNumber || "TBD",
        driverName: booking.transport?.driverName || "TBD",
        driverPhone: booking.transport?.driverPhone || "TBD",
        driverEmail: booking.transport?.driverEmail || "TBD",
        pricePerKm: booking.transport?.pricePerKm || "TBD",
        features: booking.transport?.features || "TBD",
        pickupLocation: booking.transport?.pickupLocation || "TBD",
        confirmationStatus: booking.transport?.confirmationStatus || "pending",
        paymentStatus: booking.transport?.paymentStatus || "pending"
      },
      
      // Additional details
      specialRequests: booking.specialRequests,
      tourDuration: booking.tourDuration,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      
      // Action buttons - determine what user can do
      actions: getAvailableActions(booking)
    }));

    // 5️⃣ Get booking statistics
    const stats = {
      totalBookings: detailedBookings.length,
      upcoming: detailedBookings.filter(b => ['pending', 'agent_confirmed', 'hotel_confirmed', 'confirmed', 'payment_complete'].includes(b.status)).length,
      completed: detailedBookings.filter(b => b.status === 'payment_complete' && new Date(b.hotel.toDate) < new Date()).length,
      cancelled: detailedBookings.filter(b => b.status === 'cancelled').length
    };

    // 6️⃣ Prepare response - use fallbacks from booking data if user profile is incomplete
    const latestBooking = detailedBookings[0]; // Most recent booking
    const profileData = {
      name: user.fullName,
      email: user.email,
      phone: user.phone || (latestBooking?.user?.phone) || (latestBooking?.tourist?.phone) || "Not Provided",
      location: user.location || (latestBooking?.user?.address) || (latestBooking?.tourist?.address) || "Not Provided",
      age: user.age,
      gender: user.gender,
      tours: tours,
      stats: stats
    };

    res.json(profileData);

  } catch (error) {
    console.error("Error fetching profile data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to determine booking status for profile display
function getBookingStatusForProfile(booking) {
  switch (booking.status) {
    case 'pending':
      return 'Pending Confirmation';
    case 'agent_confirmed':
      return 'Agent Confirmed - Awaiting Hotel';
    case 'hotel_confirmed':
      return 'Hotel Confirmed - Awaiting Agent';
    case 'confirmed':
      return 'Confirmed - Payment Pending';
    case 'payment_complete':
      return 'Upcoming';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown Status';
  }
}

// Helper function to determine available actions for user
function getAvailableActions(booking) {
  const actions = [];
  
  if (booking.status === 'confirmed') {
    actions.push('pay'); // User can make payment
  }
  
  if (['pending', 'agent_confirmed', 'hotel_confirmed'].includes(booking.status)) {
    actions.push('cancel'); // User can cancel pending bookings
  }
  
  if (booking.status === 'payment_complete') {
    actions.push('view_details'); // User can view trip details
  }
  
  return actions;
}
