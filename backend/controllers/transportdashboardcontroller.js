const Transport = require('../models/Transport');
const User = require('../models/User');
const BookingFormsData = require('../models/bookingformsdataModel');
const ProfileBooking = require('../models/profileBooking');

// @desc    Get transport dashboard statistics
// @route   GET /api/transportdashboard/stats
// @access  Private (only transport)
const getTransportDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // For now, we'll provide general statistics
    // In the future, this can be filtered by user/manager
    
    console.log('📊 Fetching transport dashboard statistics...');
    
    // Get total vehicles count
    const totalVehicles = await Transport.countDocuments();
    
    // Get car types summary (include vehicles for frontend mapping)
    const carTypeStats = await Transport.aggregate([
      {
        $group: {
          _id: '$car_type',
          count: { $sum: 1 },
          avgSeating: { $avg: '$seating_capacity' },
          vehicles: {
            $push: {
              id: '$_id',
              carName: '$carName',
              seating_capacity: '$seating_capacity',
              car_type: '$car_type',
              fuel: '$fuel',
              ac: '$ac',
              price: '$price',
              location: '$location',
              drivers: '$drivers',
              vehicleNumber: { $arrayElemAt: ['$drivers.vehicleNumber', 0] }
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get location distribution
    const locationStats = await Transport.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get fuel type distribution
    const fuelTypeStats = await Transport.aggregate([
      {
        $group: {
          _id: '$fuel',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get AC vs Non-AC distribution
    const acStats = await Transport.aggregate([
      {
        $group: {
          _id: '$ac',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get seating capacity distribution
    const seatingStats = await Transport.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$seating_capacity', 4] }, then: '1-4 Seater' },
                { case: { $lte: ['$seating_capacity', 7] }, then: '5-7 Seater' },
                { case: { $lte: ['$seating_capacity', 12] }, then: '8-12 Seater' }
              ],
              default: '12+ Seater'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Calculate booking statistics (if booking data exists)
    let bookingStats = {
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0
    };
    
    try {
      // This assumes transport bookings are stored in BookingFormsData
      // Modify according to your actual booking schema
      const totalTransportBookings = await BookingFormsData.countDocuments({
        'transport': { $exists: true }
      });
      
      bookingStats.totalBookings = totalTransportBookings;
      
      const pendingTransportBookings = await BookingFormsData.countDocuments({
        'transport': { $exists: true },
        status: { $in: ['pending', 'agent_confirmed'] },
        transportConfirmed: { $ne: true }
      });
      
      bookingStats.pendingBookings = pendingTransportBookings;
      
      const confirmedTransportBookings = await BookingFormsData.countDocuments({
        'transport': { $exists: true },
        transportConfirmed: true,
        status: { $in: ['confirmed', 'transport_confirmed'] }
      });
      
      bookingStats.confirmedBookings = confirmedTransportBookings;
      
      const cancelledTransportBookings = await BookingFormsData.countDocuments({
        'transport': { $exists: true },
        status: 'cancelled'
      });
      
      bookingStats.cancelledBookings = cancelledTransportBookings;
      
    } catch (bookingError) {
      console.log('⚠️ Booking stats not available:', bookingError.message);
    }
    
    // Group and map car types to frontend display format
    const typeMapping = {};
    
    carTypeStats.forEach(stat => {
      const dbType = (stat._id || '').toLowerCase();
      const avgSeating = Math.round(stat.avgSeating || 0);
      
      let displayType;
      // Map database car_type to frontend display type
      switch(dbType) {
        case 'hatchback': displayType = '3-Seater'; break;
        case 'sedan': displayType = '4-Seater'; break;
        case 'suv': displayType = '7-Seater'; break;
        case 'van': 
          displayType = avgSeating >= 10 ? 'Van' : `${avgSeating}-Seater`;
          break;
        case 'tempo': displayType = 'Tempo'; break;
        case 'ecco': displayType = 'Ecco'; break;
        default: displayType = `${avgSeating}-Seater`;
      }
      
      if (!typeMapping[displayType]) {
        typeMapping[displayType] = {
          type: displayType,
          count: 0,
          totalSeating: 0,
          vehicles: []
        };
      }
      
      typeMapping[displayType].count += stat.count;
      typeMapping[displayType].totalSeating += stat.avgSeating * stat.count;
      
      // Add vehicles with display type
      stat.vehicles.forEach(vehicle => {
        typeMapping[displayType].vehicles.push({
          id: vehicle.id,
          carName: vehicle.carName,
          seating_capacity: vehicle.seating_capacity,
          car_type: vehicle.car_type,
          fuel: vehicle.fuel,
          ac: vehicle.ac,
          price: vehicle.price,
          location: vehicle.location,
          type: displayType, // Set the display type for each vehicle
          vehicleNumber: vehicle.vehicleNumber,
          drivers: vehicle.drivers && vehicle.drivers.length > 0 ? vehicle.drivers : [{
            name: 'Available Driver',
            phone: '9876543210',
            email: 'driver@gmail.com',
            vehicleNumber: vehicle.vehicleNumber || 'GJ01XX0001',
            bookedDates: []
          }]
        });
      });
    });
    
    // Convert to array and calculate averages
    const carTypesSummary = Object.values(typeMapping).map(group => ({
      type: group.type,
      count: group.count,
      averageSeating: Math.round(group.totalSeating / group.count),
      vehicles: group.vehicles
    }));
    
    console.log('🔄 Type mapping result:', carTypesSummary.map(t => ({ type: t.type, count: t.count })));
    
    const response = {
      success: true,
      stats: {
        overview: {
          totalVehicles,
          totalBookings: bookingStats.totalBookings,
          pendingBookings: bookingStats.pendingBookings,
          confirmedBookings: bookingStats.confirmedBookings,
          totalRevenue: bookingStats.totalRevenue
        },
        carTypes: carTypesSummary,
        locations: locationStats.map(stat => ({
          location: stat._id || 'Unknown',
          count: stat.count
        })),
        fuelTypes: fuelTypeStats.map(stat => ({
          type: stat._id || 'Unknown',
          count: stat.count
        })),
        acDistribution: {
          ac: acStats.find(s => s._id === true)?.count || 0,
          nonAc: acStats.find(s => s._id === false)?.count || 0
        },
        seatingCapacity: seatingStats.map(stat => ({
          range: stat._id,
          count: stat.count
        }))
      }
    };
    
    console.log(`✅ Transport dashboard stats calculated: ${totalVehicles} total vehicles`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error fetching transport dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get car types summary (specific endpoint for the dashboard)
// @route   GET /api/transportdashboard/car-types
// @access  Private (only transport)
const getCarTypesSummary = async (req, res) => {
  try {
    console.log('🚗 Fetching car types summary...');
    
    const carTypeStats = await Transport.aggregate([
      {
        $group: {
          _id: '$car_type',
          count: { $sum: 1 },
          avgSeating: { $avg: '$seating_capacity' },
          vehicles: {
            $push: {
              id: '$_id',
              carName: '$carName',
              seating_capacity: '$seating_capacity',
              car_type: '$car_type',
              fuel: '$fuel',
              ac: '$ac',
              price: '$price',
              location: '$location',
              drivers: '$drivers',
              vehicleNumber: { $arrayElemAt: ['$drivers.vehicleNumber', 0] } // Get first driver's vehicle number
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const summary = carTypeStats.map(stat => ({
      type: stat._id || 'Unknown',
      count: stat.count,
      averageSeating: Math.round(stat.avgSeating || 0),
      vehicles: stat.vehicles
    }));
    
    console.log(`✅ Car types summary: ${summary.length} different types found`);
    
    res.json({
      success: true,
      data: summary,
      totalTypes: summary.length,
      totalVehicles: summary.reduce((acc, curr) => acc + curr.count, 0)
    });
    
  } catch (error) {
    console.error('❌ Error fetching car types summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching car types summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get transport booking requests
// @route   GET /api/transportdashboard/booking-requests
// @access  Private (only transport)
const getTransportBookingRequests = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log(`🔍 Fetching transport booking requests...`);
    
    // For now, get all transport-related bookings
    // In the future, this can be filtered by transport manager/company
    const bookingRequests = await BookingFormsData.find({
      'transport': { $exists: true },
      status: { $in: ['pending', 'agent_confirmed', 'hotel_confirmed'] },
      transportConfirmed: { $ne: true }
    })
    .populate('userId', 'fullName email phone')
    .sort({ createdAt: -1 })
    .lean();
    
    const transformedRequests = bookingRequests.map(booking => ({
      _id: booking._id,
      bookingId: booking.bookingId,
      tourName: booking.tourName,
      customer: {
        name: booking.userId?.fullName || 'Unknown',
        email: booking.tourist?.email || 'Unknown',
        phone: booking.tourist?.phone || 'Unknown'
      },
      tripDetails: {
        travelers: booking.tourist?.totalTravellers || 0,
        startDate: booking.transport?.fromDate || booking.startDate,
        endDate: booking.transport?.toDate || booking.endDate,
        duration: booking.tourDuration,
        places: booking.touristPlaces
      },
      transport: booking.transport,
      status: booking.status,
      requestedAt: booking.createdAt
    }));
    
    console.log(`✅ Found ${transformedRequests.length} transport booking requests`);
    
    res.json({
      success: true,
      requests: transformedRequests,
      count: transformedRequests.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching transport booking requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get transport booking history
// @route   GET /api/transportdashboard/booking-history
// @access  Private (only transport)
const getTransportBookingHistory = async (req, res) => {
  try {
    console.log('📊 Fetching transport booking history...');
    
    const bookingHistory = await BookingFormsData.find({
      'transport': { $exists: true },
      transportConfirmed: true
    })
    .populate('userId', 'fullName email phone')
    .sort({ transportConfirmedAt: -1 })
    .lean();
    
    const transformedHistory = bookingHistory.map(booking => ({
      bookingId: booking.bookingId,
      tourName: booking.tourName,
      customer: booking.userId?.fullName || 'Unknown',
      travelers: booking.tourist?.totalTravellers || 0,
      amount: booking.payment?.totalAmount || 0,
      status: booking.status,
      confirmedAt: booking.transportConfirmedAt,
      transport: booking.transport
    }));
    
    console.log(`✅ Found ${transformedHistory.length} transport booking history records`);
    
    res.json({
      success: true,
      history: transformedHistory,
      count: transformedHistory.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching transport booking history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Handle transport booking request (accept/reject)
// @route   POST /api/transportdashboard/booking-request/:bookingId
// @access  Private (only transport)
const handleTransportBookingRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action, notes, assignment } = req.body; // action: 'accept' | 'reject'
    const userId = req.user?.id; // may be undefined if route is public in demo
    
    console.log(`🔄 Handling transport booking ${bookingId} with action: ${action}`);
    
    const booking = await BookingFormsData.findOne({ bookingId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (action === 'accept') {
      // Persist driver/vehicle assignment if provided
      if (assignment && typeof assignment === 'object') {
        booking.transport = booking.transport || {};
        booking.transport.vehicleType = assignment.vehicleType || booking.transport.vehicleType;
        booking.transport.vehicleName = assignment.vehicleName || booking.transport.vehicleName;
        booking.transport.vehicleNumber = assignment.vehicleNumber || booking.transport.vehicleNumber;
        booking.transport.driverName = assignment.driverName || booking.transport.driverName;
        booking.transport.driverPhone = assignment.driverPhone || booking.transport.driverPhone;
        booking.transport.driverEmail = assignment.driverEmail || booking.transport.driverEmail;
        booking.transport.pricePerKm = assignment.pricePerKm || booking.transport.pricePerKm;
        booking.transport.features = assignment.features || booking.transport.features;
        booking.transport.pickupLocation = assignment.pickupLocation || booking.transport.pickupLocation;
        booking.transport.managerId = userId || booking.transport.managerId;
        booking.transport.assignedAt = new Date();
        booking.transport.confirmationStatus = 'confirmed';
      }

      booking.transportConfirmed = true;
      booking.transportConfirmedAt = new Date();
      
      // Update status based on other confirmations
      if (booking.hotelConfirmed && booking.agentConfirmed) {
        booking.status = 'confirmed';
      } else {
        booking.status = 'transport_confirmed';
      }
      
      if (notes) {
        booking.specialRequests = (booking.specialRequests || '') + `\n[Transport Notes]: ${notes}`;
      }
      
      await booking.save();
      
      // Update profile booking if exists (reflect in client profile)
      await ProfileBooking.findOneAndUpdate(
        { bookingId: bookingId },
        { status: booking.status === 'confirmed' ? 'Upcoming' : 'Upcoming' },
        { new: true }
      );
      
      console.log(`✅ Transport booking ${bookingId} accepted and driver assigned`);
      
      return res.json({
        success: true,
        message: 'Booking request accepted successfully!',
        booking: {
          bookingId: booking.bookingId,
          status: booking.status,
          transportConfirmed: booking.transportConfirmed,
          transport: booking.transport
        }
      });
      
    } else if (action === 'reject') {
      booking.status = 'cancelled';
      booking.transport = booking.transport || {};
      booking.transport.confirmationStatus = 'rejected';
      
      if (notes) {
        booking.specialRequests = (booking.specialRequests || '') + `\n[Transport Rejection]: ${notes}`;
      }
      
      await booking.save();
      
      await ProfileBooking.findOneAndUpdate(
        { bookingId: bookingId },
        { status: 'Cancelled' },
        { new: true }
      );
      
      console.log(`❌ Transport booking ${bookingId} rejected`);
      
      return res.json({
        success: true,
        message: 'Booking request rejected.',
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
    console.error('❌ Error handling transport booking request:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing booking request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get vehicle details for dashboard
// @route   GET /api/transportdashboard/vehicles
// @access  Private (only transport)
const getVehicleDetails = async (req, res) => {
  try {
    console.log('🚗 Fetching vehicle details for dashboard...');
    
    const vehicles = await Transport.find({})
      .select('carName seating_capacity car_type fuel ac price location drivers')
      .lean();
    
    const vehicleDetails = vehicles.map(vehicle => ({
      _id: vehicle._id,
      carName: vehicle.carName,
      type: vehicle.car_type,
      seating: vehicle.seating_capacity,
      fuel: vehicle.fuel,
      ac: vehicle.ac,
      price: vehicle.price,
      location: vehicle.location,
      driversCount: vehicle.drivers ? vehicle.drivers.length : 0,
      available: true // This could be calculated based on bookings
    }));
    
    console.log(`✅ Found ${vehicleDetails.length} vehicles`);
    
    res.json({
      success: true,
      vehicles: vehicleDetails,
      count: vehicleDetails.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching vehicle details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicle details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getTransportDashboardStats,
  getCarTypesSummary,
  getTransportBookingRequests,
  getTransportBookingHistory,
  handleTransportBookingRequest,
  getVehicleDetails
};