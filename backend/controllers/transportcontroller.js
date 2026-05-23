const Transport = require('../models/Transport');

exports.getTransports = async (req, res) => {
  try {
    const transports = await Transport.find();
    
    // Transform the data to match frontend expectations
    const transformedTransports = transports.map(transport => {
      // Create driver object from individual driver fields
      // Based on API response: car_name, car_model, car_type, driver_name, phone_number, email_id, car_no
      const driverInfo = {
        name: transport.driver_name || 'Available Driver',
        phone: transport.phone_number || '9876543210', 
        email: transport.email_id || 'driver@gmail.com',
        vehicleNumber: transport.car_no || 'GJ01XX0001',
        bookedDates: [] // Initialize empty - bookings will be managed separately
      };
      
      return {
        _id: transport._id,
        carName: (transport.car_name && transport.car_model) ? 
                 `${transport.car_name} ${transport.car_model}` : 
                 (transport.car_name || `${transport.car_type || 'Standard'} Vehicle`),
        type: transport.type || `${transport.seating_capacity}-Seater`,
        fuel: transport.fuel_type || 'Petrol',
        ac: transport.ac_non_ac === 'AC',
        price: transport['price_value (per km)'] ? 
               `₹${transport['price_value (per km)']}/km` : '₹12/km',
        location: transport.location || 'Gujarat',
        seating_capacity: transport.seating_capacity,
        car_type: transport.car_type ? transport.car_type.toLowerCase() : 'sedan',
        drivers: transport.drivers && transport.drivers.length > 0 ? transport.drivers : [driverInfo]
      };
    });
    
    console.log(`📊 Returning ${transformedTransports.length} transformed transport records`);
    res.json(transformedTransports);
  } catch (err) {
    console.error('❌ Error fetching transports:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.addTransport = async (req, res) => {
  try {
    const newTransport = new Transport(req.body);
    await newTransport.save();
    res.status(201).json(newTransport);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
