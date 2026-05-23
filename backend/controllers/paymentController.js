const BookingFormsData = require("../models/bookingformsdataModel");
const ProfileBooking = require("../models/profileBooking");

// Process payment for a confirmed booking
const processPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const { paymentMethod, cardDetails, upiId } = req.body;
    
    console.log(`🔄 Processing payment for booking: ${bookingId}`);
    
    // Find the booking
    const booking = await BookingFormsData.findOne({ 
      bookingId: bookingId,
      userId: userId 
    });
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found or not authorized" 
      });
    }
    
    // Check if booking is confirmed by both agent and hotel
    if (booking.status !== "confirmed") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking must be confirmed by both agent and hotel before payment",
        currentStatus: booking.status,
        progress: {
          agentConfirmed: booking.agentConfirmed,
          hotelConfirmed: booking.hotelConfirmed
        }
      });
    }
    
    // Check if payment is already completed
    if (booking.payment.status === "completed") {
      return res.status(400).json({ 
        success: false, 
        message: "Payment already completed for this booking" 
      });
    }
    
    // Simulate payment processing (in real app, integrate with payment gateway)
    const transactionId = generateTransactionId();
    const paymentSuccess = await simulatePaymentProcessing(paymentMethod, booking.payment.totalAmount);
    
    if (paymentSuccess) {
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
      
      console.log(`✅ Payment completed for booking: ${bookingId}`);
      
      res.status(200).json({ 
        success: true, 
        message: "Payment processed successfully!",
        transactionId: transactionId,
        booking: {
          bookingId: booking.bookingId,
          status: booking.status,
          paymentStatus: booking.payment.status,
          amount: booking.payment.totalAmount,
          paidAt: booking.payment.paidAt
        }
      });
    } else {
      // Payment failed
      booking.payment.status = "failed";
      await booking.save();
      
      console.log(`❌ Payment failed for booking: ${bookingId}`);
      
      res.status(400).json({ 
        success: false, 
        message: "Payment processing failed. Please try again.",
        booking: {
          bookingId: booking.bookingId,
          paymentStatus: "failed"
        }
      });
    }
    
  } catch (error) {
    console.error("❌ Error processing payment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while processing payment",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get payment details for a booking
const getPaymentDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    
    const booking = await BookingFormsData.findOne({ 
      bookingId: bookingId,
      userId: userId 
    }).select('bookingId tourName payment status agentConfirmed hotelConfirmed');
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found or not authorized" 
      });
    }
    
    const paymentDetails = {
      bookingId: booking.bookingId,
      tourName: booking.tourName,
      amount: booking.payment.totalAmount,
      status: booking.payment.status,
      method: booking.payment.paymentMethod || null,
      transactionId: booking.payment.transactionId || null,
      paidAt: booking.payment.paidAt || null,
      canPay: booking.status === "confirmed", // User can pay only when both confirmations are done
      bookingStatus: booking.status,
      confirmations: {
        agent: booking.agentConfirmed,
        hotel: booking.hotelConfirmed
      }
    };
    
    res.json({ 
      success: true, 
      paymentDetails 
    });
    
  } catch (error) {
    console.error("❌ Error fetching payment details:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching payment details" 
    });
  }
};

// Get payment history for user
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const paidBookings = await BookingFormsData.find({ 
      userId: userId,
      'payment.status': 'completed'
    })
    .select('bookingId tourName payment createdAt')
    .sort({ 'payment.paidAt': -1 })
    .lean();
    
    const paymentHistory = paidBookings.map(booking => ({
      bookingId: booking.bookingId,
      tourName: booking.tourName,
      amount: booking.payment.totalAmount,
      paymentMethod: booking.payment.paymentMethod,
      transactionId: booking.payment.transactionId,
      paidAt: booking.payment.paidAt,
      bookingDate: booking.createdAt
    }));
    
    res.json({ 
      success: true, 
      paymentHistory,
      total: paymentHistory.length
    });
    
  } catch (error) {
    console.error("❌ Error fetching payment history:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching payment history" 
    });
  }
};

// Helper function to generate transaction ID
function generateTransactionId() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TXN${timestamp.slice(-8)}${random}`;
}

// Helper function to simulate payment processing
async function simulatePaymentProcessing(paymentMethod, amount) {
  // Simulate payment gateway delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, assume 95% success rate
  // In real implementation, this would call actual payment gateway APIs
  const successRate = 0.95;
  return Math.random() < successRate;
}

module.exports = {
  processPayment,
  getPaymentDetails,
  getPaymentHistory
};
