// const Hotel = require("../models/hotel");
// const User = require("../models/User");
// const BookingFormsData = require("../models/bookingformsdataModel");
// const ProfileBooking = require("../models/profileBooking");

// // @desc    Get hotel profile by User ID (from token)
// // @route   GET /api/hoteldashboard/:userId
// // @access  Private (only hotel)
// const getHotelByUserId = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     console.log(`🔍 Fetching hotel data for user ID: ${userId}`);
    
//     // Validate userId format
//     if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
//       console.log(`❌ Invalid user ID format: ${userId}`);
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid user ID format" 
//       });
//     }
    
//     // First, verify the user exists and has hotel role
//     const user = await User.findById(userId);
//     if (!user) {
//       console.log(`❌ User not found with ID: ${userId}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     console.log(`✅ User found: ${user.fullName}, Role: ${user.role}`);
    
//     if (user.role !== 'hotel') {
//       console.log(`❌ Access denied. User role is '${user.role}', not 'hotel'`);
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }

//     // Try to find existing Hotel record by email or username
//     console.log(`🔍 Looking for hotel profile with email: ${user.email}`);
//     let hotel = await Hotel.findOne({ 
//       $or: [
//         { "hotel_details.email": user.email },
//         { "hotel_details.username": user.email }
//       ]
//     });

//     // If no Hotel record exists, create a default one
//     if (!hotel) {
//       console.log(`📝 No hotel profile found. Creating default profile for: ${user.email}`);
      
//       // Generate unique username
//       const baseUsername = user.email.split('@')[0] + '_hotel';
//       let username = baseUsername;
//       let counter = 1;
      
//       // Ensure username is unique
//       while (await Hotel.findOne({ "hotel_details.username": username })) {
//         username = `${baseUsername}_${counter}`;
//         counter++;
//       }
      
//       hotel = new Hotel({
//         hotel_details: {
//           hotel_name: user.fullName + "'s Hotel",
//           description: "Welcome to our hotel",
//           location: {
//             district: "Not specified",
//             pincode: 0
//           },
//           contact: "Not specified",
//           email: user.email,
//           check_in_time: "14:00",
//           check_out_time: "11:00",
//           rating: 0,
//           amenities: ["WiFi", "Parking"],
//           username: username,
//           password: 'temp_password_' + Date.now(),
//         },
//         room_types: [
//           {
//             type: "Standard Room",
//             price_per_night: "2000",
//             features: ["AC", "TV", "WiFi"]
//           }
//         ],
//         image: {
//           base64: ""
//         }
//       });
      
//       await hotel.save();
//       console.log(`✅ Created new hotel profile with ID: ${hotel._id}`);
      
//       // Return the hotel data
//       return res.json({
//         success: true,
//         data: {
//           _id: hotel._id,
//           hotel_details: hotel.hotel_details,
//           room_types: hotel.room_types,
//           image: hotel.image,
//           gallery: hotel.gallery || [],
//           managerId: userId // Link to user
//         }
//       });
//     }

//     console.log(`✅ Found existing hotel profile: ${hotel.hotel_details.hotel_name}`);
//     res.json({
//       success: true,
//       data: {
//         _id: hotel._id,
//         hotel_details: hotel.hotel_details,
//         room_types: hotel.room_types,
//         image: hotel.image,
//         gallery: hotel.gallery || [],
//         managerId: userId // Link to user
//       }
//     });
//   } catch (error) {
//     console.error("❌ Error fetching hotel:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching hotel profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Update hotel profile by User ID
// // @route   PUT /api/hoteldashboard/:userId
// // @access  Private (only hotel)
// const updateHotelByUserId = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const updateData = req.body;
//     console.log(`🔄 Updating hotel profile for user ID: ${userId}`);
    
//     // Validate userId format
//     if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
//       console.log(`❌ Invalid user ID format: ${userId}`);
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid user ID format" 
//       });
//     }
    
//     // First, verify the user exists and has hotel role
//     const user = await User.findById(userId);
//     if (!user) {
//       console.log(`❌ User not found with ID: ${userId}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     console.log(`✅ User found: ${user.fullName}, Role: ${user.role}`);
    
//     if (user.role !== 'hotel') {
//       console.log(`❌ Access denied. User role is '${user.role}', not 'hotel'`);
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }

//     // Find the Hotel record
//     let hotel = await Hotel.findOne({ 
//       $or: [
//         { "hotel_details.email": user.email },
//         { "hotel_details.username": user.email }
//       ]
//     });
    
//     if (!hotel) {
//       console.log(`❌ Hotel profile not found for email: ${user.email}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "Hotel profile not found. Please refresh the page." 
//       });
//     }
    
//     console.log(`📝 Updating hotel profile: ${hotel.hotel_details.hotel_name}`);
    
//     // Update allowed fields
//     const updateFields = {};
    
//     if (updateData.hotel_details) {
//       const allowedHotelFields = ['hotel_name', 'description', 'location', 'contact', 'check_in_time', 'check_out_time', 'amenities'];
//       allowedHotelFields.forEach(field => {
//         if (updateData.hotel_details[field] !== undefined) {
//           if (!updateFields.hotel_details) updateFields.hotel_details = {};
//           updateFields.hotel_details[field] = updateData.hotel_details[field];
//           console.log(`📝 Updating hotel_details.${field}`);
//         }
//       });
//     }
    
//     if (updateData.room_types) {
//       updateFields.room_types = updateData.room_types;
//       console.log(`📝 Updating room_types`);
//     }
    
//     if (updateData.image) {
//       updateFields.image = updateData.image;
//       console.log(`📝 Updating image`);
//     }
    
//     if (updateData.gallery) {
//       updateFields.gallery = updateData.gallery;
//       console.log(`📝 Updating gallery with ${updateData.gallery.length} images`);
//     }
    
//     if (Object.keys(updateFields).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No valid fields provided for update"
//       });
//     }
    
//     const updatedHotel = await Hotel.findByIdAndUpdate(
//       hotel._id,
//       updateFields,
//       { new: true, runValidators: true }
//     );
    
//     console.log(`✅ Successfully updated hotel profile: ${updatedHotel.hotel_details.hotel_name}`);
    
//     res.json({
//       success: true,
//       message: "Hotel profile updated successfully",
//       data: {
//         _id: updatedHotel._id,
//         hotel_details: updatedHotel.hotel_details,
//         room_types: updatedHotel.room_types,
//         image: updatedHotel.image,
//         gallery: updatedHotel.gallery || [],
//         managerId: userId
//       }
//     });
    
//   } catch (error) {
//     console.error("❌ Error updating hotel profile:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while updating hotel profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Get current user's hotel profile from token
// // @route   GET /api/hoteldashboard/me
// // @access  Private (only hotel)
// const getCurrentHotelProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // From JWT token
//     console.log(`🔍 Fetching current user's hotel profile. User ID: ${userId}`);
    
//     // Verify the user exists and has hotel role (should be already verified by middleware)
//     const user = await User.findById(userId);
//     if (!user) {
//       console.log(`❌ User not found with ID: ${userId}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     if (user.role !== 'hotel') {
//       console.log(`❌ Access denied. User role is '${user.role}', not 'hotel'`);
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }

//     // 🔧 NEW: Try to find hotel using proper relationship first
//     let hotel = null;
    
//     // Method 1: Use user.hotel_id if it exists (proper relationship)
//     if (user.hotel_id) {
//       console.log(`🔍 Looking for hotel by hotel_id: ${user.hotel_id}`);
//       hotel = await Hotel.findById(user.hotel_id);
//       if (hotel) {
//         console.log(`✅ Found hotel via hotel_id: ${hotel.hotel_details.hotel_name}`);
//       }
//     }
    
//     // Method 2: Use manager_id relationship (new approach)
//     if (!hotel) {
//       console.log(`🔍 Looking for hotel by manager_id: ${userId}`);
//       hotel = await Hotel.findOne({ manager_id: userId });
//       if (hotel) {
//         console.log(`✅ Found hotel via manager_id: ${hotel.hotel_details.hotel_name}`);
//         // Update user.hotel_id for future lookups
//         user.hotel_id = hotel._id;
//         await user.save();
//       }
//     }
    
//     // Method 3: Fallback to email matching (legacy)
//     if (!hotel) {
//       console.log(`🔍 Fallback: Looking for hotel by email: ${user.email}`);
//       hotel = await Hotel.findOne({ 
//         $or: [
//           { manager_email: user.email },
//           { "hotel_details.email": user.email },
//           { "hotel_details.username": user.email }
//         ]
//       });
//       if (hotel) {
//         console.log(`✅ Found hotel via email matching: ${hotel.hotel_details.hotel_name}`);
//         // Update relationships for future lookups
//         hotel.manager_id = userId;
//         hotel.manager_email = user.email;
//         user.hotel_id = hotel._id;
//         await Promise.all([hotel.save(), user.save()]);
//       }
//     }

//     // If no Hotel record exists, create a default one with proper relationships
//     if (!hotel) {
//       console.log(`📝 No hotel profile found. Creating default profile for: ${user.email}`);
      
//       const baseUsername = user.email.split('@')[0] + '_hotel';
//       let username = baseUsername;
//       let counter = 1;
      
//       while (await Hotel.findOne({ "hotel_details.username": username })) {
//         username = `${baseUsername}_${counter}`;
//         counter++;
//       }
      
//       hotel = new Hotel({
//         // 🔧 NEW: Proper relationship fields
//         manager_id: userId,
//         manager_email: user.email,
        
//         hotel_details: {
//           hotel_name: user.fullName + "'s Hotel",
//           description: "Welcome to our hotel",
//           location: {
//             district: "Not specified",
//             pincode: 0
//           },
//           contact: "Not specified",
//           email: user.email,
//           check_in_time: "14:00",
//           check_out_time: "11:00",
//           rating: 0,
//           amenities: ["WiFi", "Parking"],
//           username: username,
//           password: 'temp_password_' + Date.now(),
//         },
//         room_types: [
//           {
//             type: "Standard Room",
//             price_per_night: "2000",
//             features: ["AC", "TV", "WiFi"]
//           }
//         ],
//         image: {
//           base64: ""
//         }
//       });
      
//       await hotel.save();
      
//       // 🔧 NEW: Update user with hotel_id
//       user.hotel_id = hotel._id;
//       user.profile_completed = false; // Hotel manager needs to complete profile
//       await user.save();
      
//       console.log(`✅ Created new hotel profile with ID: ${hotel._id} and linked to user ${userId}`);
//     } else {
//       console.log(`✅ Found existing hotel profile: ${hotel.hotel_details.hotel_name}`);
      
//       // 🔧 NEW: Ensure relationships are properly set
//       if (!user.hotel_id) {
//         user.hotel_id = hotel._id;
//         await user.save();
//         console.log(`✅ Updated user ${userId} with hotel_id: ${hotel._id}`);
//       }
//       if (!hotel.manager_id) {
//         hotel.manager_id = userId;
//         hotel.manager_email = user.email;
//         await hotel.save();
//         console.log(`✅ Updated hotel ${hotel._id} with manager_id: ${userId}`);
//       }
//     }

//     res.json({
//       success: true,
//       data: {
//         _id: hotel._id,
//         hotel_details: hotel.hotel_details,
//         room_types: hotel.room_types,
//         image: hotel.image,
//         gallery: hotel.gallery || [],
//         managerId: userId
//       }
//     });
//   } catch (error) {
//     console.error("❌ Error fetching current hotel profile:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching hotel profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get all booking requests for the current hotel
// const getHotelBookingRequests = async (req, res) => {
//   try {
//     const userId = req.user.id; // From JWT token
//     console.log(`🔍 Fetching booking requests for hotel manager user ID: ${userId}`);
    
//     // First, verify the user exists and has hotel role
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     if (user.role !== 'hotel') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }

//     // Find the hotel associated with this user
//     const hotel = await Hotel.findOne({ 
//       $or: [
//         { "hotel_details.email": user.email },
//         { "hotel_details.username": user.email }
//       ]
//     });

//     if (!hotel) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Hotel profile not found" 
//       });
//     }

//     // Find bookings where this hotel is selected and waiting for hotel confirmation
//     const bookingRequests = await BookingFormsData.find({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name },
//         // Fallback: match by hotel name if managerId is not set
//         { 
//           'hotel.name': { $regex: hotel.hotel_details.hotel_name, $options: 'i' },
//           'hotel.managerId': { $exists: false }
//         }
//       ],
//       status: { $in: ['pending', 'agent_confirmed'] }, // Show bookings waiting for hotel confirmation
//       hotelConfirmed: false
//     })
//     .populate('userId', 'fullName email phone')
//     .sort({ createdAt: -1 })
//     .lean();
    
//     console.log(`✅ Found ${bookingRequests.length} booking requests for hotel: ${hotel.hotel_details.hotel_name}`);
    
//     // Transform data for hotel dashboard
//     const transformedRequests = bookingRequests.map(booking => ({
//       _id: booking._id,
//       bookingId: booking.bookingId,
//       tourName: booking.tourName,
//       touristPlaces: booking.touristPlaces,
      
//       // Customer details
//       customer: {
//         name: booking.user.fullName,
//         email: booking.tourist.email,
//         phone: booking.tourist.phone,
//         address: booking.user.address
//       },
      
//       // Trip details
//       tripDetails: {
//         travelers: booking.tourist.totalTravellers,
//         checkIn: booking.hotel.fromDate,
//         checkOut: booking.hotel.toDate,
//         duration: booking.tourDuration,
//         places: booking.touristPlaces
//       },
      
//       // Agent details
//       agent: {
//         name: booking.agent.name,
//         experience: booking.agent.experience,
//         location: booking.agent.location,
//         languages: booking.agent.languages
//       },
      
//       // Financial details
//       payment: {
//         totalAmount: booking.payment.totalAmount,
//         status: booking.payment.status
//       },
      
//       // Booking status
//       status: booking.status,
//       agentConfirmed: booking.agentConfirmed,
//       specialRequests: booking.specialRequests,
      
//       // Dates
//       requestedAt: booking.createdAt,
//       updatedAt: booking.updatedAt
//     }));
    
//     res.json({
//       success: true,
//       requests: transformedRequests,
//       count: transformedRequests.length,
//       hotelInfo: {
//         name: hotel.hotel_details.hotel_name,
//         id: hotel._id
//       }
//     });
    
//   } catch (error) {
//     console.error("❌ Error fetching hotel booking requests:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching booking requests",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Confirm or reject a booking request by hotel
// const handleHotelBookingRequest = async (req, res) => {
//   try {
//     const userId = req.user.id; // From JWT token
//     const { bookingId } = req.params;
//     const { action, notes } = req.body; // action: 'accept' | 'reject', notes: optional
    
//     console.log(`🔄 Hotel manager ${userId} handling booking ${bookingId} with action: ${action}`);
    
//     // Verify user is a hotel manager
//     const user = await User.findById(userId);
//     if (!user || user.role !== 'hotel') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }
    
//     // Find the hotel
//     const hotel = await Hotel.findOne({ 
//       $or: [
//         { "hotel_details.email": user.email },
//         { "hotel_details.username": user.email }
//       ]
//     });

//     if (!hotel) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Hotel profile not found" 
//       });
//     }
    
//     // Find the booking
//     const booking = await BookingFormsData.findOne({ 
//       bookingId: bookingId,
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name },
//         { 'hotel.name': { $regex: hotel.hotel_details.hotel_name, $options: 'i' } }
//       ]
//     });
    
//     if (!booking) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Booking not found or not assigned to your hotel" 
//       });
//     }
    
//     if (booking.hotelConfirmed) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Booking already processed by hotel" 
//       });
//     }
    
//     if (action === 'accept') {
//       // Accept the booking
//       booking.hotelConfirmed = true;
//       booking.hotelConfirmedAt = new Date();
      
//       // Set hotel manager ID if not already set
//       if (!booking.hotel.managerId) {
//         booking.hotel.managerId = userId;
//       }
      
//       // Update status based on agent confirmation
//       if (booking.agentConfirmed) {
//         booking.status = "confirmed";
//       } else {
//         booking.status = "hotel_confirmed";
//       }
      
//       // Add notes if provided
//       if (notes) {
//         booking.specialRequests = (booking.specialRequests || "") + `\n[Hotel Notes]: ${notes}`;
//       }
      
//       await booking.save();
      
//       // Update profile booking
//       await ProfileBooking.findOneAndUpdate(
//         { bookingId: bookingId },
//         { 
//           status: booking.agentConfirmed ? "Upcoming" : "Upcoming",
//           'hotel.contact': hotel.hotel_details.contact,
//           'hotel.email': hotel.hotel_details.email
//         }
//       );
      
//       console.log(`✅ Booking ${bookingId} accepted by hotel`);
      
//       res.json({
//         success: true,
//         message: "Booking request accepted successfully!",
//         booking: {
//           bookingId: booking.bookingId,
//           status: booking.status,
//           hotelConfirmed: booking.hotelConfirmed
//         }
//       });
      
//     } else if (action === 'reject') {
//       // Reject the booking
//       booking.status = "cancelled";
      
//       if (notes) {
//         booking.specialRequests = (booking.specialRequests || "") + `\n[Hotel Rejection]: ${notes}`;
//       }
      
//       await booking.save();
      
//       // Update profile booking
//       await ProfileBooking.findOneAndUpdate(
//         { bookingId: bookingId },
//         { status: "Cancelled" }
//       );
      
//       console.log(`❌ Booking ${bookingId} rejected by hotel`);
      
//       res.json({
//         success: true,
//         message: "Booking request rejected.",
//         booking: {
//           bookingId: booking.bookingId,
//           status: booking.status
//         }
//       });
      
//     } else {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid action. Use 'accept' or 'reject'." 
//       });
//     }
    
//   } catch (error) {
//     console.error("❌ Error handling hotel booking request:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while processing booking request",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get hotel's booking history (accepted bookings)
// const getHotelBookingHistory = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const user = await User.findById(userId);
//     if (!user || user.role !== 'hotel') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }
    
//     // Find the hotel
//     const hotel = await Hotel.findOne({ 
//       $or: [
//         { "hotel_details.email": user.email },
//         { "hotel_details.username": user.email }
//       ]
//     });

//     if (!hotel) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Hotel profile not found" 
//       });
//     }
    
//     const bookingHistory = await BookingFormsData.find({
//       $and: [
//         {
//           $or: [
//             { 'hotel.managerId': userId },
//             { 'hotel.name': hotel.hotel_details.hotel_name }
//           ]
//         },
//         {
//           $or: [
//             { hotelConfirmed: true },
//             { status: 'cancelled' }
//           ]
//         }
//       ]
//     })
//     .populate('userId', 'fullName email phone')
//     .sort({ updatedAt: -1, hotelConfirmedAt: -1 })
//     .lean();
    
//     const transformedHistory = bookingHistory.map(booking => ({
//       bookingId: booking.bookingId,
//       tourName: booking.tourName,
//       customer: booking.user.fullName,
//       travelers: booking.tourist.totalTravellers,
//       amount: booking.payment.totalAmount,
//       status: booking.status,
//       confirmedAt: booking.hotelConfirmedAt || booking.updatedAt,
//       checkInDate: booking.hotel.fromDate,
//       checkOutDate: booking.hotel.toDate,
//       agent: booking.agent.name || 'Not assigned'
//     }));
    
//     res.json({
//       success: true,
//       history: transformedHistory,
//       count: transformedHistory.length
//     });
    
//   } catch (error) {
//     console.error("❌ Error fetching hotel booking history:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching booking history",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get hotel dashboard statistics
// const getHotelDashboardStats = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const user = await User.findById(userId);
//     if (!user || user.role !== 'hotel') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }
    
//     // Find the hotel
//     const hotel = await Hotel.findOne({ 
//       $or: [
//         { "hotel_details.email": user.email },
//         { "hotel_details.username": user.email }
//       ]
//     });

//     if (!hotel) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Hotel profile not found" 
//       });
//     }
    
//     // Get statistics
//     const totalBookings = await BookingFormsData.countDocuments({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name }
//       ]
//     });
    
//     const pendingRequests = await BookingFormsData.countDocuments({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name }
//       ],
//       hotelConfirmed: false,
//       status: { $in: ['pending', 'agent_confirmed'] }
//     });
    
//     const confirmedBookings = await BookingFormsData.countDocuments({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name }
//       ],
//       hotelConfirmed: true,
//       status: { $in: ['confirmed', 'hotel_confirmed'] }
//     });
    
//     const cancelledBookings = await BookingFormsData.countDocuments({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name }
//       ],
//       status: 'cancelled'
//     });
    
//     // Calculate total revenue
//     const revenueData = await BookingFormsData.aggregate([
//       {
//         $match: {
//           $or: [
//             { 'hotel.managerId': userId },
//             { 'hotel.name': hotel.hotel_details.hotel_name }
//           ],
//           hotelConfirmed: true,
//           'payment.status': 'completed'
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalRevenue: { $sum: '$payment.totalAmount' }
//         }
//       }
//     ]);
    
//     const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
//     res.json({
//       success: true,
//       stats: {
//         totalBookings,
//         pendingRequests,
//         confirmedBookings,
//         cancelledBookings,
//         totalRevenue,
//         hotelRating: hotel.hotel_details.rating || 0
//       }
//     });
    
//   } catch (error) {
//     console.error("❌ Error fetching hotel dashboard stats:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching dashboard statistics",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // 🔧 NEW: Additional endpoints for frontend compatibility

// // @desc    Get hotel by manager email
// // @route   GET /api/hoteldashboard/by-manager/:email
// // @access  Private (only hotel)
// const getHotelByManagerEmail = async (req, res) => {
//   try {
//     const email = decodeURIComponent(req.params.email);
//     console.log(`🔍 Finding hotel by manager email: ${email}`);
    
//     const hotel = await Hotel.findOne({
//       $or: [
//         { manager_email: email },
//         { "hotel_details.email": email },
//         { "hotel_details.username": email }
//       ]
//     });
    
//     if (!hotel) {
//       return res.status(404).json({
//         success: false,
//         message: "No hotel found for this manager email"
//       });
//     }
    
//     res.json({
//       success: true,
//       data: hotel
//     });
//   } catch (error) {
//     console.error("❌ Error finding hotel by manager email:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Get hotel by manager ID
// // @route   GET /api/hoteldashboard/by-manager-id/:userId
// // @access  Private (only hotel)
// const getHotelByManagerId = async (req, res) => {
//   try {
//     const managerId = req.params.userId;
//     console.log(`🔍 Finding hotel by manager ID: ${managerId}`);
    
//     const hotel = await Hotel.findOne({ manager_id: managerId });
    
//     if (!hotel) {
//       return res.status(404).json({
//         success: false,
//         message: "No hotel found for this manager ID"
//       });
//     }
    
//     res.json({
//       success: true,
//       data: hotel
//     });
//   } catch (error) {
//     console.error("❌ Error finding hotel by manager ID:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Find hotel by manager (flexible search)
// // @route   POST /api/hoteldashboard/find-by-manager
// // @access  Private (only hotel)
// const findHotelByManager = async (req, res) => {
//   try {
//     const { managerEmail, managerId, managerRole } = req.body;
//     console.log(`🔍 Flexible hotel search:`, { managerEmail, managerId, managerRole });
    
//     let hotel = null;
    
//     // Try manager_id first (most reliable)
//     if (managerId) {
//       hotel = await Hotel.findOne({ manager_id: managerId });
//     }
    
//     // Fallback to email if no hotel found
//     if (!hotel && managerEmail) {
//       hotel = await Hotel.findOne({
//         $or: [
//           { manager_email: managerEmail },
//           { "hotel_details.email": managerEmail },
//           { "hotel_details.username": managerEmail }
//         ]
//       });
//     }
    
//     if (!hotel) {
//       return res.status(404).json({
//         success: false,
//         message: "No hotel found for this manager"
//       });
//     }
    
//     res.json({
//       success: true,
//       data: hotel
//     });
//   } catch (error) {
//     console.error("❌ Error in flexible hotel search:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Create new hotel profile
// // @route   POST /api/hoteldashboard/create
// // @access  Private (only hotel)
// const createHotelProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const hotelData = req.body;
    
//     console.log(`📝 Creating new hotel profile for user: ${userId}`);
    
//     // Verify user exists and has hotel role
//     const user = await User.findById(userId);
//     if (!user || user.role !== 'hotel') {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied. User is not a hotel manager."
//       });
//     }
    
//     // Check if hotel already exists for this manager
//     const existingHotel = await Hotel.findOne({ manager_id: userId });
//     if (existingHotel) {
//       return res.status(400).json({
//         success: false,
//         message: "Hotel profile already exists for this manager"
//       });
//     }
    
//     // Create new hotel with proper relationships
//     const newHotel = new Hotel({
//       manager_id: userId,
//       manager_email: user.email,
//       hotel_details: hotelData.hotel_details,
//       room_types: hotelData.room_types || [],
//       image: hotelData.image || { base64: "" },
//       gallery: hotelData.gallery || []
//     });
    
//     await newHotel.save();
    
//     // Update user with hotel_id
//     user.hotel_id = newHotel._id;
//     user.profile_completed = true;
//     await user.save();
    
//     console.log(`✅ Created new hotel profile: ${newHotel._id}`);
    
//     res.status(201).json({
//       success: true,
//       message: "Hotel profile created successfully",
//       data: newHotel
//     });
//   } catch (error) {
//     console.error("❌ Error creating hotel profile:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while creating hotel profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// module.exports = { 
//   getHotelById: getHotelByUserId,
//   updateHotelProfile: updateHotelByUserId,
//   getCurrentHotelProfile,
//   getHotelBookingRequests,
//   handleHotelBookingRequest,
//   getHotelBookingHistory,
//   getHotelDashboardStats,
//   // New endpoints
//   getHotelByManagerEmail,
//   getHotelByManagerId,
//   findHotelByManager,
//   createHotelProfile
// };







// const Hotel = require("../models/hotel");
// const User = require("../models/User");
// const BookingFormsData = require("../models/bookingformsdataModel");
// const ProfileBooking = require("../models/profileBooking");

// // Shared helper: find hotel for a given user using 3-method fallback
// async function findHotelForUser(user) {
//   const userId = user._id.toString();
//   let hotel = null;
//   // 1. user.hotel_id (fastest — pre-linked)
//   if (user.hotel_id) hotel = await Hotel.findById(user.hotel_id);
//   // 2. manager_id on hotel document
//   if (!hotel) hotel = await Hotel.findOne({ manager_id: userId });
//   // 3. email fallback (legacy data)
//   if (!hotel) hotel = await Hotel.findOne({
//     $or: [
//       { manager_email: user.email },
//       { "hotel_details.email": user.email },
//       { "hotel_details.username": user.email }
//     ]
//   });
//   // Back-fill relationships for future lookups
//   if (hotel) {
//     let dirty = false;
//     if (!hotel.manager_id || hotel.manager_id.toString() !== userId) {
//       hotel.manager_id = userId;
//       hotel.manager_email = user.email;
//       dirty = true;
//     }
//     if (!user.hotel_id || user.hotel_id.toString() !== hotel._id.toString()) {
//       user.hotel_id = hotel._id;
//       await user.save();
//     }
//     if (dirty) await hotel.save();
//   }
//   return hotel;
// }

// // @desc    Get hotel profile by User ID (from token)
// // @route   GET /api/hoteldashboard/:userId
// // @access  Private (only hotel)
// const getHotelByUserId = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     console.log(`🔍 Fetching hotel data for user ID: ${userId}`);
    
//     // Validate userId format
//     if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
//       console.log(`❌ Invalid user ID format: ${userId}`);
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid user ID format" 
//       });
//     }
    
//     // First, verify the user exists and has hotel role
//     const user = await User.findById(userId);
//     if (!user) {
//       console.log(`❌ User not found with ID: ${userId}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     console.log(`✅ User found: ${user.fullName}, Role: ${user.role}`);
    
//     if (user.role !== 'hotel') {
//       console.log(`❌ Access denied. User role is '${user.role}', not 'hotel'`);
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }

//     // Try to find existing Hotel record by email or username
//     console.log(`🔍 Looking for hotel profile with email: ${user.email}`);
//     let hotel = await Hotel.findOne({ 
//       $or: [
//         { "hotel_details.email": user.email },
//         { "hotel_details.username": user.email }
//       ]
//     });

//     // If no Hotel record exists, create a default one
//     if (!hotel) {
//       console.log(`📝 No hotel profile found. Creating default profile for: ${user.email}`);
      
//       // Generate unique username
//       const baseUsername = user.email.split('@')[0] + '_hotel';
//       let username = baseUsername;
//       let counter = 1;
      
//       // Ensure username is unique
//       while (await Hotel.findOne({ "hotel_details.username": username })) {
//         username = `${baseUsername}_${counter}`;
//         counter++;
//       }
      
//       hotel = new Hotel({
//         hotel_details: {
//           hotel_name: user.fullName + "'s Hotel",
//           description: "Welcome to our hotel",
//           location: {
//             district: "Not specified",
//             pincode: 0
//           },
//           contact: "Not specified",
//           email: user.email,
//           check_in_time: "14:00",
//           check_out_time: "11:00",
//           rating: 0,
//           amenities: ["WiFi", "Parking"],
//           username: username,
//           password: 'temp_password_' + Date.now(),
//         },
//         room_types: [
//           {
//             type: "Standard Room",
//             price_per_night: "2000",
//             features: ["AC", "TV", "WiFi"]
//           }
//         ],
//         image: {
//           base64: ""
//         }
//       });
      
//       await hotel.save();
//       console.log(`✅ Created new hotel profile with ID: ${hotel._id}`);
      
//       // Return the hotel data
//       return res.json({
//         success: true,
//         data: {
//           _id: hotel._id,
//           hotel_details: hotel.hotel_details,
//           room_types: hotel.room_types,
//           image: hotel.image,
//           gallery: hotel.gallery || [],
//           managerId: userId // Link to user
//         }
//       });
//     }

//     console.log(`✅ Found existing hotel profile: ${hotel.hotel_details.hotel_name}`);
//     res.json({
//       success: true,
//       data: {
//         _id: hotel._id,
//         hotel_details: hotel.hotel_details,
//         room_types: hotel.room_types,
//         image: hotel.image,
//         gallery: hotel.gallery || [],
//         managerId: userId // Link to user
//       }
//     });
//   } catch (error) {
//     console.error("❌ Error fetching hotel:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching hotel profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Update hotel profile by User ID
// // @route   PUT /api/hoteldashboard/:userId
// // @access  Private (only hotel)
// const updateHotelByUserId = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const updateData = req.body;
//     console.log(`🔄 Updating hotel profile for user ID: ${userId}`);
    
//     // Validate userId format
//     if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
//       console.log(`❌ Invalid user ID format: ${userId}`);
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid user ID format" 
//       });
//     }
    
//     // First, verify the user exists and has hotel role
//     const user = await User.findById(userId);
//     if (!user) {
//       console.log(`❌ User not found with ID: ${userId}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     console.log(`✅ User found: ${user.fullName}, Role: ${user.role}`);
    
//     if (user.role !== 'hotel') {
//       console.log(`❌ Access denied. User role is '${user.role}', not 'hotel'`);
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }

//     // Find the Hotel record using the same 3-method lookup as getCurrentHotelProfile
//     let hotel = null;
    
//     // Method 1: user.hotel_id (fastest)
//     if (user.hotel_id) {
//       hotel = await Hotel.findById(user.hotel_id);
//     }
    
//     // Method 2: manager_id
//     if (!hotel) {
//       hotel = await Hotel.findOne({ manager_id: userId });
//     }
    
//     // Method 3: email fallback
//     if (!hotel) {
//       hotel = await Hotel.findOne({
//         $or: [
//           { manager_email: user.email },
//           { "hotel_details.email": user.email },
//           { "hotel_details.username": user.email }
//         ]
//       });
//       // Back-fill relationships if found via email
//       if (hotel) {
//         hotel.manager_id = userId;
//         hotel.manager_email = user.email;
//         user.hotel_id = hotel._id;
//         await Promise.all([hotel.save(), user.save()]);
//       }
//     }
    
//     if (!hotel) {
//       console.log(`❌ Hotel profile not found for email: ${user.email}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "Hotel profile not found. Please refresh the page." 
//       });
//     }
    
//     console.log(`📝 Updating hotel profile: ${hotel.hotel_details.hotel_name}`);
    
//     // Update allowed fields
//     const updateFields = {};
    
//     if (updateData.hotel_details) {
//       const allowedHotelFields = ['hotel_name', 'description', 'location', 'contact', 'check_in_time', 'check_out_time', 'amenities'];
//       allowedHotelFields.forEach(field => {
//         if (updateData.hotel_details[field] !== undefined) {
//           if (!updateFields.hotel_details) updateFields.hotel_details = {};
//           updateFields.hotel_details[field] = updateData.hotel_details[field];
//           console.log(`📝 Updating hotel_details.${field}`);
//         }
//       });
//     }
    
//     if (updateData.room_types) {
//       updateFields.room_types = updateData.room_types;
//       console.log(`📝 Updating room_types`);
//     }
    
//     if (updateData.image) {
//       updateFields.image = updateData.image;
//       console.log(`📝 Updating image`);
//     }
    
//     if (updateData.gallery) {
//       updateFields.gallery = updateData.gallery;
//       console.log(`📝 Updating gallery with ${updateData.gallery.length} images`);
//     }
    
//     if (Object.keys(updateFields).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No valid fields provided for update"
//       });
//     }
    
//     const updatedHotel = await Hotel.findByIdAndUpdate(
//       hotel._id,
//       updateFields,
//       { new: true, runValidators: true }
//     );
    
//     console.log(`✅ Successfully updated hotel profile: ${updatedHotel.hotel_details.hotel_name}`);
    
//     res.json({
//       success: true,
//       message: "Hotel profile updated successfully",
//       data: {
//         _id: updatedHotel._id,
//         hotel_details: updatedHotel.hotel_details,
//         room_types: updatedHotel.room_types,
//         image: updatedHotel.image,
//         gallery: updatedHotel.gallery || [],
//         managerId: userId
//       }
//     });
    
//   } catch (error) {
//     console.error("❌ Error updating hotel profile:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while updating hotel profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Get current user's hotel profile from token
// // @route   GET /api/hoteldashboard/me
// // @access  Private (only hotel)
// const getCurrentHotelProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // From JWT token
//     console.log(`🔍 Fetching current user's hotel profile. User ID: ${userId}`);
    
//     // Verify the user exists and has hotel role (should be already verified by middleware)
//     const user = await User.findById(userId);
//     if (!user) {
//       console.log(`❌ User not found with ID: ${userId}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     if (user.role !== 'hotel') {
//       console.log(`❌ Access denied. User role is '${user.role}', not 'hotel'`);
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }

//     // 🔧 NEW: Try to find hotel using proper relationship first
//     let hotel = null;
    
//     // Method 1: Use user.hotel_id if it exists (proper relationship)
//     if (user.hotel_id) {
//       console.log(`🔍 Looking for hotel by hotel_id: ${user.hotel_id}`);
//       hotel = await Hotel.findById(user.hotel_id);
//       if (hotel) {
//         console.log(`✅ Found hotel via hotel_id: ${hotel.hotel_details.hotel_name}`);
//       }
//     }
    
//     // Method 2: Use manager_id relationship (new approach)
//     if (!hotel) {
//       console.log(`🔍 Looking for hotel by manager_id: ${userId}`);
//       hotel = await Hotel.findOne({ manager_id: userId });
//       if (hotel) {
//         console.log(`✅ Found hotel via manager_id: ${hotel.hotel_details.hotel_name}`);
//         // Update user.hotel_id for future lookups
//         user.hotel_id = hotel._id;
//         await user.save();
//       }
//     }
    
//     // Method 3: Fallback to email matching (legacy)
//     if (!hotel) {
//       console.log(`🔍 Fallback: Looking for hotel by email: ${user.email}`);
//       hotel = await Hotel.findOne({ 
//         $or: [
//           { manager_email: user.email },
//           { "hotel_details.email": user.email },
//           { "hotel_details.username": user.email }
//         ]
//       });
//       if (hotel) {
//         console.log(`✅ Found hotel via email matching: ${hotel.hotel_details.hotel_name}`);
//         // Update relationships for future lookups
//         hotel.manager_id = userId;
//         hotel.manager_email = user.email;
//         user.hotel_id = hotel._id;
//         await Promise.all([hotel.save(), user.save()]);
//       }
//     }

//     // If no Hotel record exists, create a default one with proper relationships
//     if (!hotel) {
//       console.log(`📝 No hotel profile found. Creating default profile for: ${user.email}`);
      
//       const baseUsername = user.email.split('@')[0] + '_hotel';
//       let username = baseUsername;
//       let counter = 1;
      
//       while (await Hotel.findOne({ "hotel_details.username": username })) {
//         username = `${baseUsername}_${counter}`;
//         counter++;
//       }
      
//       hotel = new Hotel({
//         // 🔧 NEW: Proper relationship fields
//         manager_id: userId,
//         manager_email: user.email,
        
//         hotel_details: {
//           hotel_name: user.fullName + "'s Hotel",
//           description: "Welcome to our hotel",
//           location: {
//             district: "Not specified",
//             pincode: 0
//           },
//           contact: "Not specified",
//           email: user.email,
//           check_in_time: "14:00",
//           check_out_time: "11:00",
//           rating: 0,
//           amenities: ["WiFi", "Parking"],
//           username: username,
//           password: 'temp_password_' + Date.now(),
//         },
//         room_types: [
//           {
//             type: "Standard Room",
//             price_per_night: "2000",
//             features: ["AC", "TV", "WiFi"]
//           }
//         ],
//         image: {
//           base64: ""
//         }
//       });
      
//       await hotel.save();
      
//       // 🔧 NEW: Update user with hotel_id
//       user.hotel_id = hotel._id;
//       user.profile_completed = false; // Hotel manager needs to complete profile
//       await user.save();
      
//       console.log(`✅ Created new hotel profile with ID: ${hotel._id} and linked to user ${userId}`);
//     } else {
//       console.log(`✅ Found existing hotel profile: ${hotel.hotel_details.hotel_name}`);
      
//       // 🔧 NEW: Ensure relationships are properly set
//       if (!user.hotel_id) {
//         user.hotel_id = hotel._id;
//         await user.save();
//         console.log(`✅ Updated user ${userId} with hotel_id: ${hotel._id}`);
//       }
//       if (!hotel.manager_id) {
//         hotel.manager_id = userId;
//         hotel.manager_email = user.email;
//         await hotel.save();
//         console.log(`✅ Updated hotel ${hotel._id} with manager_id: ${userId}`);
//       }
//     }

//     res.json({
//       success: true,
//       data: {
//         _id: hotel._id,
//         hotel_details: hotel.hotel_details,
//         room_types: hotel.room_types,
//         image: hotel.image,
//         gallery: hotel.gallery || [],
//         managerId: userId
//       }
//     });
//   } catch (error) {
//     console.error("❌ Error fetching current hotel profile:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching hotel profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get all booking requests for the current hotel
// const getHotelBookingRequests = async (req, res) => {
//   try {
//     const userId = req.user.id; // From JWT token
//     console.log(`🔍 Fetching booking requests for hotel manager user ID: ${userId}`);
    
//     // First, verify the user exists and has hotel role
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     if (user.role !== 'hotel') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }

//     // Find the hotel associated with this user (3-method lookup)
//     let hotel = null;
//     if (user.hotel_id) hotel = await Hotel.findById(user.hotel_id);
//     if (!hotel) hotel = await Hotel.findOne({ manager_id: userId });
//     if (!hotel) hotel = await Hotel.findOne({
//       $or: [
//         { manager_email: user.email },
//         { "hotel_details.email": user.email },
//         { "hotel_details.username": user.email }
//       ]
//     });
    
//     if (!hotel) {
//       return res.status(404).json({ success: false, message: "Hotel profile not found" });
//     }

//     const bookingRequests = await BookingFormsData.find({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name },
//         { 
//           'hotel.name': { $regex: hotel.hotel_details.hotel_name, $options: 'i' },
//           'hotel.managerId': { $exists: false }
//         }
//       ],
//       status: { $in: ['pending', 'agent_confirmed'] },
//       hotelConfirmed: false
//     })
//     .populate('userId', 'fullName email phone')
//     .sort({ createdAt: -1 })
//     .lean();
    
//     console.log(`✅ Found ${bookingRequests.length} booking requests for hotel: ${hotel.hotel_details.hotel_name}`);
    
//     // Transform data for hotel dashboard
//     const transformedRequests = bookingRequests.map(booking => ({
//       _id: booking._id,
//       bookingId: booking.bookingId,
//       tourName: booking.tourName,
//       touristPlaces: booking.touristPlaces,
      
//       // Customer details
//       customer: {
//         name: booking.user.fullName,
//         email: booking.tourist.email,
//         phone: booking.tourist.phone,
//         address: booking.user.address
//       },
      
//       // Trip details
//       tripDetails: {
//         travelers: booking.tourist.totalTravellers,
//         checkIn: booking.hotel.fromDate,
//         checkOut: booking.hotel.toDate,
//         duration: booking.tourDuration,
//         places: booking.touristPlaces
//       },
      
//       // Agent details
//       agent: {
//         name: booking.agent.name,
//         experience: booking.agent.experience,
//         location: booking.agent.location,
//         languages: booking.agent.languages
//       },
      
//       // Financial details
//       payment: {
//         totalAmount: booking.payment.totalAmount,
//         status: booking.payment.status
//       },
      
//       // Booking status
//       status: booking.status,
//       agentConfirmed: booking.agentConfirmed,
//       specialRequests: booking.specialRequests,
      
//       // Dates
//       requestedAt: booking.createdAt,
//       updatedAt: booking.updatedAt
//     }));
    
//     res.json({
//       success: true,
//       requests: transformedRequests,
//       count: transformedRequests.length,
//       hotelInfo: {
//         name: hotel.hotel_details.hotel_name,
//         id: hotel._id
//       }
//     });
    
//   } catch (error) {
//     console.error("❌ Error fetching hotel booking requests:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching booking requests",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Confirm or reject a booking request by hotel
// const handleHotelBookingRequest = async (req, res) => {
//   try {
//     const userId = req.user.id; // From JWT token
//     const { bookingId } = req.params;
//     const { action, notes } = req.body; // action: 'accept' | 'reject', notes: optional
    
//     console.log(`🔄 Hotel manager ${userId} handling booking ${bookingId} with action: ${action}`);
    
//     // Verify user is a hotel manager
//     const user = await User.findById(userId);
//     if (!user || user.role !== 'hotel') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }
    
//     // Find the hotel
//     const hotel = await findHotelForUser(user);

//     if (!hotel) {
//       return res.status(404).json({ success: false, message: "Hotel profile not found" });
//     }

//     const booking = await BookingFormsData.findOne({ 
//       bookingId: bookingId,
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name },
//         { 'hotel.name': { $regex: hotel.hotel_details.hotel_name, $options: 'i' } }
//       ]
//     });
    
//     if (!booking) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Booking not found or not assigned to your hotel" 
//       });
//     }
    
//     if (booking.hotelConfirmed) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Booking already processed by hotel" 
//       });
//     }
    
//     if (action === 'accept') {
//       // Accept the booking
//       booking.hotelConfirmed = true;
//       booking.hotelConfirmedAt = new Date();
      
//       // Set hotel manager ID if not already set
//       if (!booking.hotel.managerId) {
//         booking.hotel.managerId = userId;
//       }
      
//       // Update status based on agent confirmation
//       if (booking.agentConfirmed) {
//         booking.status = "confirmed";
//       } else {
//         booking.status = "hotel_confirmed";
//       }
      
//       // Add notes if provided
//       if (notes) {
//         booking.specialRequests = (booking.specialRequests || "") + `\n[Hotel Notes]: ${notes}`;
//       }
      
//       await booking.save();
      
//       // Update profile booking
//       await ProfileBooking.findOneAndUpdate(
//         { bookingId: bookingId },
//         { 
//           status: booking.agentConfirmed ? "Upcoming" : "Upcoming",
//           'hotel.contact': hotel.hotel_details.contact,
//           'hotel.email': hotel.hotel_details.email
//         }
//       );
      
//       console.log(`✅ Booking ${bookingId} accepted by hotel`);
      
//       res.json({
//         success: true,
//         message: "Booking request accepted successfully!",
//         booking: {
//           bookingId: booking.bookingId,
//           status: booking.status,
//           hotelConfirmed: booking.hotelConfirmed
//         }
//       });
      
//     } else if (action === 'reject') {
//       // Reject the booking
//       booking.status = "cancelled";
      
//       if (notes) {
//         booking.specialRequests = (booking.specialRequests || "") + `\n[Hotel Rejection]: ${notes}`;
//       }
      
//       await booking.save();
      
//       // Update profile booking
//       await ProfileBooking.findOneAndUpdate(
//         { bookingId: bookingId },
//         { status: "Cancelled" }
//       );
      
//       console.log(`❌ Booking ${bookingId} rejected by hotel`);
      
//       res.json({
//         success: true,
//         message: "Booking request rejected.",
//         booking: {
//           bookingId: booking.bookingId,
//           status: booking.status
//         }
//       });
      
//     } else {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid action. Use 'accept' or 'reject'." 
//       });
//     }
    
//   } catch (error) {
//     console.error("❌ Error handling hotel booking request:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while processing booking request",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get hotel's booking history (accepted bookings)
// const getHotelBookingHistory = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const user = await User.findById(userId);
//     if (!user || user.role !== 'hotel') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }
    
//     // Find the hotel
//     const hotel = await findHotelForUser(user);

//     if (!hotel) {
//       return res.status(404).json({ success: false, message: "Hotel profile not found" });
//     }
    
//     const bookingHistory = await BookingFormsData.find({
//       $and: [
//         {
//           $or: [
//             { 'hotel.managerId': userId },
//             { 'hotel.name': hotel.hotel_details.hotel_name }
//           ]
//         },
//         {
//           $or: [
//             { hotelConfirmed: true },
//             { status: 'cancelled' }
//           ]
//         }
//       ]
//     })
//     .populate('userId', 'fullName email phone')
//     .sort({ updatedAt: -1, hotelConfirmedAt: -1 })
//     .lean();
    
//     const transformedHistory = bookingHistory.map(booking => ({
//       bookingId: booking.bookingId,
//       tourName: booking.tourName,
//       customer: booking.user.fullName,
//       travelers: booking.tourist.totalTravellers,
//       amount: booking.payment.totalAmount,
//       status: booking.status,
//       confirmedAt: booking.hotelConfirmedAt || booking.updatedAt,
//       checkInDate: booking.hotel.fromDate,
//       checkOutDate: booking.hotel.toDate,
//       agent: booking.agent.name || 'Not assigned'
//     }));
    
//     res.json({
//       success: true,
//       history: transformedHistory,
//       count: transformedHistory.length
//     });
    
//   } catch (error) {
//     console.error("❌ Error fetching hotel booking history:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching booking history",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get hotel dashboard statistics
// const getHotelDashboardStats = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const user = await User.findById(userId);
//     if (!user || user.role !== 'hotel') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }
    
//     // Find the hotel
//     const hotel = await findHotelForUser(user);

//     if (!hotel) {
//       return res.status(404).json({ success: false, message: "Hotel profile not found" });
//     }
    
//     // Get statistics
//     const totalBookings = await BookingFormsData.countDocuments({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name }
//       ]
//     });
    
//     const pendingRequests = await BookingFormsData.countDocuments({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name }
//       ],
//       hotelConfirmed: false,
//       status: { $in: ['pending', 'agent_confirmed'] }
//     });
    
//     const confirmedBookings = await BookingFormsData.countDocuments({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name }
//       ],
//       hotelConfirmed: true,
//       status: { $in: ['confirmed', 'hotel_confirmed'] }
//     });
    
//     const cancelledBookings = await BookingFormsData.countDocuments({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name }
//       ],
//       status: 'cancelled'
//     });
    
//     // Calculate total revenue
//     const revenueData = await BookingFormsData.aggregate([
//       {
//         $match: {
//           $or: [
//             { 'hotel.managerId': userId },
//             { 'hotel.name': hotel.hotel_details.hotel_name }
//           ],
//           hotelConfirmed: true,
//           'payment.status': 'completed'
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalRevenue: { $sum: '$payment.totalAmount' }
//         }
//       }
//     ]);
    
//     const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
//     res.json({
//       success: true,
//       stats: {
//         totalBookings,
//         pendingRequests,
//         confirmedBookings,
//         cancelledBookings,
//         totalRevenue,
//         hotelRating: hotel.hotel_details.rating || 0
//       }
//     });
    
//   } catch (error) {
//     console.error("❌ Error fetching hotel dashboard stats:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching dashboard statistics",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // 🔧 NEW: Additional endpoints for frontend compatibility

// // @desc    Get hotel by manager email
// // @route   GET /api/hoteldashboard/by-manager/:email
// // @access  Private (only hotel)
// const getHotelByManagerEmail = async (req, res) => {
//   try {
//     const email = decodeURIComponent(req.params.email);
//     console.log(`🔍 Finding hotel by manager email: ${email}`);
    
//     const hotel = await Hotel.findOne({
//       $or: [
//         { manager_email: email },
//         { "hotel_details.email": email },
//         { "hotel_details.username": email }
//       ]
//     });
    
//     if (!hotel) {
//       return res.status(404).json({
//         success: false,
//         message: "No hotel found for this manager email"
//       });
//     }
    
//     res.json({
//       success: true,
//       data: hotel
//     });
//   } catch (error) {
//     console.error("❌ Error finding hotel by manager email:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Get hotel by manager ID
// // @route   GET /api/hoteldashboard/by-manager-id/:userId
// // @access  Private (only hotel)
// const getHotelByManagerId = async (req, res) => {
//   try {
//     const managerId = req.params.userId;
//     console.log(`🔍 Finding hotel by manager ID: ${managerId}`);
    
//     const hotel = await Hotel.findOne({ manager_id: managerId });
    
//     if (!hotel) {
//       return res.status(404).json({
//         success: false,
//         message: "No hotel found for this manager ID"
//       });
//     }
    
//     res.json({
//       success: true,
//       data: hotel
//     });
//   } catch (error) {
//     console.error("❌ Error finding hotel by manager ID:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Find hotel by manager (flexible search)
// // @route   POST /api/hoteldashboard/find-by-manager
// // @access  Private (only hotel)
// const findHotelByManager = async (req, res) => {
//   try {
//     const { managerEmail, managerId, managerRole } = req.body;
//     console.log(`🔍 Flexible hotel search:`, { managerEmail, managerId, managerRole });
    
//     let hotel = null;
    
//     // Try manager_id first (most reliable)
//     if (managerId) {
//       hotel = await Hotel.findOne({ manager_id: managerId });
//     }
    
//     // Fallback to email if no hotel found
//     if (!hotel && managerEmail) {
//       hotel = await Hotel.findOne({
//         $or: [
//           { manager_email: managerEmail },
//           { "hotel_details.email": managerEmail },
//           { "hotel_details.username": managerEmail }
//         ]
//       });
//     }
    
//     if (!hotel) {
//       return res.status(404).json({
//         success: false,
//         message: "No hotel found for this manager"
//       });
//     }
    
//     res.json({
//       success: true,
//       data: hotel
//     });
//   } catch (error) {
//     console.error("❌ Error in flexible hotel search:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Create new hotel profile
// // @route   POST /api/hoteldashboard/create
// // @access  Private (only hotel)
// const createHotelProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const hotelData = req.body;
    
//     console.log(`📝 Creating new hotel profile for user: ${userId}`);
    
//     // Verify user exists and has hotel role
//     const user = await User.findById(userId);
//     if (!user || user.role !== 'hotel') {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied. User is not a hotel manager."
//       });
//     }
    
//     // Check if hotel already exists for this manager
//     const existingHotel = await Hotel.findOne({ manager_id: userId });
//     if (existingHotel) {
//       return res.status(400).json({
//         success: false,
//         message: "Hotel profile already exists for this manager"
//       });
//     }
    
//     // Create new hotel with proper relationships
//     const newHotel = new Hotel({
//       manager_id: userId,
//       manager_email: user.email,
//       hotel_details: hotelData.hotel_details,
//       room_types: hotelData.room_types || [],
//       image: hotelData.image || { base64: "" },
//       gallery: hotelData.gallery || []
//     });
    
//     await newHotel.save();
    
//     // Update user with hotel_id
//     user.hotel_id = newHotel._id;
//     user.profile_completed = true;
//     await user.save();
    
//     console.log(`✅ Created new hotel profile: ${newHotel._id}`);
    
//     res.status(201).json({
//       success: true,
//       message: "Hotel profile created successfully",
//       data: newHotel
//     });
//   } catch (error) {
//     console.error("❌ Error creating hotel profile:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while creating hotel profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// module.exports = { 
//   getHotelById: getHotelByUserId,
//   updateHotelProfile: updateHotelByUserId,
//   getCurrentHotelProfile,
//   getHotelBookingRequests,
//   handleHotelBookingRequest,
//   getHotelBookingHistory,
//   getHotelDashboardStats,
//   // New endpoints
//   getHotelByManagerEmail,
//   getHotelByManagerId,
//   findHotelByManager,
//   createHotelProfile
// };






// const Hotel = require("../models/hotel");
// const User = require("../models/User");
// const BookingFormsData = require("../models/bookingformsdataModel");
// const ProfileBooking = require("../models/profileBooking");

// // @desc    Get hotel profile by User ID (from token)
// // @route   GET /api/hoteldashboard/:userId
// // @access  Private (only hotel)
// const getHotelByUserId = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     console.log(`🔍 Fetching hotel data for user ID: ${userId}`);
    
//     // Validate userId format
//     if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
//       console.log(`❌ Invalid user ID format: ${userId}`);
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid user ID format" 
//       });
//     }
    
//     // First, verify the user exists and has hotel role
//     const user = await User.findById(userId);
//     if (!user) {
//       console.log(`❌ User not found with ID: ${userId}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     console.log(`✅ User found: ${user.fullName}, Role: ${user.role}`);
    
//     if (user.role !== 'hotel') {
//       console.log(`❌ Access denied. User role is '${user.role}', not 'hotel'`);
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }

//     // Try to find existing Hotel record by email or username
//     console.log(`🔍 Looking for hotel profile with email: ${user.email}`);
//     let hotel = await Hotel.findOne({ 
//       $or: [
//         { "hotel_details.email": user.email },
//         { "hotel_details.username": user.email }
//       ]
//     });

//     // If no Hotel record exists, create a default one
//     if (!hotel) {
//       console.log(`📝 No hotel profile found. Creating default profile for: ${user.email}`);
      
//       // Generate unique username
//       const baseUsername = user.email.split('@')[0] + '_hotel';
//       let username = baseUsername;
//       let counter = 1;
      
//       // Ensure username is unique
//       while (await Hotel.findOne({ "hotel_details.username": username })) {
//         username = `${baseUsername}_${counter}`;
//         counter++;
//       }
      
//       hotel = new Hotel({
//         hotel_details: {
//           hotel_name: user.fullName + "'s Hotel",
//           description: "Welcome to our hotel",
//           location: {
//             district: "Not specified",
//             pincode: 0
//           },
//           contact: "Not specified",
//           email: user.email,
//           check_in_time: "14:00",
//           check_out_time: "11:00",
//           rating: 0,
//           amenities: ["WiFi", "Parking"],
//           username: username,
//           password: 'temp_password_' + Date.now(),
//         },
//         room_types: [
//           {
//             type: "Standard Room",
//             price_per_night: "2000",
//             features: ["AC", "TV", "WiFi"]
//           }
//         ],
//         image: {
//           base64: ""
//         }
//       });
      
//       await hotel.save();
//       console.log(`✅ Created new hotel profile with ID: ${hotel._id}`);
      
//       // Return the hotel data
//       return res.json({
//         success: true,
//         data: {
//           _id: hotel._id,
//           hotel_details: hotel.hotel_details,
//           room_types: hotel.room_types,
//           image: hotel.image,
//           gallery: hotel.gallery || [],
//           managerId: userId // Link to user
//         }
//       });
//     }

//     console.log(`✅ Found existing hotel profile: ${hotel.hotel_details.hotel_name}`);
//     res.json({
//       success: true,
//       data: {
//         _id: hotel._id,
//         hotel_details: hotel.hotel_details,
//         room_types: hotel.room_types,
//         image: hotel.image,
//         gallery: hotel.gallery || [],
//         managerId: userId // Link to user
//       }
//     });
//   } catch (error) {
//     console.error("❌ Error fetching hotel:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching hotel profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Update hotel profile by User ID
// // @route   PUT /api/hoteldashboard/:userId
// // @access  Private (only hotel)
// const updateHotelByUserId = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const updateData = req.body;
//     console.log(`🔄 Updating hotel profile for user ID: ${userId}`);
    
//     // Validate userId format
//     if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
//       console.log(`❌ Invalid user ID format: ${userId}`);
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid user ID format" 
//       });
//     }
    
//     // First, verify the user exists and has hotel role
//     const user = await User.findById(userId);
//     if (!user) {
//       console.log(`❌ User not found with ID: ${userId}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     console.log(`✅ User found: ${user.fullName}, Role: ${user.role}`);
    
//     if (user.role !== 'hotel') {
//       console.log(`❌ Access denied. User role is '${user.role}', not 'hotel'`);
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }

//     // Find the Hotel record
//     let hotel = await Hotel.findOne({ 
//       $or: [
//         { "hotel_details.email": user.email },
//         { "hotel_details.username": user.email }
//       ]
//     });
    
//     if (!hotel) {
//       console.log(`❌ Hotel profile not found for email: ${user.email}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "Hotel profile not found. Please refresh the page." 
//       });
//     }
    
//     console.log(`📝 Updating hotel profile: ${hotel.hotel_details.hotel_name}`);
    
//     // Update allowed fields
//     const updateFields = {};
    
//     if (updateData.hotel_details) {
//       const allowedHotelFields = ['hotel_name', 'description', 'location', 'contact', 'check_in_time', 'check_out_time', 'amenities'];
//       allowedHotelFields.forEach(field => {
//         if (updateData.hotel_details[field] !== undefined) {
//           if (!updateFields.hotel_details) updateFields.hotel_details = {};
//           updateFields.hotel_details[field] = updateData.hotel_details[field];
//           console.log(`📝 Updating hotel_details.${field}`);
//         }
//       });
//     }
    
//     if (updateData.room_types) {
//       updateFields.room_types = updateData.room_types;
//       console.log(`📝 Updating room_types`);
//     }
    
//     if (updateData.image) {
//       updateFields.image = updateData.image;
//       console.log(`📝 Updating image`);
//     }
    
//     if (updateData.gallery) {
//       updateFields.gallery = updateData.gallery;
//       console.log(`📝 Updating gallery with ${updateData.gallery.length} images`);
//     }
    
//     if (Object.keys(updateFields).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No valid fields provided for update"
//       });
//     }
    
//     const updatedHotel = await Hotel.findByIdAndUpdate(
//       hotel._id,
//       updateFields,
//       { new: true, runValidators: true }
//     );
    
//     console.log(`✅ Successfully updated hotel profile: ${updatedHotel.hotel_details.hotel_name}`);
    
//     res.json({
//       success: true,
//       message: "Hotel profile updated successfully",
//       data: {
//         _id: updatedHotel._id,
//         hotel_details: updatedHotel.hotel_details,
//         room_types: updatedHotel.room_types,
//         image: updatedHotel.image,
//         gallery: updatedHotel.gallery || [],
//         managerId: userId
//       }
//     });
    
//   } catch (error) {
//     console.error("❌ Error updating hotel profile:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while updating hotel profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Get current user's hotel profile from token
// // @route   GET /api/hoteldashboard/me
// // @access  Private (only hotel)
// const getCurrentHotelProfile = async (req, res) => {
//   try {
//     const userId = req.user.id || req.user.userId; // support both JWT formats // From JWT token
//     console.log(`🔍 Fetching current user's hotel profile. User ID: ${userId}`);
    
//     // Verify the user exists and has hotel role (should be already verified by middleware)
//     const user = await User.findById(userId);
//     if (!user) {
//       console.log(`❌ User not found with ID: ${userId}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     if (user.role !== 'hotel') {
//       console.log(`❌ Access denied. User role is '${user.role}', not 'hotel'`);
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }

//     // 🔧 NEW: Try to find hotel using proper relationship first
//     let hotel = null;
    
//     // Method 1: Use user.hotel_id if it exists (proper relationship)
//     if (user.hotel_id) {
//       console.log(`🔍 Looking for hotel by hotel_id: ${user.hotel_id}`);
//       hotel = await Hotel.findById(user.hotel_id);
//       if (hotel) {
//         console.log(`✅ Found hotel via hotel_id: ${hotel.hotel_details.hotel_name}`);
//       }
//     }
    
//     // Method 2: Use manager_id relationship (new approach)
//     if (!hotel) {
//       console.log(`🔍 Looking for hotel by manager_id: ${userId}`);
//       hotel = await Hotel.findOne({ manager_id: userId });
//       if (hotel) {
//         console.log(`✅ Found hotel via manager_id: ${hotel.hotel_details.hotel_name}`);
//         // Update user.hotel_id for future lookups
//         user.hotel_id = hotel._id;
//         await user.save();
//       }
//     }
    
//     // Method 3: Fallback to email matching (legacy)
//     if (!hotel) {
//       console.log(`🔍 Fallback: Looking for hotel by email: ${user.email}`);
//       hotel = await Hotel.findOne({ 
//         $or: [
//           { manager_email: user.email },
//           { "hotel_details.email": user.email },
//           { "hotel_details.username": user.email }
//         ]
//       });
//       if (hotel) {
//         console.log(`✅ Found hotel via email matching: ${hotel.hotel_details.hotel_name}`);
//         // Update relationships for future lookups
//         hotel.manager_id = userId;
//         hotel.manager_email = user.email;
//         user.hotel_id = hotel._id;
//         await Promise.all([hotel.save(), user.save()]);
//       }
//     }

//     // If no Hotel record exists, create a default one with proper relationships
//     if (!hotel) {
//       console.log(`📝 No hotel profile found. Creating default profile for: ${user.email}`);
      
//       const baseUsername = user.email.split('@')[0] + '_hotel';
//       let username = baseUsername;
//       let counter = 1;
      
//       while (await Hotel.findOne({ "hotel_details.username": username })) {
//         username = `${baseUsername}_${counter}`;
//         counter++;
//       }
      
//       hotel = new Hotel({
//         // 🔧 NEW: Proper relationship fields
//         manager_id: userId,
//         manager_email: user.email,
        
//         hotel_details: {
//           hotel_name: user.fullName + "'s Hotel",
//           description: "Welcome to our hotel",
//           location: {
//             district: "Not specified",
//             pincode: 0
//           },
//           contact: "Not specified",
//           email: user.email,
//           check_in_time: "14:00",
//           check_out_time: "11:00",
//           rating: 0,
//           amenities: ["WiFi", "Parking"],
//           username: username,
//           password: 'temp_password_' + Date.now(),
//         },
//         room_types: [
//           {
//             type: "Standard Room",
//             price_per_night: "2000",
//             features: ["AC", "TV", "WiFi"]
//           }
//         ],
//         image: {
//           base64: ""
//         }
//       });
      
//       await hotel.save();
      
//       // 🔧 NEW: Update user with hotel_id
//       user.hotel_id = hotel._id;
//       user.profile_completed = false; // Hotel manager needs to complete profile
//       await user.save();
      
//       console.log(`✅ Created new hotel profile with ID: ${hotel._id} and linked to user ${userId}`);
//     } else {
//       console.log(`✅ Found existing hotel profile: ${hotel.hotel_details.hotel_name}`);
      
//       // 🔧 NEW: Ensure relationships are properly set
//       if (!user.hotel_id) {
//         user.hotel_id = hotel._id;
//         await user.save();
//         console.log(`✅ Updated user ${userId} with hotel_id: ${hotel._id}`);
//       }
//       if (!hotel.manager_id) {
//         hotel.manager_id = userId;
//         hotel.manager_email = user.email;
//         await hotel.save();
//         console.log(`✅ Updated hotel ${hotel._id} with manager_id: ${userId}`);
//       }
//     }

//     res.json({
//       success: true,
//       data: {
//         _id: hotel._id,
//         hotel_details: hotel.hotel_details,
//         room_types: hotel.room_types,
//         image: hotel.image,
//         gallery: hotel.gallery || [],
//         managerId: userId
//       }
//     });
//   } catch (error) {
//     console.error("❌ Error fetching current hotel profile:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching hotel profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get all booking requests for the current hotel
// const getHotelBookingRequests = async (req, res) => {
//   try {
//     const userId = req.user.id || req.user.userId; // support both JWT formats // From JWT token
//     console.log(`🔍 Fetching booking requests for hotel manager user ID: ${userId}`);
    
//     // First, verify the user exists and has hotel role
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     if (user.role !== 'hotel') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }

//     // Find the hotel associated with this user
//     const hotel = await Hotel.findOne({ 
//       $or: [
//         { "hotel_details.email": user.email },
//         { "hotel_details.username": user.email }
//       ]
//     });

//     if (!hotel) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Hotel profile not found" 
//       });
//     }

//     // Find bookings where this hotel is selected and waiting for hotel confirmation
//     const bookingRequests = await BookingFormsData.find({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name },
//         // Fallback: match by hotel name if managerId is not set
//         { 
//           'hotel.name': { $regex: hotel.hotel_details.hotel_name, $options: 'i' },
//           'hotel.managerId': { $exists: false }
//         }
//       ],
//       status: { $in: ['pending', 'agent_confirmed'] }, // Show bookings waiting for hotel confirmation
//       hotelConfirmed: false
//     })
//     .populate('userId', 'fullName email phone')
//     .sort({ createdAt: -1 })
//     .lean();
    
//     console.log(`✅ Found ${bookingRequests.length} booking requests for hotel: ${hotel.hotel_details.hotel_name}`);
    
//     // Transform data for hotel dashboard
//     const transformedRequests = bookingRequests.map(booking => ({
//       _id: booking._id,
//       bookingId: booking.bookingId,
//       tourName: booking.tourName,
//       touristPlaces: booking.touristPlaces,
      
//       // Customer details
//       customer: {
//         name: booking.user.fullName,
//         email: booking.tourist.email,
//         phone: booking.tourist.phone,
//         address: booking.user.address
//       },
      
//       // Trip details
//       tripDetails: {
//         travelers: booking.tourist.totalTravellers,
//         checkIn: booking.hotel.fromDate,
//         checkOut: booking.hotel.toDate,
//         duration: booking.tourDuration,
//         places: booking.touristPlaces
//       },
      
//       // Agent details
//       agent: {
//         name: booking.agent.name,
//         experience: booking.agent.experience,
//         location: booking.agent.location,
//         languages: booking.agent.languages
//       },
      
//       // Financial details
//       payment: {
//         totalAmount: booking.payment.totalAmount,
//         status: booking.payment.status
//       },
      
//       // Booking status
//       status: booking.status,
//       agentConfirmed: booking.agentConfirmed,
//       specialRequests: booking.specialRequests,
      
//       // Dates
//       requestedAt: booking.createdAt,
//       updatedAt: booking.updatedAt
//     }));
    
//     res.json({
//       success: true,
//       requests: transformedRequests,
//       count: transformedRequests.length,
//       hotelInfo: {
//         name: hotel.hotel_details.hotel_name,
//         id: hotel._id
//       }
//     });
    
//   } catch (error) {
//     console.error("❌ Error fetching hotel booking requests:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching booking requests",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Confirm or reject a booking request by hotel
// const handleHotelBookingRequest = async (req, res) => {
//   try {
//     const userId = req.user.id || req.user.userId; // support both JWT formats // From JWT token
//     const { bookingId } = req.params;
//     const { action, notes } = req.body; // action: 'accept' | 'reject', notes: optional
    
//     console.log(`🔄 Hotel manager ${userId} handling booking ${bookingId} with action: ${action}`);
    
//     // Verify user is a hotel manager
//     const user = await User.findById(userId);
//     if (!user || user.role !== 'hotel') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }
    
//     // Find the hotel
//     const hotel = await Hotel.findOne({ 
//       $or: [
//         { "hotel_details.email": user.email },
//         { "hotel_details.username": user.email }
//       ]
//     });

//     if (!hotel) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Hotel profile not found" 
//       });
//     }
    
//     // Find the booking
//     const booking = await BookingFormsData.findOne({ 
//       bookingId: bookingId,
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name },
//         { 'hotel.name': { $regex: hotel.hotel_details.hotel_name, $options: 'i' } }
//       ]
//     });
    
//     if (!booking) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Booking not found or not assigned to your hotel" 
//       });
//     }
    
//     if (booking.hotelConfirmed) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Booking already processed by hotel" 
//       });
//     }
    
//     if (action === 'accept') {
//       // Accept the booking
//       booking.hotelConfirmed = true;
//       booking.hotelConfirmedAt = new Date();
      
//       // Set hotel manager ID if not already set
//       if (!booking.hotel.managerId) {
//         booking.hotel.managerId = userId;
//       }
      
//       // Update status based on agent confirmation
//       if (booking.agentConfirmed) {
//         booking.status = "confirmed";
//       } else {
//         booking.status = "hotel_confirmed";
//       }
      
//       // Add notes if provided
//       if (notes) {
//         booking.specialRequests = (booking.specialRequests || "") + `\n[Hotel Notes]: ${notes}`;
//       }
      
//       await booking.save();
      
//       // Update profile booking
//       await ProfileBooking.findOneAndUpdate(
//         { bookingId: bookingId },
//         { 
//           status: booking.agentConfirmed ? "Upcoming" : "Upcoming",
//           'hotel.contact': hotel.hotel_details.contact,
//           'hotel.email': hotel.hotel_details.email
//         }
//       );
      
//       console.log(`✅ Booking ${bookingId} accepted by hotel`);
      
//       res.json({
//         success: true,
//         message: "Booking request accepted successfully!",
//         booking: {
//           bookingId: booking.bookingId,
//           status: booking.status,
//           hotelConfirmed: booking.hotelConfirmed
//         }
//       });
      
//     } else if (action === 'reject') {
//       // Reject the booking
//       booking.status = "cancelled";
      
//       if (notes) {
//         booking.specialRequests = (booking.specialRequests || "") + `\n[Hotel Rejection]: ${notes}`;
//       }
      
//       await booking.save();
      
//       // Update profile booking
//       await ProfileBooking.findOneAndUpdate(
//         { bookingId: bookingId },
//         { status: "Cancelled" }
//       );
      
//       console.log(`❌ Booking ${bookingId} rejected by hotel`);
      
//       res.json({
//         success: true,
//         message: "Booking request rejected.",
//         booking: {
//           bookingId: booking.bookingId,
//           status: booking.status
//         }
//       });
      
//     } else {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid action. Use 'accept' or 'reject'." 
//       });
//     }
    
//   } catch (error) {
//     console.error("❌ Error handling hotel booking request:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while processing booking request",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get hotel's booking history (accepted bookings)
// const getHotelBookingHistory = async (req, res) => {
//   try {
//     const userId = req.user.id || req.user.userId; // support both JWT formats
    
//     const user = await User.findById(userId);
//     if (!user || user.role !== 'hotel') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }
    
//     // Find the hotel
//     const hotel = await Hotel.findOne({ 
//       $or: [
//         { "hotel_details.email": user.email },
//         { "hotel_details.username": user.email }
//       ]
//     });

//     if (!hotel) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Hotel profile not found" 
//       });
//     }
    
//     const bookingHistory = await BookingFormsData.find({
//       $and: [
//         {
//           $or: [
//             { 'hotel.managerId': userId },
//             { 'hotel.name': hotel.hotel_details.hotel_name }
//           ]
//         },
//         {
//           $or: [
//             { hotelConfirmed: true },
//             { status: 'cancelled' }
//           ]
//         }
//       ]
//     })
//     .populate('userId', 'fullName email phone')
//     .sort({ updatedAt: -1, hotelConfirmedAt: -1 })
//     .lean();
    
//     const transformedHistory = bookingHistory.map(booking => ({
//       bookingId: booking.bookingId,
//       tourName: booking.tourName,
//       customer: booking.user.fullName,
//       travelers: booking.tourist.totalTravellers,
//       amount: booking.payment.totalAmount,
//       status: booking.status,
//       confirmedAt: booking.hotelConfirmedAt || booking.updatedAt,
//       checkInDate: booking.hotel.fromDate,
//       checkOutDate: booking.hotel.toDate,
//       agent: booking.agent.name || 'Not assigned'
//     }));
    
//     res.json({
//       success: true,
//       history: transformedHistory,
//       count: transformedHistory.length
//     });
    
//   } catch (error) {
//     console.error("❌ Error fetching hotel booking history:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching booking history",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get hotel dashboard statistics
// const getHotelDashboardStats = async (req, res) => {
//   try {
//     const userId = req.user.id || req.user.userId; // support both JWT formats
    
//     const user = await User.findById(userId);
//     if (!user || user.role !== 'hotel') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a hotel manager." 
//       });
//     }
    
//     // Find the hotel
//     const hotel = await Hotel.findOne({ 
//       $or: [
//         { "hotel_details.email": user.email },
//         { "hotel_details.username": user.email }
//       ]
//     });

//     if (!hotel) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Hotel profile not found" 
//       });
//     }
    
//     // Get statistics
//     const totalBookings = await BookingFormsData.countDocuments({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name }
//       ]
//     });
    
//     const pendingRequests = await BookingFormsData.countDocuments({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name }
//       ],
//       hotelConfirmed: false,
//       status: { $in: ['pending', 'agent_confirmed'] }
//     });
    
//     const confirmedBookings = await BookingFormsData.countDocuments({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name }
//       ],
//       hotelConfirmed: true,
//       status: { $in: ['confirmed', 'hotel_confirmed'] }
//     });
    
//     const cancelledBookings = await BookingFormsData.countDocuments({
//       $or: [
//         { 'hotel.managerId': userId },
//         { 'hotel.name': hotel.hotel_details.hotel_name }
//       ],
//       status: 'cancelled'
//     });
    
//     // Calculate total revenue
//     const revenueData = await BookingFormsData.aggregate([
//       {
//         $match: {
//           $or: [
//             { 'hotel.managerId': userId },
//             { 'hotel.name': hotel.hotel_details.hotel_name }
//           ],
//           hotelConfirmed: true,
//           'payment.status': 'completed'
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalRevenue: { $sum: '$payment.totalAmount' }
//         }
//       }
//     ]);
    
//     const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
//     res.json({
//       success: true,
//       stats: {
//         totalBookings,
//         pendingRequests,
//         confirmedBookings,
//         cancelledBookings,
//         totalRevenue,
//         hotelRating: hotel.hotel_details.rating || 0
//       }
//     });
    
//   } catch (error) {
//     console.error("❌ Error fetching hotel dashboard stats:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching dashboard statistics",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // 🔧 NEW: Additional endpoints for frontend compatibility

// // @desc    Get hotel by manager email
// // @route   GET /api/hoteldashboard/by-manager/:email
// // @access  Private (only hotel)
// const getHotelByManagerEmail = async (req, res) => {
//   try {
//     const email = decodeURIComponent(req.params.email);
//     console.log(`🔍 Finding hotel by manager email: ${email}`);
    
//     const hotel = await Hotel.findOne({
//       $or: [
//         { manager_email: email },
//         { "hotel_details.email": email },
//         { "hotel_details.username": email }
//       ]
//     });
    
//     if (!hotel) {
//       return res.status(404).json({
//         success: false,
//         message: "No hotel found for this manager email"
//       });
//     }
    
//     res.json({
//       success: true,
//       data: hotel
//     });
//   } catch (error) {
//     console.error("❌ Error finding hotel by manager email:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Get hotel by manager ID
// // @route   GET /api/hoteldashboard/by-manager-id/:userId
// // @access  Private (only hotel)
// const getHotelByManagerId = async (req, res) => {
//   try {
//     const managerId = req.params.userId;
//     console.log(`🔍 Finding hotel by manager ID: ${managerId}`);
    
//     const hotel = await Hotel.findOne({ manager_id: managerId });
    
//     if (!hotel) {
//       return res.status(404).json({
//         success: false,
//         message: "No hotel found for this manager ID"
//       });
//     }
    
//     res.json({
//       success: true,
//       data: hotel
//     });
//   } catch (error) {
//     console.error("❌ Error finding hotel by manager ID:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Find hotel by manager (flexible search)
// // @route   POST /api/hoteldashboard/find-by-manager
// // @access  Private (only hotel)
// const findHotelByManager = async (req, res) => {
//   try {
//     const { managerEmail, managerId, managerRole } = req.body;
//     console.log(`🔍 Flexible hotel search:`, { managerEmail, managerId, managerRole });
    
//     let hotel = null;
    
//     // Try manager_id first (most reliable)
//     if (managerId) {
//       hotel = await Hotel.findOne({ manager_id: managerId });
//     }
    
//     // Fallback to email if no hotel found
//     if (!hotel && managerEmail) {
//       hotel = await Hotel.findOne({
//         $or: [
//           { manager_email: managerEmail },
//           { "hotel_details.email": managerEmail },
//           { "hotel_details.username": managerEmail }
//         ]
//       });
//     }
    
//     if (!hotel) {
//       return res.status(404).json({
//         success: false,
//         message: "No hotel found for this manager"
//       });
//     }
    
//     res.json({
//       success: true,
//       data: hotel
//     });
//   } catch (error) {
//     console.error("❌ Error in flexible hotel search:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Create new hotel profile
// // @route   POST /api/hoteldashboard/create
// // @access  Private (only hotel)
// const createHotelProfile = async (req, res) => {
//   try {
//     const userId = req.user.id || req.user.userId; // support both JWT formats
//     const hotelData = req.body;
    
//     console.log(`📝 Creating new hotel profile for user: ${userId}`);
    
//     // Verify user exists and has hotel role
//     const user = await User.findById(userId);
//     if (!user || user.role !== 'hotel') {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied. User is not a hotel manager."
//       });
//     }
    
//     // Check if hotel already exists for this manager
//     const existingHotel = await Hotel.findOne({ manager_id: userId });
//     if (existingHotel) {
//       return res.status(400).json({
//         success: false,
//         message: "Hotel profile already exists for this manager"
//       });
//     }
    
//     // Create new hotel with proper relationships
//     const newHotel = new Hotel({
//       manager_id: userId,
//       manager_email: user.email,
//       hotel_details: hotelData.hotel_details,
//       room_types: hotelData.room_types || [],
//       image: hotelData.image || { base64: "" },
//       gallery: hotelData.gallery || []
//     });
    
//     await newHotel.save();
    
//     // Update user with hotel_id
//     user.hotel_id = newHotel._id;
//     user.profile_completed = true;
//     await user.save();
    
//     console.log(`✅ Created new hotel profile: ${newHotel._id}`);
    
//     res.status(201).json({
//       success: true,
//       message: "Hotel profile created successfully",
//       data: newHotel
//     });
//   } catch (error) {
//     console.error("❌ Error creating hotel profile:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while creating hotel profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// module.exports = { 
//   getHotelById: getHotelByUserId,
//   updateHotelProfile: updateHotelByUserId,
//   getCurrentHotelProfile,
//   getHotelBookingRequests,
//   handleHotelBookingRequest,
//   getHotelBookingHistory,
//   getHotelDashboardStats,
//   // New endpoints
//   getHotelByManagerEmail,
//   getHotelByManagerId,
//   findHotelByManager,
//   createHotelProfile
// };







const Hotel = require("../models/hotel");
const User = require("../models/User");
const BookingFormsData = require("../models/bookingformsdataModel");
const ProfileBooking = require("../models/profileBooking");

// Shared helper: find hotel for a given user using 3-method fallback
async function findHotelForUser(user) {
  const userId = user._id.toString();
  let hotel = null;
  // 1. user.hotel_id (fastest — pre-linked)
  if (user.hotel_id) hotel = await Hotel.findById(user.hotel_id);
  // 2. manager_id on hotel document
  if (!hotel) hotel = await Hotel.findOne({ manager_id: userId });
  // 3. email fallback (legacy data)
  if (!hotel) hotel = await Hotel.findOne({
    $or: [
      { manager_email: user.email },
      { "hotel_details.email": user.email },
      { "hotel_details.username": user.email }
    ]
  });
  // Back-fill relationships for future lookups
  if (hotel) {
    let dirty = false;
    if (!hotel.manager_id || hotel.manager_id.toString() !== userId) {
      hotel.manager_id = userId;
      hotel.manager_email = user.email;
      dirty = true;
    }
    if (!user.hotel_id || user.hotel_id.toString() !== hotel._id.toString()) {
      user.hotel_id = hotel._id;
      await user.save();
    }
    if (dirty) await hotel.save();
  }
  return hotel;
}

// @desc    Get hotel profile by User ID (from token)
// @route   GET /api/hoteldashboard/:userId
// @access  Private (only hotel)
const getHotelByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`🔍 Fetching hotel data for user ID: ${userId}`);
    
    // Validate userId format
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`❌ Invalid user ID format: ${userId}`);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID format" 
      });
    }
    
    // First, verify the user exists and has hotel role
    const user = await User.findById(userId);
    if (!user) {
      console.log(`❌ User not found with ID: ${userId}`);
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    console.log(`✅ User found: ${user.fullName}, Role: ${user.role}`);
    
    if (user.role !== 'hotel') {
      console.log(`❌ Access denied. User role is '${user.role}', not 'hotel'`);
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. User is not a hotel manager." 
      });
    }

    // Try to find existing Hotel record by email or username
    console.log(`🔍 Looking for hotel profile with email: ${user.email}`);
    let hotel = await Hotel.findOne({ 
      $or: [
        { "hotel_details.email": user.email },
        { "hotel_details.username": user.email }
      ]
    });

    // If no Hotel record exists, create a default one
    if (!hotel) {
      console.log(`📝 No hotel profile found. Creating default profile for: ${user.email}`);
      
      // Generate unique username
      const baseUsername = user.email.split('@')[0] + '_hotel';
      let username = baseUsername;
      let counter = 1;
      
      // Ensure username is unique
      while (await Hotel.findOne({ "hotel_details.username": username })) {
        username = `${baseUsername}_${counter}`;
        counter++;
      }
      
      hotel = new Hotel({
        hotel_details: {
          hotel_name: user.fullName + "'s Hotel",
          description: "Welcome to our hotel",
          location: {
            district: "Not specified",
            pincode: 0
          },
          contact: "Not specified",
          email: user.email,
          check_in_time: "14:00",
          check_out_time: "11:00",
          rating: 0,
          amenities: ["WiFi", "Parking"],
          username: username,
          password: 'temp_password_' + Date.now(),
        },
        room_types: [
          {
            type: "Standard Room",
            price_per_night: "2000",
            features: ["AC", "TV", "WiFi"]
          }
        ],
        image: {
          base64: ""
        }
      });
      
      await hotel.save();
      console.log(`✅ Created new hotel profile with ID: ${hotel._id}`);
      
      // Return the hotel data
      return res.json({
        success: true,
        data: {
          _id: hotel._id,
          hotel_details: hotel.hotel_details,
          room_types: hotel.room_types,
          image: hotel.image,
          gallery: hotel.gallery || [],
          managerId: userId // Link to user
        }
      });
    }

    console.log(`✅ Found existing hotel profile: ${hotel.hotel_details.hotel_name}`);
    res.json({
      success: true,
      data: {
        _id: hotel._id,
        hotel_details: hotel.hotel_details,
        room_types: hotel.room_types,
        image: hotel.image,
        gallery: hotel.gallery || [],
        managerId: userId // Link to user
      }
    });
  } catch (error) {
    console.error("❌ Error fetching hotel:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching hotel profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update hotel profile by User ID
// @route   PUT /api/hoteldashboard/:userId
// @access  Private (only hotel)
const updateHotelByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    console.log(`🔄 Updating hotel profile for user ID: ${userId}`);
    
    // Validate userId format
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`❌ Invalid user ID format: ${userId}`);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID format" 
      });
    }
    
    // First, verify the user exists and has hotel role
    const user = await User.findById(userId);
    if (!user) {
      console.log(`❌ User not found with ID: ${userId}`);
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    console.log(`✅ User found: ${user.fullName}, Role: ${user.role}`);
    
    if (user.role !== 'hotel') {
      console.log(`❌ Access denied. User role is '${user.role}', not 'hotel'`);
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. User is not a hotel manager." 
      });
    }

    // Find the Hotel record using the same 3-method lookup as getCurrentHotelProfile
    let hotel = null;
    
    // Method 1: user.hotel_id (fastest)
    if (user.hotel_id) {
      hotel = await Hotel.findById(user.hotel_id);
    }
    
    // Method 2: manager_id
    if (!hotel) {
      hotel = await Hotel.findOne({ manager_id: userId });
    }
    
    // Method 3: email fallback
    if (!hotel) {
      hotel = await Hotel.findOne({
        $or: [
          { manager_email: user.email },
          { "hotel_details.email": user.email },
          { "hotel_details.username": user.email }
        ]
      });
      // Back-fill relationships if found via email
      if (hotel) {
        hotel.manager_id = userId;
        hotel.manager_email = user.email;
        user.hotel_id = hotel._id;
        await Promise.all([hotel.save(), user.save()]);
      }
    }
    
    if (!hotel) {
      console.log(`❌ Hotel profile not found for email: ${user.email}`);
      return res.status(404).json({ 
        success: false, 
        message: "Hotel profile not found. Please refresh the page." 
      });
    }
    
    console.log(`📝 Updating hotel profile: ${hotel.hotel_details.hotel_name}`);
    
    // Update allowed fields
    const updateFields = {};
    
    if (updateData.hotel_details) {
      const allowedHotelFields = ['hotel_name', 'description', 'location', 'contact', 'check_in_time', 'check_out_time', 'amenities'];
      allowedHotelFields.forEach(field => {
        if (updateData.hotel_details[field] !== undefined) {
          if (!updateFields.hotel_details) updateFields.hotel_details = {};
          updateFields.hotel_details[field] = updateData.hotel_details[field];
          console.log(`📝 Updating hotel_details.${field}`);
        }
      });
    }
    
    if (updateData.room_types) {
      updateFields.room_types = updateData.room_types;
      console.log(`📝 Updating room_types`);
    }
    
    if (updateData.image) {
      updateFields.image = updateData.image;
      console.log(`📝 Updating image`);
    }
    
    if (updateData.gallery) {
      updateFields.gallery = updateData.gallery;
      console.log(`📝 Updating gallery with ${updateData.gallery.length} images`);
    }
    
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }
    
    const updatedHotel = await Hotel.findByIdAndUpdate(
      hotel._id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    console.log(`✅ Successfully updated hotel profile: ${updatedHotel.hotel_details.hotel_name}`);
    
    res.json({
      success: true,
      message: "Hotel profile updated successfully",
      data: {
        _id: updatedHotel._id,
        hotel_details: updatedHotel.hotel_details,
        room_types: updatedHotel.room_types,
        image: updatedHotel.image,
        gallery: updatedHotel.gallery || [],
        managerId: userId
      }
    });
    
  } catch (error) {
    console.error("❌ Error updating hotel profile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while updating hotel profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user's hotel profile from token
// @route   GET /api/hoteldashboard/me
// @access  Private (only hotel)
const getCurrentHotelProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // support both JWT formats // From JWT token
    console.log(`🔍 Fetching current user's hotel profile. User ID: ${userId}`);
    
    // Verify the user exists and has hotel role (should be already verified by middleware)
    const user = await User.findById(userId);
    if (!user) {
      console.log(`❌ User not found with ID: ${userId}`);
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    if (user.role !== 'hotel') {
      console.log(`❌ Access denied. User role is '${user.role}', not 'hotel'`);
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. User is not a hotel manager." 
      });
    }

    // 🔧 NEW: Try to find hotel using proper relationship first
    let hotel = null;
    
    // Method 1: Use user.hotel_id if it exists (proper relationship)
    if (user.hotel_id) {
      console.log(`🔍 Looking for hotel by hotel_id: ${user.hotel_id}`);
      hotel = await Hotel.findById(user.hotel_id);
      if (hotel) {
        console.log(`✅ Found hotel via hotel_id: ${hotel.hotel_details.hotel_name}`);
      }
    }
    
    // Method 2: Use manager_id relationship (new approach)
    if (!hotel) {
      console.log(`🔍 Looking for hotel by manager_id: ${userId}`);
      hotel = await Hotel.findOne({ manager_id: userId });
      if (hotel) {
        console.log(`✅ Found hotel via manager_id: ${hotel.hotel_details.hotel_name}`);
        // Update user.hotel_id for future lookups
        user.hotel_id = hotel._id;
        await user.save();
      }
    }
    
    // Method 3: Fallback to email matching (legacy)
    if (!hotel) {
      console.log(`🔍 Fallback: Looking for hotel by email: ${user.email}`);
      hotel = await Hotel.findOne({ 
        $or: [
          { manager_email: user.email },
          { "hotel_details.email": user.email },
          { "hotel_details.username": user.email }
        ]
      });
      if (hotel) {
        console.log(`✅ Found hotel via email matching: ${hotel.hotel_details.hotel_name}`);
        // Update relationships for future lookups
        hotel.manager_id = userId;
        hotel.manager_email = user.email;
        user.hotel_id = hotel._id;
        await Promise.all([hotel.save(), user.save()]);
      }
    }

    // If no Hotel record exists, create a default one with proper relationships
    if (!hotel) {
      console.log(`📝 No hotel profile found. Creating default profile for: ${user.email}`);
      
      const baseUsername = user.email.split('@')[0] + '_hotel';
      let username = baseUsername;
      let counter = 1;
      
      while (await Hotel.findOne({ "hotel_details.username": username })) {
        username = `${baseUsername}_${counter}`;
        counter++;
      }
      
      hotel = new Hotel({
        // 🔧 NEW: Proper relationship fields
        manager_id: userId,
        manager_email: user.email,
        
        hotel_details: {
          hotel_name: user.fullName + "'s Hotel",
          description: "Welcome to our hotel",
          location: {
            district: "Not specified",
            pincode: 0
          },
          contact: "Not specified",
          email: user.email,
          check_in_time: "14:00",
          check_out_time: "11:00",
          rating: 0,
          amenities: ["WiFi", "Parking"],
          username: username,
          password: 'temp_password_' + Date.now(),
        },
        room_types: [
          {
            type: "Standard Room",
            price_per_night: "2000",
            features: ["AC", "TV", "WiFi"]
          }
        ],
        image: {
          base64: ""
        }
      });
      
      await hotel.save();
      
      // 🔧 NEW: Update user with hotel_id
      user.hotel_id = hotel._id;
      user.profile_completed = false; // Hotel manager needs to complete profile
      await user.save();
      
      console.log(`✅ Created new hotel profile with ID: ${hotel._id} and linked to user ${userId}`);
    } else {
      console.log(`✅ Found existing hotel profile: ${hotel.hotel_details.hotel_name}`);
      
      // 🔧 NEW: Ensure relationships are properly set
      if (!user.hotel_id) {
        user.hotel_id = hotel._id;
        await user.save();
        console.log(`✅ Updated user ${userId} with hotel_id: ${hotel._id}`);
      }
      if (!hotel.manager_id) {
        hotel.manager_id = userId;
        hotel.manager_email = user.email;
        await hotel.save();
        console.log(`✅ Updated hotel ${hotel._id} with manager_id: ${userId}`);
      }
    }

    res.json({
      success: true,
      data: {
        _id: hotel._id,
        hotel_details: hotel.hotel_details,
        room_types: hotel.room_types,
        image: hotel.image,
        gallery: hotel.gallery || [],
        managerId: userId
      }
    });
  } catch (error) {
    console.error("❌ Error fetching current hotel profile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching hotel profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all booking requests for the current hotel
const getHotelBookingRequests = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // support both JWT formats // From JWT token
    console.log(`🔍 Fetching booking requests for hotel manager user ID: ${userId}`);
    
    // First, verify the user exists and has hotel role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    if (user.role !== 'hotel') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. User is not a hotel manager." 
      });
    }

    // Find the hotel associated with this user (3-method lookup)
    let hotel = null;
    if (user.hotel_id) hotel = await Hotel.findById(user.hotel_id);
    if (!hotel) hotel = await Hotel.findOne({ manager_id: userId });
    if (!hotel) hotel = await Hotel.findOne({
      $or: [
        { manager_email: user.email },
        { "hotel_details.email": user.email },
        { "hotel_details.username": user.email }
      ]
    });
    
    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel profile not found" });
    }

    const bookingRequests = await BookingFormsData.find({
      $or: [
        { 'hotel.managerId': userId },
        { 'hotel.name': hotel.hotel_details.hotel_name },
        { 
          'hotel.name': { $regex: hotel.hotel_details.hotel_name, $options: 'i' },
          'hotel.managerId': { $exists: false }
        }
      ],
      status: { $in: ['pending', 'agent_confirmed'] },
      hotelConfirmed: false
    })
    .populate('userId', 'fullName email phone')
    .sort({ createdAt: -1 })
    .lean();
    
    console.log(`✅ Found ${bookingRequests.length} booking requests for hotel: ${hotel.hotel_details.hotel_name}`);
    
    // Transform data for hotel dashboard
    const transformedRequests = bookingRequests.map(booking => ({
      _id: booking._id,
      bookingId: booking.bookingId,
      tourName: booking.tourName,
      touristPlaces: booking.touristPlaces,
      
      // Customer details
      customer: {
        name: booking.user.fullName,
        email: booking.tourist.email,
        phone: booking.tourist.phone,
        address: booking.user.address
      },
      
      // Trip details
      tripDetails: {
        travelers: booking.tourist.totalTravellers,
        checkIn: booking.hotel.fromDate,
        checkOut: booking.hotel.toDate,
        duration: booking.tourDuration,
        places: booking.touristPlaces
      },
      
      // Agent details
      agent: {
        name: booking.agent.name,
        experience: booking.agent.experience,
        location: booking.agent.location,
        languages: booking.agent.languages
      },
      
      // Financial details
      payment: {
        totalAmount: booking.payment.totalAmount,
        status: booking.payment.status
      },
      
      // Booking status
      status: booking.status,
      agentConfirmed: booking.agentConfirmed,
      specialRequests: booking.specialRequests,
      
      // Dates
      requestedAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));
    
    res.json({
      success: true,
      requests: transformedRequests,
      count: transformedRequests.length,
      hotelInfo: {
        name: hotel.hotel_details.hotel_name,
        id: hotel._id
      }
    });
    
  } catch (error) {
    console.error("❌ Error fetching hotel booking requests:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching booking requests",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Confirm or reject a booking request by hotel
const handleHotelBookingRequest = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // support both JWT formats // From JWT token
    const { bookingId } = req.params;
    const { action, notes } = req.body; // action: 'accept' | 'reject', notes: optional
    
    console.log(`🔄 Hotel manager ${userId} handling booking ${bookingId} with action: ${action}`);
    
    // Verify user is a hotel manager
    const user = await User.findById(userId);
    if (!user || user.role !== 'hotel') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. User is not a hotel manager." 
      });
    }
    
    // Find the hotel
    const hotel = await findHotelForUser(user);

    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel profile not found" });
    }

    const booking = await BookingFormsData.findOne({ 
      bookingId: bookingId,
      $or: [
        { 'hotel.managerId': userId },
        { 'hotel.name': hotel.hotel_details.hotel_name },
        { 'hotel.name': { $regex: hotel.hotel_details.hotel_name, $options: 'i' } }
      ]
    });
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found or not assigned to your hotel" 
      });
    }
    
    if (booking.hotelConfirmed) {
      return res.status(400).json({ 
        success: false, 
        message: "Booking already processed by hotel" 
      });
    }
    
    if (action === 'accept') {
      // Accept the booking
      booking.hotelConfirmed = true;
      booking.hotelConfirmedAt = new Date();
      
      // Set hotel manager ID if not already set
      if (!booking.hotel.managerId) {
        booking.hotel.managerId = userId;
      }
      
      // Update status based on agent confirmation
      if (booking.agentConfirmed) {
        booking.status = "confirmed";
      } else {
        booking.status = "hotel_confirmed";
      }
      
      // Add notes if provided
      if (notes) {
        booking.specialRequests = (booking.specialRequests || "") + `\n[Hotel Notes]: ${notes}`;
      }
      
      await booking.save();
      
      // Update profile booking
      await ProfileBooking.findOneAndUpdate(
        { bookingId: bookingId },
        { 
          status: booking.agentConfirmed ? "Upcoming" : "Upcoming",
          'hotel.contact': hotel.hotel_details.contact,
          'hotel.email': hotel.hotel_details.email
        }
      );
      
      console.log(`✅ Booking ${bookingId} accepted by hotel`);
      
      res.json({
        success: true,
        message: "Booking request accepted successfully!",
        booking: {
          bookingId: booking.bookingId,
          status: booking.status,
          hotelConfirmed: booking.hotelConfirmed
        }
      });
      
    } else if (action === 'reject') {
      // Reject the booking
      booking.status = "cancelled";
      
      if (notes) {
        booking.specialRequests = (booking.specialRequests || "") + `\n[Hotel Rejection]: ${notes}`;
      }
      
      await booking.save();
      
      // Update profile booking
      await ProfileBooking.findOneAndUpdate(
        { bookingId: bookingId },
        { status: "Cancelled" }
      );
      
      console.log(`❌ Booking ${bookingId} rejected by hotel`);
      
      res.json({
        success: true,
        message: "Booking request rejected.",
        booking: {
          bookingId: booking.bookingId,
          status: booking.status
        }
      });
      
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid action. Use 'accept' or 'reject'." 
      });
    }
    
  } catch (error) {
    console.error("❌ Error handling hotel booking request:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while processing booking request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get hotel's booking history (accepted bookings)
const getHotelBookingHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // support both JWT formats
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'hotel') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. User is not a hotel manager." 
      });
    }
    
    // Find the hotel
    const hotel = await findHotelForUser(user);

    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel profile not found" });
    }
    
    const bookingHistory = await BookingFormsData.find({
      $and: [
        {
          $or: [
            { 'hotel.managerId': userId },
            { 'hotel.name': hotel.hotel_details.hotel_name }
          ]
        },
        {
          $or: [
            { hotelConfirmed: true },
            { status: 'cancelled' }
          ]
        }
      ]
    })
    .populate('userId', 'fullName email phone')
    .sort({ updatedAt: -1, hotelConfirmedAt: -1 })
    .lean();
    
    const transformedHistory = bookingHistory.map(booking => ({
      bookingId: booking.bookingId,
      tourName: booking.tourName,
      customer: booking.user.fullName,
      travelers: booking.tourist.totalTravellers,
      amount: booking.payment.totalAmount,
      status: booking.status,
      confirmedAt: booking.hotelConfirmedAt || booking.updatedAt,
      checkInDate: booking.hotel.fromDate,
      checkOutDate: booking.hotel.toDate,
      agent: booking.agent.name || 'Not assigned'
    }));
    
    res.json({
      success: true,
      history: transformedHistory,
      count: transformedHistory.length
    });
    
  } catch (error) {
    console.error("❌ Error fetching hotel booking history:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching booking history",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get hotel dashboard statistics
const getHotelDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // support both JWT formats
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'hotel') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. User is not a hotel manager." 
      });
    }
    
    // Find the hotel
    const hotel = await findHotelForUser(user);

    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel profile not found" });
    }
    
    // Get statistics
    const totalBookings = await BookingFormsData.countDocuments({
      $or: [
        { 'hotel.managerId': userId },
        { 'hotel.name': hotel.hotel_details.hotel_name }
      ]
    });
    
    const pendingRequests = await BookingFormsData.countDocuments({
      $or: [
        { 'hotel.managerId': userId },
        { 'hotel.name': hotel.hotel_details.hotel_name }
      ],
      hotelConfirmed: false,
      status: { $in: ['pending', 'agent_confirmed'] }
    });
    
    const confirmedBookings = await BookingFormsData.countDocuments({
      $or: [
        { 'hotel.managerId': userId },
        { 'hotel.name': hotel.hotel_details.hotel_name }
      ],
      hotelConfirmed: true,
      status: { $in: ['confirmed', 'hotel_confirmed'] }
    });
    
    const cancelledBookings = await BookingFormsData.countDocuments({
      $or: [
        { 'hotel.managerId': userId },
        { 'hotel.name': hotel.hotel_details.hotel_name }
      ],
      status: 'cancelled'
    });
    
    // Calculate total revenue
    const revenueData = await BookingFormsData.aggregate([
      {
        $match: {
          $or: [
            { 'hotel.managerId': userId },
            { 'hotel.name': hotel.hotel_details.hotel_name }
          ],
          hotelConfirmed: true,
          'payment.status': 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$payment.totalAmount' }
        }
      }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    res.json({
      success: true,
      stats: {
        totalBookings,
        pendingRequests,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        hotelRating: hotel.hotel_details.rating || 0
      }
    });
    
  } catch (error) {
    console.error("❌ Error fetching hotel dashboard stats:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching dashboard statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 🔧 NEW: Additional endpoints for frontend compatibility

// @desc    Get hotel by manager email
// @route   GET /api/hoteldashboard/by-manager/:email
// @access  Private (only hotel)
const getHotelByManagerEmail = async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    console.log(`🔍 Finding hotel by manager email: ${email}`);
    
    const hotel = await Hotel.findOne({
      $or: [
        { manager_email: email },
        { "hotel_details.email": email },
        { "hotel_details.username": email }
      ]
    });
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No hotel found for this manager email"
      });
    }
    
    res.json({
      success: true,
      data: hotel
    });
  } catch (error) {
    console.error("❌ Error finding hotel by manager email:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get hotel by manager ID
// @route   GET /api/hoteldashboard/by-manager-id/:userId
// @access  Private (only hotel)
const getHotelByManagerId = async (req, res) => {
  try {
    const managerId = req.params.userId;
    console.log(`🔍 Finding hotel by manager ID: ${managerId}`);
    
    const hotel = await Hotel.findOne({ manager_id: managerId });
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No hotel found for this manager ID"
      });
    }
    
    res.json({
      success: true,
      data: hotel
    });
  } catch (error) {
    console.error("❌ Error finding hotel by manager ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Find hotel by manager (flexible search)
// @route   POST /api/hoteldashboard/find-by-manager
// @access  Private (only hotel)
const findHotelByManager = async (req, res) => {
  try {
    const { managerEmail, managerId, managerRole } = req.body;
    console.log(`🔍 Flexible hotel search:`, { managerEmail, managerId, managerRole });
    
    let hotel = null;
    
    // Try manager_id first (most reliable)
    if (managerId) {
      hotel = await Hotel.findOne({ manager_id: managerId });
    }
    
    // Fallback to email if no hotel found
    if (!hotel && managerEmail) {
      hotel = await Hotel.findOne({
        $or: [
          { manager_email: managerEmail },
          { "hotel_details.email": managerEmail },
          { "hotel_details.username": managerEmail }
        ]
      });
    }
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No hotel found for this manager"
      });
    }
    
    res.json({
      success: true,
      data: hotel
    });
  } catch (error) {
    console.error("❌ Error in flexible hotel search:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new hotel profile
// @route   POST /api/hoteldashboard/create
// @access  Private (only hotel)
const createHotelProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // support both JWT formats
    const hotelData = req.body;
    
    console.log(`📝 Creating new hotel profile for user: ${userId}`);
    
    // Verify user exists and has hotel role
    const user = await User.findById(userId);
    if (!user || user.role !== 'hotel') {
      return res.status(403).json({
        success: false,
        message: "Access denied. User is not a hotel manager."
      });
    }
    
    // Check if hotel already exists for this manager
    const existingHotel = await Hotel.findOne({ manager_id: userId });
    if (existingHotel) {
      return res.status(400).json({
        success: false,
        message: "Hotel profile already exists for this manager"
      });
    }
    
    // Create new hotel with proper relationships
    const newHotel = new Hotel({
      manager_id: userId,
      manager_email: user.email,
      hotel_details: hotelData.hotel_details,
      room_types: hotelData.room_types || [],
      image: hotelData.image || { base64: "" },
      gallery: hotelData.gallery || []
    });
    
    await newHotel.save();
    
    // Update user with hotel_id
    user.hotel_id = newHotel._id;
    user.profile_completed = true;
    await user.save();
    
    console.log(`✅ Created new hotel profile: ${newHotel._id}`);
    
    res.status(201).json({
      success: true,
      message: "Hotel profile created successfully",
      data: newHotel
    });
  } catch (error) {
    console.error("❌ Error creating hotel profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating hotel profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { 
  getHotelById: getHotelByUserId,
  updateHotelProfile: updateHotelByUserId,
  getCurrentHotelProfile,
  getHotelBookingRequests,
  handleHotelBookingRequest,
  getHotelBookingHistory,
  getHotelDashboardStats,
  // New endpoints
  getHotelByManagerEmail,
  getHotelByManagerId,
  findHotelByManager,
  createHotelProfile
};