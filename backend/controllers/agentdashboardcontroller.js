// // const Agent = require("../models/Agent");

// // // ✅ Read Single Agent by ID
// // exports.getAgentById = async (req, res) => {
// //   try {
// //     const agent = await Agent.findById(req.params.id);
// //     if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });
// //     res.json({ success: true, data: agent });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // // ✅ Update Agent
// // exports.updateAgent = async (req, res) => {
// //   try {
// //     const agent = await Agent.findByIdAndUpdate(req.params.id, req.body, { new: true });
// //     if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });
// //     res.json({ success: true, data: agent });
// //   } catch (err) {
// //     res.status(400).json({ success: false, message: err.message });
// //   }
// // };

// // exports.getBookingsByAgentId = async (req, res) => {
// //   try {
// //     const { id } = req.params; // agentId
// //     const bookings = await BookingHotel.find({ agentId: id });

// //     if (!bookings || bookings.length === 0) {
// //       return res
// //         .status(404)
// //         .json({ success: false, message: "No bookings found for this agent" });
// //     }

// //     res.json({ success: true, data: bookings });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // // // controllers/agentController.js
// // // const Agent = require("../models/Agent");
// // // const bcrypt = require("bcryptjs");

// // // exports.registerAgent = async (req, res) => {
// // //   try {
// // //     const { name, gender, address, mobile_no, email, experience, age, language, fees, rating, district, password } = req.body;
// // //     const hashedPassword = await bcrypt.hash(password, 10);
// // //     const agent = new Agent({
// // //       name, gender, address, mobile_no, email,
// // //       experience, age, language, fees, rating,
// // //       district, password: hashedPassword
// // //     });
// // //     await agent.save();
// // //     res.status(201).json({ message: "Agent registered", agent });
// // //   } catch (err) {
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // exports.loginAgent = async (req, res) => {
// // //   try {
// // //     const { email, password } = req.body;
// // //     const agent = await Agent.findOne({ email });
// // //     if (!agent) return res.status(404).json({ message: "Agent not found" });
// // //     const isMatch = await bcrypt.compare(password, agent.password);
// // //     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
// // //     res.json({ message: "Login successful", agent });
// // //   } catch (err) {
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // exports.getAgentProfile = async (req, res) => {
// // //   try {
// // //     const agent = await Agent.findById(req.params.id);
// // //     res.json(agent);
// // //   } catch (err) {
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };




// const Guide = require("../models/guideModel");

// exports.getGuideById = async (req, res) => {
//   try {
//     const guide = await Guide.findById(req.params.id).select(
//       "name email mobile_no district address experience language rating fees gender age"
//     );

//     if (!guide) {
//       return res.status(404).json({ message: "Guide not found" });
//     }

//     res.json(guide);
//   } catch (error) {
//     console.error("Error fetching guide:", error.message);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const Guide = require("../models/guideModel");
// const Agent = require("../models/Agent");
// const User = require("../models/User");
// const BookingFormsData = require("../models/bookingformsdataModel");
// const ProfileBooking = require("../models/profileBooking");

// // @desc    Get guide profile by User ID (from token)
// // @route   GET /api/agentdashboard/:userId
// // @access  Private (only guide)
// const getGuideByUserId = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     console.log(`🔍 Fetching guide data for user ID: ${userId}`);
    
//     // Validate userId format
//     if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
//       console.log(`❌ Invalid user ID format: ${userId}`);
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid user ID format" 
//       });
//     }
    
//     // First, verify the user exists and has guide role
//     const user = await User.findById(userId);
//     if (!user) {
//       console.log(`❌ User not found with ID: ${userId}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     console.log(`✅ User found: ${user.fullName}, Role: ${user.role}`);
    
//     if (user.role !== 'guide') {
//       console.log(`❌ Access denied. User role is '${user.role}', not 'guide'`);
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a guide." 
//       });
//     }

//     // Try to find existing Guide record by email
//     console.log(`🔍 Looking for guide profile with email: ${user.email}`);
//     let guide = await Guide.findOne({ email: user.email }).select(
//       "name email mobile_no district address experience language rating fees gender age"
//     );

//     // If no Guide record exists, create a default one
//     if (!guide) {
//       console.log(`📝 No guide profile found. Creating default profile for: ${user.email}`);
      
//       // Generate unique username
//       const baseUsername = user.email.split('@')[0] + '_guide';
//       let username = baseUsername;
//       let counter = 1;
      
//       // Ensure username is unique
//       while (await Guide.findOne({ username })) {
//         username = `${baseUsername}_${counter}`;
//         counter++;
//       }
      
//       guide = new Guide({
//         name: user.fullName,
//         district: "Not specified",
//         address: "Not specified",
//         experience: 0,
//         age: user.age || 25,
//         language: ["English"],
//         fees: 1000,
//         rating: 0,
//         mobile_no: "Not specified",
//         gender: user.gender,
//         username: username,
//         password: 'temp_password_' + Date.now(), // Generate unique temp password
//         email: user.email,
//         role: 'guide'
//       });
      
//       await guide.save();
//       console.log(`✅ Created new guide profile with ID: ${guide._id}`);
      
//       // Check profile completeness for new profile
//       const profileComplete = isProfileComplete(guide);
//       console.log(`📋 New profile complete status: ${profileComplete}`);
      
//       // Return the basic fields
//       return res.json({
//         success: true,
//         data: {
//           _id: guide._id,
//           name: guide.name,
//           email: guide.email,
//           mobile_no: guide.mobile_no,
//           district: guide.district,
//           address: guide.address,
//           experience: guide.experience,
//           language: guide.language,
//           rating: guide.rating,
//           fees: guide.fees,
//           gender: guide.gender,
//           age: guide.age,
//           profileComplete: profileComplete
//         }
//       });
//     }

//     console.log(`✅ Found existing guide profile: ${guide.name}`);
    
//     // Check profile completeness
//     const profileComplete = isProfileComplete(guide);
//     console.log(`📋 Profile complete status: ${profileComplete}`);
    
//     res.json({
//       success: true,
//       data: {
//         _id: guide._id,
//         name: guide.name,
//         email: guide.email,
//         mobile_no: guide.mobile_no,
//         district: guide.district,
//         address: guide.address,
//         experience: guide.experience,
//         language: guide.language,
//         rating: guide.rating,
//         fees: guide.fees,
//         gender: guide.gender,
//         age: guide.age,
//         profileComplete: profileComplete
//       }
//     });
//   } catch (error) {
//     console.error("❌ Error fetching guide:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching guide profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Update guide profile by User ID
// // @route   PUT /api/agentdashboard/:userId
// // @access  Private (only guide)
// const updateGuideByUserId = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const updateData = req.body;
//     console.log(`🔄 Updating guide profile for user ID: ${userId}`);
    
//     // Validate userId format
//     if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
//       console.log(`❌ Invalid user ID format: ${userId}`);
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid user ID format" 
//       });
//     }
    
//     // First, verify the user exists and has guide role
//     const user = await User.findById(userId);
//     if (!user) {
//       console.log(`❌ User not found with ID: ${userId}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     console.log(`✅ User found: ${user.fullName}, Role: ${user.role}`);
    
//     if (user.role !== 'guide') {
//       console.log(`❌ Access denied. User role is '${user.role}', not 'guide'`);
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a guide." 
//       });
//     }

//     // Find and update the Guide record
//     let guide = await Guide.findOne({ email: user.email });
    
//     if (!guide) {
//       console.log(`❌ Guide profile not found for email: ${user.email}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "Guide profile not found. Please refresh the page." 
//       });
//     }
    
//     console.log(`📝 Updating guide profile: ${guide.name}`);
    
//     // Update allowed fields
//     const allowedFields = ['name', 'district', 'address', 'experience', 'age', 'language', 'fees', 'mobile_no', 'gender'];
//     const updateFields = {};
    
//     allowedFields.forEach(field => {
//       if (updateData[field] !== undefined) {
//         updateFields[field] = updateData[field];
//         console.log(`📝 Updating field '${field}': ${updateData[field]}`);
//       }
//     });
    
//     if (Object.keys(updateFields).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No valid fields provided for update"
//       });
//     }
    
//     const updatedGuide = await Guide.findByIdAndUpdate(
//       guide._id,
//       updateFields,
//       { new: true, runValidators: true }
//     ).select("name email mobile_no district address experience language rating fees gender age");
    
//     console.log(`✅ Successfully updated guide profile: ${updatedGuide.name}`);
    
//     // Check if profile is now complete and sync to agents collection
//     console.log('🔍 DEBUG: Starting profile completeness check...');
//     console.log('📋 Updated guide data for completeness check:', {
//       name: updatedGuide.name,
//       gender: updatedGuide.gender,
//       district: updatedGuide.district,
//       mobile_no: updatedGuide.mobile_no,
//       experience: updatedGuide.experience,
//       language: updatedGuide.language,
//       fees: updatedGuide.fees
//     });
    
//     const profileComplete = isProfileComplete(updatedGuide);
//     console.log(`📋 Profile complete status: ${profileComplete}`);
    
//     let agentSyncResult = null;
//     if (profileComplete) {
//       console.log('🎯 Profile is complete - syncing to agents collection');
//       agentSyncResult = await syncToAgentsCollection(updatedGuide, user.email);
//       if (agentSyncResult) {
//         console.log('✅ Agent sync successful - agent ID:', agentSyncResult._id);
//       } else {
//         console.log('❌ Agent sync failed');
//       }
//     } else {
//       console.log('⚠️ Profile incomplete - not syncing to agents collection');
//       console.log('🔍 Missing or invalid fields detected by backend validation');
//     }
    
//     res.json({
//       success: true,
//       message: profileComplete ? 
//         "Profile updated successfully! Your profile is now complete and will appear in guide listings." : 
//         "Profile updated successfully",
//       data: {
//         _id: updatedGuide._id,
//         name: updatedGuide.name,
//         email: updatedGuide.email,
//         mobile_no: updatedGuide.mobile_no,
//         district: updatedGuide.district,
//         address: updatedGuide.address,
//         experience: updatedGuide.experience,
//         language: updatedGuide.language,
//         rating: updatedGuide.rating,
//         fees: updatedGuide.fees,
//         gender: updatedGuide.gender,
//         age: updatedGuide.age,
//         profileComplete: profileComplete,
//         agentSynced: agentSyncResult ? true : false
//       }
//     });
    
//   } catch (error) {
//     console.error("❌ Error updating guide profile:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while updating guide profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // @desc    Get current user's guide profile from token
// // @route   GET /api/agentdashboard/me
// // @access  Private (only guide)
// const getCurrentGuideProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // From JWT token
//     console.log(`🔍 Fetching current user's guide profile. User ID: ${userId}`);
    
//     // Verify the user exists and has guide role (should be already verified by middleware)
//     const user = await User.findById(userId);
//     if (!user) {
//       console.log(`❌ User not found with ID: ${userId}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     if (user.role !== 'guide') {
//       console.log(`❌ Access denied. User role is '${user.role}', not 'guide'`);
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a guide." 
//       });
//     }

//     // Try to find existing Guide record by email
//     console.log(`🔍 Looking for guide profile with email: ${user.email}`);
//     let guide = await Guide.findOne({ email: user.email }).select(
//       "name email mobile_no district address experience language rating fees gender age"
//     );

//     // If no Guide record exists, create a default one
//     if (!guide) {
//       console.log(`📝 No guide profile found. Creating default profile for: ${user.email}`);
      
//       const baseUsername = user.email.split('@')[0] + '_guide';
//       let username = baseUsername;
//       let counter = 1;
      
//       while (await Guide.findOne({ username })) {
//         username = `${baseUsername}_${counter}`;
//         counter++;
//       }
      
//       guide = new Guide({
//         name: user.fullName,
//         district: "Not specified",
//         address: "Not specified",
//         experience: 0,
//         age: user.age || 25,
//         language: ["English"],
//         fees: 1000,
//         rating: 0,
//         mobile_no: "Not specified",
//         gender: user.gender,
//         username: username,
//         password: 'temp_password_' + Date.now(),
//         email: user.email,
//         role: 'guide'
//       });
      
//       await guide.save();
//       console.log(`✅ Created new guide profile with ID: ${guide._id}`);
//     } else {
//       console.log(`✅ Found existing guide profile: ${guide.name}`);
//     }

//     res.json({
//       success: true,
//       data: {
//         _id: guide._id,
//         name: guide.name,
//         email: guide.email,
//         mobile_no: guide.mobile_no,
//         district: guide.district,
//         address: guide.address,
//         experience: guide.experience,
//         language: guide.language,
//         rating: guide.rating,
//         fees: guide.fees,
//         gender: guide.gender,
//         age: guide.age
//       }
//     });
//   } catch (error) {
//     console.error("❌ Error fetching current guide profile:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching guide profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get all booking requests for the current agent/guide
// const getAgentBookingRequests = async (req, res) => {
//   try {
//     const userId = req.user.id; // From JWT token
//     console.log(`🔍 Fetching booking requests for guide/agent user ID: ${userId}`);
    
//     // First, verify the user exists and has guide role
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//     }
    
//     if (user.role !== 'guide') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a guide." 
//       });
//     }

//     // Find bookings where this agent is selected
//     // Note: We match by agent email since agent.agentId might not be set in existing data
//     const bookingRequests = await BookingFormsData.find({
//       $or: [
//         { 'agent.agentId': userId },
//         // Fallback: match by email if agentId is not set
//         { 
//           'agent.email': user.email,
//           'agent.agentId': { $exists: false }
//         }
//       ],
//       status: { $in: ['pending', 'hotel_confirmed'] }, // Show bookings waiting for agent confirmation
//       agentConfirmed: false
//     })
//     .populate('userId', 'fullName email phone')
//     .sort({ createdAt: -1 })
//     .lean();
    
//     console.log(`✅ Found ${bookingRequests.length} booking requests`);
    
//     // Transform data for agent dashboard
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
//         startDate: booking.hotel.fromDate,
//         endDate: booking.hotel.toDate,
//         duration: booking.tourDuration,
//         places: booking.touristPlaces
//       },
      
//       // Hotel details
//       hotel: {
//         name: booking.hotel.name,
//         address: booking.hotel.address,
//         checkIn: booking.hotel.fromDate,
//         checkOut: booking.hotel.toDate
//       },
      
//       // Financial details
//       payment: {
//         totalAmount: booking.payment.totalAmount,
//         status: booking.payment.status
//       },
      
//       // Booking status
//       status: booking.status,
//       hotelConfirmed: booking.hotelConfirmed,
//       specialRequests: booking.specialRequests,
      
//       // Dates
//       requestedAt: booking.createdAt,
//       updatedAt: booking.updatedAt
//     }));
    
//     res.json({
//       success: true,
//       requests: transformedRequests,
//       count: transformedRequests.length
//     });
    
//   } catch (error) {
//     console.error("❌ Error fetching agent booking requests:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching booking requests",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Confirm or reject a booking request by agent
// const handleBookingRequest = async (req, res) => {
//   try {
//     const userId = req.user.id; // From JWT token
//     const { bookingId } = req.params;
//     const { action, notes } = req.body; // action: 'accept' | 'reject', notes: optional
    
//     console.log(`🔄 Agent ${userId} handling booking ${bookingId} with action: ${action}`);
    
//     // Verify user is a guide
//     const user = await User.findById(userId);
//     if (!user || user.role !== 'guide') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a guide." 
//       });
//     }
    
//     // Find the booking
//     const booking = await BookingFormsData.findOne({ 
//       bookingId: bookingId,
//       $or: [
//         { 'agent.agentId': userId },
//         { 'agent.email': user.email }
//       ]
//     });
    
//     if (!booking) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Booking not found or not assigned to you" 
//       });
//     }
    
//     if (booking.agentConfirmed) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Booking already processed by agent" 
//       });
//     }
    
//     if (action === 'accept') {
//       // Accept the booking
//       booking.agentConfirmed = true;
//       booking.agentConfirmedAt = new Date();
      
//       // Set agent ID if not already set
//       if (!booking.agent.agentId) {
//         booking.agent.agentId = userId;
//       }
      
//       // Update status based on hotel confirmation
//       if (booking.hotelConfirmed) {
//         booking.status = "confirmed";
//       } else {
//         booking.status = "agent_confirmed";
//       }
      
//       // Add notes if provided
//       if (notes) {
//         booking.specialRequests = (booking.specialRequests || "") + `\n[Agent Notes]: ${notes}`;
//       }
      
//       await booking.save();
      
//       // Update profile booking
//       await ProfileBooking.findOneAndUpdate(
//         { bookingId: bookingId },
//         { 
//           status: booking.hotelConfirmed ? "Upcoming" : "Upcoming",
//           'agent.contact': user.fullName,
//           'agent.email': user.email
//         }
//       );
      
//       console.log(`✅ Booking ${bookingId} accepted by agent`);
      
//       res.json({
//         success: true,
//         message: "Booking request accepted successfully!",
//         booking: {
//           bookingId: booking.bookingId,
//           status: booking.status,
//           agentConfirmed: booking.agentConfirmed
//         }
//       });
      
//     } else if (action === 'reject') {
//       // Reject the booking
//       booking.status = "cancelled";
      
//       if (notes) {
//         booking.specialRequests = (booking.specialRequests || "") + `\n[Agent Rejection]: ${notes}`;
//       }
      
//       await booking.save();
      
//       // Update profile booking
//       await ProfileBooking.findOneAndUpdate(
//         { bookingId: bookingId },
//         { status: "Cancelled" }
//       );
      
//       console.log(`❌ Booking ${bookingId} rejected by agent`);
      
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
//     console.error("❌ Error handling booking request:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while processing booking request",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get agent's booking history (accepted bookings)
// const getAgentBookingHistory = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const user = await User.findById(userId);
//     if (!user || user.role !== 'guide') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Access denied. User is not a guide." 
//       });
//     }
    
//     const bookingHistory = await BookingFormsData.find({
//       $or: [
//         { 'agent.agentId': userId },
//         { 'agent.email': user.email }
//       ],
//       agentConfirmed: true
//     })
//     .populate('userId', 'fullName email phone')
//     .sort({ agentConfirmedAt: -1 })
//     .lean();
    
//     const transformedHistory = bookingHistory.map(booking => ({
//       bookingId: booking.bookingId,
//       tourName: booking.tourName,
//       customer: booking.user.fullName,
//       travelers: booking.tourist.totalTravellers,
//       amount: booking.payment.totalAmount,
//       status: booking.status,
//       confirmedAt: booking.agentConfirmedAt,
//       tripDates: {
//         start: booking.hotel.fromDate,
//         end: booking.hotel.toDate
//       }
//     }));
    
//     res.json({
//       success: true,
//       history: transformedHistory,
//       count: transformedHistory.length
//     });
    
//   } catch (error) {
//     console.error("❌ Error fetching agent booking history:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Server error while fetching booking history",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Helper function to check if profile is complete
// function isProfileComplete(guideData) {
//   const requiredFields = ['name', 'gender', 'district', 'mobile_no', 'experience', 'language', 'fees'];
//   return requiredFields.every(field => {
//     const value = guideData[field];
//     if (field === 'language') {
//       return value && Array.isArray(value) && value.length > 0 && 
//              !(value.length === 1 && value[0] === 'English');
//     }
//     return value && value !== 'Not specified' && value !== 0;
//   });
// }

// // Helper function to save/update agent data in agents collection
// async function syncToAgentsCollection(guideData, userEmail) {
//   try {
//     console.log('🔄 Syncing guide data to agents collection...');
    
//     // Map guide data to agent schema
//     const agentData = {
//       name: guideData.name,
//       district: guideData.district,
//       age: guideData.age,
//       language: guideData.language,
//       experience: guideData.experience,
//       fees: guideData.fees ? guideData.fees.toString() : '0', // Agent model expects string
//       rating: guideData.rating || 3, // Default rating
//       mobile_no: guideData.mobile_no,
//       gender: guideData.gender,
//       image: guideData.image || 'assets/images/default-avatar.jpg'
//     };
    
//     // Find existing agent record or create new one
//     const existingAgent = await Agent.findOne({
//       $or: [
//         { mobile_no: guideData.mobile_no },
//         { name: guideData.name, district: guideData.district }
//       ]
//     });
    
//     if (existingAgent) {
//       // Update existing agent
//       const updatedAgent = await Agent.findByIdAndUpdate(
//         existingAgent._id,
//         agentData,
//         { new: true, runValidators: true }
//       );
//       console.log(`✅ Updated existing agent in agents collection: ${updatedAgent._id}`);
//       return updatedAgent;
//     } else {
//       // Create new agent
//       const newAgent = new Agent(agentData);
//       await newAgent.save();
//       console.log(`✅ Created new agent in agents collection: ${newAgent._id}`);
//       return newAgent;
//     }
//   } catch (error) {
//     console.error('❌ Error syncing to agents collection:', error);
//     // Don't throw error - this is a secondary operation
//     return null;
//   }
// }

// module.exports = { 
//   getGuideById: getGuideByUserId,
//   updateGuideProfile: updateGuideByUserId,
//   getCurrentGuideProfile,
//   getAgentBookingRequests,
//   handleBookingRequest,
//   getAgentBookingHistory,
//   isProfileComplete,
//   syncToAgentsCollection
// };





/**
 * agentdashboardcontroller.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mirrors the exact pattern of hoteldashboardcontroller.js:
 *   1. Verify JWT user exists and has role 'agent'
 *   2. Find Agent record using 3-method fallback (agent_id → manager_id → email)
 *   3. Back-fill relationships on first match so future lookups are instant
 *   4. Handle booking requests (accept / reject) and booking history
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Agent           = require('../models/Agent');
const User            = require('../models/User');
const BookingFormsData = require('../models/bookingformsdataModel');
const ProfileBooking  = require('../models/profileBooking');

// ─────────────────────────────────────────────────────────────────────────────
// Shared helper — find Agent record for a given User using 3-method fallback
// (same structure as findHotelForUser in hoteldashboardcontroller)
// ─────────────────────────────────────────────────────────────────────────────
async function findAgentForUser(user) {
  const userId = user._id.toString();
  let agent = null;

  // Method 1: user.agent_id — fastest, pre-linked
  if (user.agent_id) agent = await Agent.findById(user.agent_id);

  // Method 2: agent.manager_id
  if (!agent) agent = await Agent.findOne({ manager_id: userId });

  // Method 3: email fallback (legacy / freshly imported agents)
  if (!agent) agent = await Agent.findOne({
    $or: [
      { manager_email: user.email },
      { email: user.email }
    ]
  });

  // Back-fill relationships so future lookups hit Method 1 or 2
  if (agent) {
    let dirty = false;
    if (!agent.manager_id || agent.manager_id.toString() !== userId) {
      agent.manager_id    = userId;
      agent.manager_email = user.email;
      dirty = true;
    }
    if (!user.agent_id || user.agent_id.toString() !== agent._id.toString()) {
      user.agent_id = agent._id;
      await user.save();
    }
    if (dirty) await agent.save();
  }

  return agent;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/agentdashboard/me
// Returns the Agent profile for the currently logged-in agent user
// ─────────────────────────────────────────────────────────────────────────────
const getCurrentAgentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🔍 GET /me — userId: ${userId}`);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'agent') return res.status(403).json({ success: false, message: 'Access denied. Not an agent.' });

    const agent = await findAgentForUser(user);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found. Please contact admin to link your account.'
      });
    }

    console.log(`✅ Found agent profile: ${agent.name}`);
    res.json({ success: true, data: serializeAgent(agent, userId) });

  } catch (err) {
    console.error('❌ getCurrentAgentProfile:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/agentdashboard/:id
// Returns the Agent profile by User ID (used by agentdashboard.html legacy calls)
// ─────────────────────────────────────────────────────────────────────────────
const getAgentByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'agent') return res.status(403).json({ success: false, message: 'Access denied. Not an agent.' });

    const agent = await findAgentForUser(user);
    if (!agent)
      return res.status(404).json({ success: false, message: 'Agent profile not found.' });

    res.json({ success: true, data: serializeAgent(agent, userId) });

  } catch (err) {
    console.error('❌ getAgentByUserId:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/agentdashboard/:id
// Updates editable fields on the Agent record
// ─────────────────────────────────────────────────────────────────────────────
const updateAgentProfile = async (req, res) => {
  try {
    const userId    = req.params.id;
    const updateData = req.body;
    console.log(`🔄 PUT /${userId} — update agent profile`);

    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'agent') return res.status(403).json({ success: false, message: 'Access denied. Not an agent.' });

    const agent = await findAgentForUser(user);
    if (!agent)
      return res.status(404).json({ success: false, message: 'Agent profile not found. Please refresh the page.' });

    const ALLOWED = ['name', 'district', 'experience', 'age', 'language', 'fees', 'mobile_no', 'gender', 'rating'];
    const fields  = {};
    ALLOWED.forEach(f => { if (updateData[f] !== undefined) fields[f] = updateData[f]; });

    if (!Object.keys(fields).length)
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });

    const updated = await Agent.findByIdAndUpdate(agent._id, fields, { new: true, runValidators: true });
    console.log(`✅ Updated agent: ${updated.name}`);

    res.json({ success: true, message: 'Profile updated successfully', data: serializeAgent(updated, userId) });

  } catch (err) {
    console.error('❌ updateAgentProfile:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/agentdashboard/stats
// Returns booking counts and earnings for dashboard overview
// ─────────────────────────────────────────────────────────────────────────────
const getAgentDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user   = await User.findById(userId);
    if (!user || user.role !== 'agent')
      return res.status(403).json({ success: false, message: 'Access denied.' });

    const agent = await findAgentForUser(user);
    if (!agent)
      return res.status(404).json({ success: false, message: 'Agent profile not found.' });

    const matchQuery = buildAgentBookingQuery(userId, user.email, agent.name);

    const [total, pending, confirmed, cancelled] = await Promise.all([
      BookingFormsData.countDocuments(matchQuery),
      BookingFormsData.countDocuments({ ...matchQuery, agentConfirmed: false, status: { $in: ['pending', 'hotel_confirmed'] } }),
      BookingFormsData.countDocuments({ ...matchQuery, agentConfirmed: true, status: { $in: ['confirmed', 'agent_confirmed'] } }),
      BookingFormsData.countDocuments({ ...matchQuery, status: 'cancelled' })
    ]);

    const earningsData = await BookingFormsData.aggregate([
      { $match: { ...matchQuery, agentConfirmed: true, 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$payment.totalAmount' } } }
    ]);
    const totalEarnings = earningsData[0]?.total || 0;

    res.json({
      success: true,
      stats: { totalBookings: total, pendingRequests: pending, confirmedBookings: confirmed, cancelledBookings: cancelled, totalEarnings, agentRating: agent.rating || 0 }
    });

  } catch (err) {
    console.error('❌ getAgentDashboardStats:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/agentdashboard/bookings/requests
// Returns pending booking requests assigned to this agent
// ─────────────────────────────────────────────────────────────────────────────
const getAgentBookingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const user   = await User.findById(userId);
    if (!user || user.role !== 'agent')
      return res.status(403).json({ success: false, message: 'Access denied.' });

    const agent = await findAgentForUser(user);
    if (!agent)
      return res.status(404).json({ success: false, message: 'Agent profile not found.' });

    const bookings = await BookingFormsData.find({
      ...buildAgentBookingQuery(userId, user.email, agent.name),
      agentConfirmed: false,
      status: { $in: ['pending', 'hotel_confirmed'] }
    })
    .sort({ createdAt: -1 })
    .lean();

    console.log(`✅ Found ${bookings.length} pending requests for agent: ${agent.name}`);

    res.json({
      success: true,
      requests: bookings.map(b => transformBooking(b)),
      count: bookings.length,
      agentInfo: { name: agent.name, id: agent._id }
    });

  } catch (err) {
    console.error('❌ getAgentBookingRequests:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/agentdashboard/bookings/:bookingId/handle
// Accept or reject a booking request
// ─────────────────────────────────────────────────────────────────────────────
const handleAgentBookingRequest = async (req, res) => {
  try {
    const userId    = req.user.id;
    const { bookingId } = req.params;
    const { action, notes } = req.body;   // action: 'accept' | 'reject'

    console.log(`🔄 Agent ${userId} → booking ${bookingId} → action: ${action}`);

    const user = await User.findById(userId);
    if (!user || user.role !== 'agent')
      return res.status(403).json({ success: false, message: 'Access denied.' });

    const agent = await findAgentForUser(user);
    if (!agent)
      return res.status(404).json({ success: false, message: 'Agent profile not found.' });

    // Find booking assigned to this agent
    const booking = await BookingFormsData.findOne({
      bookingId,
      ...buildAgentBookingQuery(userId, user.email, agent.name)
    });

    if (!booking)
      return res.status(404).json({ success: false, message: 'Booking not found or not assigned to you.' });

    if (booking.agentConfirmed)
      return res.status(400).json({ success: false, message: 'Booking already processed by agent.' });

    if (action === 'accept') {
      booking.agentConfirmed   = true;
      booking.agentConfirmedAt = new Date();
      if (!booking.agent.agentId) booking.agent.agentId = userId;
      booking.status = booking.hotelConfirmed ? 'confirmed' : 'agent_confirmed';
      if (notes) booking.specialRequests = (booking.specialRequests || '') + `\n[Agent Notes]: ${notes}`;
      await booking.save();

      await ProfileBooking.findOneAndUpdate(
        { bookingId },
        { status: 'Upcoming', 'agent.contact': user.fullName, 'agent.email': user.email }
      );

      return res.json({
        success: true,
        message: 'Booking request accepted successfully!',
        booking: { bookingId: booking.bookingId, status: booking.status, agentConfirmed: true }
      });

    } else if (action === 'reject') {
      booking.status = 'cancelled';
      booking.cancellationReason = notes || 'Rejected by agent';
      if (notes) booking.specialRequests = (booking.specialRequests || '') + `\n[Agent Rejection]: ${notes}`;
      await booking.save();
      console.log(`✅ BookingFormsData status set to 'cancelled' for ${bookingId}`);

      // Update ProfileBooking — use both bookingId string and _id fallback
      const pbResult = await ProfileBooking.findOneAndUpdate(
        { $or: [{ bookingId }, { bookingId: booking._id.toString() }] },
        { status: 'Cancelled' },
        { new: true }
      );
      console.log(pbResult
        ? `✅ ProfileBooking updated to Cancelled for ${bookingId}`
        : `⚠️  ProfileBooking not found for ${bookingId} — client profile will still show Cancelled via BookingFormsData`
      );

      return res.json({
        success: true,
        message: 'Booking request rejected.',
        booking: { bookingId: booking.bookingId, status: 'cancelled' }
      });

    } else {
      return res.status(400).json({ success: false, message: "Invalid action. Use 'accept' or 'reject'." });
    }

  } catch (err) {
    console.error('❌ handleAgentBookingRequest:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/agentdashboard/bookings/history
// Returns bookings this agent has already acted on
// ─────────────────────────────────────────────────────────────────────────────
const getAgentBookingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const user   = await User.findById(userId);
    if (!user || user.role !== 'agent')
      return res.status(403).json({ success: false, message: 'Access denied.' });

    const agent = await findAgentForUser(user);
    if (!agent)
      return res.status(404).json({ success: false, message: 'Agent profile not found.' });

    const history = await BookingFormsData.find({
      $and: [
        buildAgentBookingQuery(userId, user.email, agent.name),
        { $or: [{ agentConfirmed: true }, { status: 'cancelled' }] }
      ]
    })
    .sort({ agentConfirmedAt: -1, updatedAt: -1 })
    .lean();

    res.json({
      success: true,
      history: history.map(b => ({
        bookingId   : b.bookingId,
        tourName    : b.tourName,
        customer    : b.user?.fullName || b.tourist?.name || 'Unknown',
        travelers   : b.tourist?.totalTravellers || 1,
        amount      : b.payment?.totalAmount || 0,
        status      : b.status,
        confirmedAt : b.agentConfirmedAt || b.updatedAt,
        tripDates   : { start: b.hotel?.fromDate, end: b.hotel?.toDate },
        hotel       : b.hotel?.name || 'Not specified'
      })),
      count: history.length
    });

  } catch (err) {
    console.error('❌ getAgentBookingHistory:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Build a $or query that matches bookings for this agent regardless of
 *  how the booking was stored (by agentId ObjectId, by email, or by name) */
function buildAgentBookingQuery(userId, email, agentName) {
  return {
    $or: [
      { 'agent.agentId': userId },
      { 'agent.email'  : email },
      { 'agent.name'   : agentName },
      { 'agent.name'   : { $regex: agentName, $options: 'i' } }
    ]
  };
}

/** Strip sensitive fields and normalise the agent object for the frontend */
function serializeAgent(agent, managerId) {
  return {
    _id        : agent._id,
    name       : agent.name,
    district   : agent.district,
    experience : agent.experience,
    age        : agent.age,
    language   : agent.language,
    fees       : agent.fees,
    rating     : agent.rating,
    mobile_no  : agent.mobile_no ? agent.mobile_no.toString() : '',
    gender     : agent.gender,
    email      : agent.email || '',
    image      : agent.image || 'assets/images/default-avatar.jpg',
    managerId  : managerId
  };
}

/** Flatten a raw bookingformsdata document for the dashboard UI */
function transformBooking(b) {
  return {
    _id         : b._id,
    bookingId   : b.bookingId,
    tourName    : b.tourName,
    touristPlaces: b.touristPlaces,
    customer: {
      name    : b.user?.fullName  || b.tourist?.name || 'Unknown',
      email   : b.tourist?.email  || '',
      phone   : b.tourist?.phone  || '',
      address : b.user?.address   || ''
    },
    tripDetails: {
      travelers : b.tourist?.totalTravellers || 1,
      startDate : b.hotel?.fromDate,
      endDate   : b.hotel?.toDate,
      duration  : b.tourDuration,
      places    : b.touristPlaces
    },
    hotel: {
      name    : b.hotel?.name    || '',
      address : b.hotel?.address || '',
      checkIn : b.hotel?.fromDate,
      checkOut: b.hotel?.toDate
    },
    payment: {
      totalAmount : b.payment?.totalAmount || 0,
      status      : b.payment?.status || 'pending'
    },
    status         : b.status,
    hotelConfirmed : b.hotelConfirmed,
    agentConfirmed : b.agentConfirmed,
    specialRequests: b.specialRequests,
    requestedAt    : b.createdAt,
    updatedAt      : b.updatedAt
  };
}

module.exports = {
  getCurrentAgentProfile,
  getAgentByUserId,
  updateAgentProfile,
  getAgentDashboardStats,
  getAgentBookingRequests,
  handleAgentBookingRequest,
  getAgentBookingHistory
};