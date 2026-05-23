const BookingFormsData = require("../models/bookingformsdataModel");
const ProfileBooking = require("../models/profileBooking");
const User = require("../models/User");

// Create booking and link to user profile
const createBookingFormsData = async (req, res) => {
  try {
    const bookingData = req.body;
    let userId;
    
    // Try to get userId from authenticated user first, then from request body, or create a temporary one
    if (req.user && req.user.id) {
      userId = req.user.id;
    } else if (bookingData.userId) {
      userId = bookingData.userId;
    } else {
      // For demo purposes, find or create a user based on email
      const User = require("../models/User");
      let user = await User.findOne({ email: bookingData.tourist.email });
      
      if (!user) {
        // Create a temporary user account
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('temppassword123', 10);
        
        user = new User({
          fullName: bookingData.tourist.name,
          email: bookingData.tourist.email,
          password: hashedPassword,
          gender: bookingData.tourist.gender,
          dob: bookingData.tourist.dob,
          role: 'client'
        });
        
        await user.save();
        console.log(`📝 Created temporary user account for: ${user.email}`);
      }
      
      userId = user._id;
    }
    
    // Ensure userId is included in booking data
    bookingData.userId = userId;
    
    // Calculate total amount based on tour details (you can customize this logic)
    const baseAmount = 5000; // Base tour cost
    const perPersonAmount = 2000; // Cost per person
    const totalAmount = baseAmount + (bookingData.tourist.totalTravellers * perPersonAmount);
    
    bookingData.payment = {
      totalAmount: totalAmount,
      status: "pending"
    };
    
    // Set default tour name if not provided
    if (!bookingData.tourName) {
      bookingData.tourName = `${bookingData.touristPlaces.join(", ")} Tour`;
    }
    
    const newBooking = new BookingFormsData(bookingData);
    await newBooking.save();
    
    // Create corresponding profile booking entry
    const profileBooking = new ProfileBooking({
      userId: userId,
      tourName: bookingData.tourName,
      status: "Upcoming",
      bookingId: newBooking.bookingId,
      date: bookingData.hotel.fromDate || new Date(),
      travelers: bookingData.tourist.totalTravellers.toString(),
      totalAmount: totalAmount.toString(),
      hotel: {
        name: bookingData.hotel.name || "TBD",
        checkIn: bookingData.hotel.fromDate || "",
        checkOut: bookingData.hotel.toDate || "",
        room: "Standard" // Default room type
      },
      agent: {
        name: bookingData.agent.name || "TBD",
        contact: "",
        email: ""
      }
    });
    
    await profileBooking.save();
    
    res.status(201).json({ 
      success: true, 
      booking: newBooking,
      message: "Booking created successfully and added to your profile!"
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all
const getAllBookingFormsData = async (req, res) => {
  try {
    const bookings = await BookingFormsData.find();
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get by ID
const getBookingFormsDataById = async (req, res) => {
  try {
    const id = req.params.id;
    let booking = null;
    // Try bookingId string first (e.g. BK335236099)
    booking = await BookingFormsData.findOne({ bookingId: id });
    // Fallback: try as MongoDB ObjectId
    if (!booking && id.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await BookingFormsData.findById(id);
    }
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, booking, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get bookings for a specific user
const getBookingsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const bookings = await BookingFormsData.find({ userId })
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending bookings for agent (bookings assigned to this agent)
const getPendingBookingsForAgent = async (req, res) => {
  try {
    const agentId = req.params.agentId || req.user.id;
    
    const bookings = await BookingFormsData.find({
      'agent.agentId': agentId,
      status: { $in: ['pending', 'hotel_confirmed'] }, // Show pending and hotel confirmed bookings
      agentConfirmed: false
    })
    .populate('userId', 'fullName email phone')
    .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Agent confirm booking
const confirmBookingByAgent = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const agentId = req.user.id;
    const { confirmed, notes } = req.body; // confirmed: true/false, notes: optional
    
    console.log('😎 Agent confirm request:', { bookingId, agentId, confirmed, notes });
    
    // First, try to find booking by agentId (if it exists)
    let booking = await BookingFormsData.findOne({ 
      $or: [
        { _id: bookingId }, // MongoDB ObjectId
        { bookingId: bookingId } // Custom booking ID
      ],
      'agent.agentId': agentId 
    });
    
    // If not found by agentId, try to find by booking ID and check if user is agent
    if (!booking) {
      console.log('😎 Booking not found by agentId, trying by bookingId only...');
      booking = await BookingFormsData.findOne({ 
        $or: [
          { _id: bookingId }, // MongoDB ObjectId
          { bookingId: bookingId } // Custom booking ID
        ]
      });
      
      if (booking) {
        console.log('😎 Found booking:', {
          id: booking._id,
          agentInfo: booking.agent,
          status: booking.status
        });
        
        // Check if current user is an agent or guide
        const currentUser = req.user;
        console.log('😎 Current user:', { id: currentUser.id, role: currentUser.role, name: currentUser.fullName });
        
        if (!['agent', 'guide'].includes(currentUser.role)) {
          return res.status(403).json({ success: false, message: "Only agents and guides can confirm bookings" });
        }
        
        // For now, allow any agent to confirm any booking
        // In future, you might want to match by agent name or add proper agent assignment
        console.log('😎 Allowing agent to confirm booking');
      }
    }
    
    if (!booking) {
      console.log('😎 Booking not found at all');
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    console.log('😎 Processing agent booking confirmation...', { confirmed, currentStatus: booking.status });
    
    // Ensure required fields are populated before saving
    if (!booking.tourName) {
      booking.tourName = booking.touristPlaces?.join(", ") + " Tour" || "Custom Tour Package";
      console.log('😎 Setting missing tourName:', booking.tourName);
    }
    
    if (!booking.userId) {
      // Try to find user by email
      if (booking.tourist?.email) {
        const User = require("../models/User");
        const user = await User.findOne({ email: booking.tourist.email });
        if (user) {
          booking.userId = user._id;
          console.log('😎 Found and set userId from email:', booking.userId);
        } else {
          console.log('😎 Warning: No user found for email, keeping booking without userId');
        }
      }
    }
    
    if (!booking.payment || !booking.payment.totalAmount) {
      const baseAmount = 5000;
      const perPersonAmount = 2000;
      const travelers = booking.tourist?.totalTravellers || 1;
      const totalAmount = baseAmount + (travelers * perPersonAmount);
      
      booking.payment = booking.payment || {};
      booking.payment.totalAmount = totalAmount;
      booking.payment.status = booking.payment.status || "pending";
      console.log('😎 Setting missing payment.totalAmount:', totalAmount);
    }
    
    if (confirmed) {
      booking.agentConfirmed = true;
      booking.agentConfirmedAt = new Date();
      
      // Update status based on hotel confirmation
      if (booking.hotelConfirmed) {
        booking.status = "confirmed";
      } else {
        booking.status = "agent_confirmed";
      }
      
      console.log('😎 Booking accepted by agent, new status:', booking.status);
      
      // Update profile booking status
      await ProfileBooking.findOneAndUpdate(
        { bookingId: bookingId },
        { 
          status: booking.hotelConfirmed ? "Upcoming" : "Upcoming",
          'agent.contact': booking.agent.name,
          'agent.email': req.user.email || ""
        }
      );
      
    } else {
      booking.status = "cancelled";
      console.log('😎 Booking rejected by agent, status set to cancelled');
      
      // Update profile booking status
      await ProfileBooking.findOneAndUpdate(
        { bookingId: bookingId },
        { status: "Cancelled" }
      );
    }
    
    if (notes) {
      booking.specialRequests = (booking.specialRequests || "") + "\n" + `Agent notes: ${notes}`;
    }
    
    // Use updateOne to bypass validation issues with incomplete booking data
    await BookingFormsData.updateOne(
      { _id: booking._id },
      {
        status: booking.status,
        agentConfirmed: booking.agentConfirmed,
        agentConfirmedAt: booking.agentConfirmedAt,
        specialRequests: booking.specialRequests,
        // Also update any missing required fields we populated
        ...(booking.tourName && { tourName: booking.tourName }),
        ...(booking.userId && { userId: booking.userId }),
        ...(booking.payment?.totalAmount && { 
          'payment.totalAmount': booking.payment.totalAmount,
          'payment.status': booking.payment.status
        })
      },
      { runValidators: false } // Skip validation to avoid issues with incomplete legacy data
    );
    
    console.log('😎 Agent booking saved successfully with status:', booking.status);
    
    res.status(200).json({ 
      success: true, 
      message: confirmed ? "Booking confirmed successfully" : "Booking cancelled",
      booking 
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Hotel manager confirm booking
const confirmBookingByHotel = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const hotelManagerId = req.user.id;
    const { confirmed, notes } = req.body;
    
    console.log('🏨 Hotel confirm request:', { bookingId, hotelManagerId, confirmed, notes });
    
    // Try to find booking by both _id and bookingId formats
    let booking = await BookingFormsData.findOne({ 
      $or: [
        { _id: bookingId }, // MongoDB ObjectId
        { bookingId: bookingId } // Custom booking ID
      ],
      'hotel.managerId': hotelManagerId 
    });
    
    // If not found by managerId, try to find by booking ID and check if user is hotel manager
    if (!booking) {
      console.log('🏨 Booking not found by managerId, trying by ID only...');
      booking = await BookingFormsData.findOne({ 
        $or: [
          { _id: bookingId }, // MongoDB ObjectId
          { bookingId: bookingId } // Custom booking ID
        ]
      });
      
      if (booking) {
        console.log('🏨 Found booking:', {
          id: booking._id,
          hotelInfo: booking.hotel,
          status: booking.status
        });
        
        // Check if current user is a hotel manager
        const currentUser = req.user;
        console.log('🏨 Current user:', { id: currentUser.id, role: currentUser.role, name: currentUser.fullName });
        
        if (currentUser.role !== 'hotel') {
          return res.status(403).json({ success: false, message: "Only hotel managers can confirm bookings" });
        }
        
        // For now, allow any hotel manager to confirm any booking
        // In future, you might want to match by hotel name or add proper hotel assignment
        console.log('🏨 Allowing hotel manager to confirm booking');
      }
    }
    
    if (!booking) {
      console.log('🏨 Booking not found at all');
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    console.log('🏨 Processing booking confirmation...', { confirmed, currentStatus: booking.status });
    
    // Ensure required fields are populated before saving
    if (!booking.tourName) {
      booking.tourName = booking.touristPlaces?.join(", ") + " Tour" || "Custom Tour Package";
      console.log('🏨 Setting missing tourName:', booking.tourName);
    }
    
    if (!booking.userId) {
      // Try to find user by email or set a temporary userId
      if (booking.tourist?.email) {
        const User = require("../models/User");
        const user = await User.findOne({ email: booking.tourist.email });
        if (user) {
          booking.userId = user._id;
          console.log('🏨 Found and set userId from email:', booking.userId);
        } else {
          console.log('🏨 Warning: No user found for email, keeping booking without userId');
        }
      }
    }
    
    if (!booking.payment || !booking.payment.totalAmount) {
      const baseAmount = 5000; // Base tour cost
      const perPersonAmount = 2000; // Cost per person
      const travelers = booking.tourist?.totalTravellers || 1;
      const totalAmount = baseAmount + (travelers * perPersonAmount);
      
      booking.payment = booking.payment || {};
      booking.payment.totalAmount = totalAmount;
      booking.payment.status = booking.payment.status || "pending";
      console.log('🏨 Setting missing payment.totalAmount:', totalAmount);
    }
    
    if (confirmed) {
      booking.hotelConfirmed = true;
      booking.hotelConfirmedAt = new Date();
      
      // Update status based on agent confirmation
      if (booking.agentConfirmed) {
        booking.status = "confirmed";
      } else {
        booking.status = "hotel_confirmed";
      }
      
      console.log('🏨 Booking accepted, new status:', booking.status);
      
      // Update profile booking
      await ProfileBooking.findOneAndUpdate(
        { bookingId: bookingId },
        { 
          status: booking.agentConfirmed ? "Upcoming" : "Upcoming",
          'hotel.name': booking.hotel.name,
          'hotel.checkIn': booking.hotel.fromDate,
          'hotel.checkOut': booking.hotel.toDate
        }
      );
      
    } else {
      booking.status = "cancelled";
      console.log('🏨 Booking rejected, status set to cancelled');
      
      await ProfileBooking.findOneAndUpdate(
        { bookingId: bookingId },
        { status: "Cancelled" }
      );
    }
    
    if (notes) {
      booking.specialRequests = (booking.specialRequests || "") + "\n" + `Hotel notes: ${notes}`;
    }
    
    // Use updateOne to bypass validation issues with incomplete booking data
    await BookingFormsData.updateOne(
      { _id: booking._id },
      {
        status: booking.status,
        hotelConfirmed: booking.hotelConfirmed,
        hotelConfirmedAt: booking.hotelConfirmedAt,
        specialRequests: booking.specialRequests,
        // Also update any missing required fields we populated
        ...(booking.tourName && { tourName: booking.tourName }),
        ...(booking.userId && { userId: booking.userId }),
        ...(booking.payment?.totalAmount && { 
          'payment.totalAmount': booking.payment.totalAmount,
          'payment.status': booking.payment.status
        })
      },
      { runValidators: false } // Skip validation to avoid issues with incomplete legacy data
    );
    
    console.log('🏨 Booking saved successfully with status:', booking.status);
    
    res.status(200).json({ 
      success: true, 
      message: confirmed ? "Booking confirmed successfully" : "Booking cancelled",
      booking 
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process payment (after both confirmations)
const processPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentMethod, transactionId } = req.body;
    
    const booking = await BookingFormsData.findOne({ bookingId });
    
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    if (booking.status !== "confirmed") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking must be confirmed by both agent and hotel before payment" 
      });
    }
    
    // Update payment information
    booking.payment.status = "completed";
    booking.payment.paymentMethod = paymentMethod;
    booking.payment.transactionId = transactionId;
    booking.payment.paidAt = new Date();
    booking.status = "payment_complete";
    
    await booking.save();
    
    // Update profile booking status
    await ProfileBooking.findOneAndUpdate(
      { bookingId: bookingId },
      { status: "Upcoming" }
    );
    
    res.status(200).json({ 
      success: true, 
      message: "Payment processed successfully",
      booking
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get bookings by email (public endpoint for testing)
const getBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    
    // Find user by email
    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Get bookings for this user
    const bookings = await BookingFormsData.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();
    
    // Transform bookings for display
    const transformedBookings = bookings.map(booking => ({
      bookingId: booking.bookingId,
      tourName: booking.tourName,
      touristPlaces: booking.touristPlaces,
      status: booking.status,
      travelers: booking.tourist.totalTravellers,
      totalAmount: booking.payment.totalAmount,
      paymentStatus: booking.payment.status,
      checkIn: booking.hotel.fromDate,
      checkOut: booking.hotel.toDate,
      hotelName: booking.hotel.name,
      agentName: booking.agent.name,
      agentConfirmed: booking.agentConfirmed,
      hotelConfirmed: booking.hotelConfirmed,
      createdAt: booking.createdAt
    }));
    
    res.json({ 
      success: true, 
      user: {
        name: user.fullName,
        email: user.email,
        phone: bookings[0]?.user.phone || "Not provided"
      },
      bookings: transformedBookings,
      count: transformedBookings.length
    });
    
  } catch (error) {
    console.error("Error fetching bookings by email:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// User cancel booking
const cancelBookingByUser = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    
    const booking = await BookingFormsData.findOne({ 
      bookingId: bookingId,
      userId: userId 
    });
    
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found or not authorized" });
    }
    
    // Only allow cancellation of pending bookings
    if (!['pending', 'agent_confirmed', 'hotel_confirmed'].includes(booking.status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Only pending bookings can be cancelled" 
      });
    }
    
    booking.status = "cancelled";
    await booking.save();
    
    // Update profile booking status
    await ProfileBooking.findOneAndUpdate(
      { bookingId: bookingId },
      { status: "Cancelled" }
    );
    
    res.status(200).json({ 
      success: true, 
      message: "Booking cancelled successfully"
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// User update payment (for confirmed bookings)
const updatePaymentByUser = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const { paymentMethod, transactionId, status, amount } = req.body;
    
    const booking = await BookingFormsData.findOne({ 
      bookingId: bookingId,
      userId: userId 
    });
    
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found or not authorized" });
    }
    
    // Allow payment for confirmed bookings
    if (booking.status !== "confirmed") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking must be confirmed before payment can be processed" 
      });
    }
    
    // Update payment information
    booking.payment.status = status || "completed";
    booking.payment.paymentMethod = paymentMethod;
    booking.payment.transactionId = transactionId;
    booking.payment.paidAt = new Date();
    booking.status = "payment_complete";
    
    await booking.save();
    
    // Update profile booking status
    await ProfileBooking.findOneAndUpdate(
      { bookingId: bookingId },
      { status: "Upcoming" }
    );
    
    res.status(200).json({ 
      success: true, 
      message: "Payment updated successfully",
      booking: {
        bookingId: booking.bookingId,
        status: booking.status,
        paymentStatus: booking.payment.status
      }
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Transport manager confirm booking and assign vehicle
const confirmBookingByTransport = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const transportManagerId = req.user.id;
    const { confirmed, transportDetails, notes } = req.body;
    
    console.log('🚐 Transport confirm request:', { bookingId, transportManagerId, confirmed, transportDetails });
    
    // Try to find booking by both _id and bookingId formats
    let booking = await BookingFormsData.findOne({ 
      $or: [
        { _id: bookingId }, // MongoDB ObjectId
        { bookingId: bookingId } // Custom booking ID
      ]
    });
    
    if (!booking) {
      console.log('🚐 Booking not found');
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    
    // Check if current user is a transport manager
    const currentUser = req.user;
    console.log('🚐 Current user:', { id: currentUser.id, role: currentUser.role, name: currentUser.fullName });
    
    if (currentUser.role !== 'transport') {
      return res.status(403).json({ success: false, message: "Only transport managers can confirm bookings" });
    }
    
    console.log('🚐 Processing transport booking confirmation...', { confirmed, currentStatus: booking.status });
    
    if (confirmed) {
      booking.transportConfirmed = true;
      booking.transportConfirmedAt = new Date();
      
      // Assign transport details if provided
      if (transportDetails) {
        booking.transport = {
          vehicleType: transportDetails.vehicleType,
          vehicleName: transportDetails.vehicleName,
          vehicleNumber: transportDetails.vehicleNumber,
          driverName: transportDetails.driverName,
          driverPhone: transportDetails.driverPhone,
          driverEmail: transportDetails.driverEmail,
          pricePerKm: transportDetails.pricePerKm,
          features: transportDetails.features,
          pickupLocation: transportDetails.pickupLocation,
          managerId: transportManagerId,
          assignedAt: new Date(),
          confirmationStatus: 'confirmed'
        };
      }
      
      // Update overall status
      if (booking.agentConfirmed && booking.hotelConfirmed) {
        booking.status = "confirmed";
      } else {
        booking.status = "transport_confirmed";
      }
      
      console.log('🚐 Transport accepted, new status:', booking.status);
      
      // Update profile booking
      await ProfileBooking.findOneAndUpdate(
        { bookingId: bookingId },
        { 
          status: booking.status === "confirmed" ? "Upcoming" : "Upcoming",
          'transport.vehicleType': transportDetails?.vehicleType,
          'transport.driverName': transportDetails?.driverName,
          'transport.driverPhone': transportDetails?.driverPhone
        }
      );
      
    } else {
      booking.status = "cancelled";
      console.log('🚐 Transport rejected, status set to cancelled');
      
      await ProfileBooking.findOneAndUpdate(
        { bookingId: bookingId },
        { status: "Cancelled" }
      );
    }
    
    if (notes) {
      booking.specialRequests = (booking.specialRequests || "") + "\n" + `Transport notes: ${notes}`;
    }
    
    // Use updateOne to bypass validation issues
    await BookingFormsData.updateOne(
      { _id: booking._id },
      {
        status: booking.status,
        transportConfirmed: booking.transportConfirmed,
        transportConfirmedAt: booking.transportConfirmedAt,
        transport: booking.transport,
        specialRequests: booking.specialRequests
      },
      { runValidators: false }
    );
    
    console.log('🚐 Transport booking saved successfully with status:', booking.status);
    
    res.status(200).json({ 
      success: true, 
      message: confirmed ? "Transport confirmed and assigned successfully" : "Transport booking cancelled",
      booking 
    });
  } catch (error) {
    console.error("Error confirming transport booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBookingFormsData,
  getAllBookingFormsData,
  getBookingFormsDataById,
  getBookingsByUserId,
  getPendingBookingsForAgent,
  confirmBookingByAgent,
  confirmBookingByHotel,
  confirmBookingByTransport,
  processPayment,
  getBookingsByEmail,
  cancelBookingByUser,
  updatePaymentByUser
};