
// Hotel Dashboard JavaScript

// Configuration
// const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000/api';
// const HOTEL_DASHBOARD_API = `${API_BASE_URL}/hoteldashboard`;

// const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23e9ecef'/%3E%3Ctext x='150' y='90' font-family='Arial' font-size='14' fill='%236c757d' text-anchor='middle'%3E%3Ctspan x='150' dy='0'%3E%F0%9F%8F%A8%3C/tspan%3E%3Ctspan x='150' dy='25'%3EHotel Image%3C/tspan%3E%3C/text%3E%3C/svg%3E";

// // Global variables
// let currentUser = null;
// let hotelData = null;
// let currentBookingForAction = null;
// let galleryImages = []; // Store gallery images

// // Authentication functions
// function getAuthToken() {
//     const authToken = localStorage.getItem('authToken');
//     const regularToken = localStorage.getItem('token');
//     const token = authToken || regularToken;
    
//     console.log('Token check:', {
//         authToken: authToken ? 'present' : 'missing',
//         regularToken: regularToken ? 'present' : 'missing',
//         using: token ? 'found token' : 'no token'
//     });
    
//     return token;
// }

// function isAuthenticated() {
//     const token = getAuthToken();
//     return token !== null;
// }

// function logout() {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     localStorage.removeItem('userRole');
//     localStorage.removeItem('userEmail');
//     localStorage.removeItem('userId');
//     window.location.href = 'sign in.html';
// }

// // API request function with error handling
// async function makeAPIRequest(url, options = {}) {
//     const token = getAuthToken();
    
//     if (!token) {
//         console.error('No authentication token available');
//         showAlert('Authentication required. Please login again.', 'error');
//         logout();
//         return null;
//     }
    
//     const defaultOptions = {
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//             ...options.headers
//         }
//     };

//     const mergedOptions = { ...defaultOptions, ...options };

//     try {
//         showLoading(true);
//         console.log(`Making API request to: ${url}`);
//         console.log('Request options:', {
//             method: mergedOptions.method || 'GET',
//             headers: mergedOptions.headers,
//             body: mergedOptions.body ? 'present' : 'none'
//         });
        
//         const response = await fetch(url, mergedOptions);
//         console.log('Raw response status:', response.status, response.statusText);
        
//         let data;
//         const contentType = response.headers.get('content-type');
        
//         if (contentType && contentType.includes('application/json')) {
//             data = await response.json();
//         } else {
//             const textData = await response.text();
//             console.log('Non-JSON response:', textData);
//             try {
//                 data = JSON.parse(textData);
//             } catch {
//                 data = { message: textData, status: response.status };
//             }
//         }

//         console.log('Parsed response data:', data);

//         if (!response.ok) {
//             if (response.status === 401) {
//                 showAlert('Session expired. Please login again.', 'error');
//                 logout();
//                 return null;
//             }
            
//             const errorMessage = data?.message || `HTTP ${response.status}: ${response.statusText}`;
//             console.error('API Error Response:', errorMessage);
//             throw new Error(errorMessage);
//         }

//         return data;
//     } catch (error) {
//         console.error('API Request Error:', error);
        
//         // Don't show alerts for expected errors (they're handled by caller)
//         if (!error.message.includes('Session expired')) {
//             console.error('Detailed error info:', {
//                 url,
//                 method: options.method || 'GET',
//                 error: error.message
//             });
//         }
        
//         throw error; // Re-throw so caller can handle
//     } finally {
//         showLoading(false);
//     }
// }

// // Utility functions
// function showLoading(show) {
//     const loader = document.getElementById('loading');
//     if (loader) {
//         loader.style.display = show ? 'block' : 'none';
//     }
// }

// function showAlert(message, type = 'info') {
//     // Create alert element
//     const alertDiv = document.createElement('div');
//     alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
//     alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
//     alertDiv.innerHTML = `
//         <strong>${type === 'error' ? 'Error!' : type === 'success' ? 'Success!' : 'Info!'}</strong> ${message}
//         <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
//     `;
    
//     document.body.appendChild(alertDiv);
    
//     // Auto remove after 5 seconds
//     setTimeout(() => {
//         if (alertDiv.parentNode) {
//             alertDiv.parentNode.removeChild(alertDiv);
//         }
//     }, 5000);
// }

// function formatDate(dateString) {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//     });
// }

// function formatDateTime(dateString) {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-IN', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//     });
// }

// function sanitizePrice(value) {
//     // Accept numbers or strings like "3000", "₹3000", "3,000", etc.
//     if (value === null || value === undefined || value === '') return 0;
//     if (typeof value === 'number') return isNaN(value) ? 0 : value;
//     const cleaned = String(value).replace(/[^0-9.]/g, '');
//     const num = Number(cleaned);
//     return isNaN(num) ? 0 : num;
// }

// function formatCurrency(amount) {
//     const num = sanitizePrice(amount);
//     return `₹${num.toLocaleString('en-IN')}`;
// }

// // Mobile sidebar toggle
// function toggleMobileSidebar() {
//     const sidebar = document.querySelector('.sidebar');
//     const overlay = document.getElementById('sidebarOverlay');
//     sidebar.classList.toggle('show');
//     overlay.classList.toggle('show');
// }

// // Section navigation
// function showSection(sectionName) {
//     console.log(`Showing section: ${sectionName}`);
    
//     // Close mobile sidebar if open
//     const sidebar = document.querySelector('.sidebar');
//     const overlay = document.getElementById('sidebarOverlay');
//     if (sidebar && sidebar.classList.contains('show')) {
//         sidebar.classList.remove('show');
//         overlay && overlay.classList.remove('show');
//     }
    
//     // Hide all sections
//     document.querySelectorAll('.content-section').forEach(section => {
//         section.classList.remove('active');
//     });
    
//     // Remove active class from all nav links
//     document.querySelectorAll('.sidebar .nav-link').forEach(link => {
//         link.classList.remove('active');
//     });
    
//     // Show selected section
//     const targetSection = document.getElementById(`${sectionName}-section`);
//     if (targetSection) {
//         targetSection.classList.add('active');
//     }
    
//     // Add active class to clicked nav link
//     document.querySelectorAll('.sidebar .nav-link').forEach(link => {
//         if (link.onclick && link.onclick.toString().includes(sectionName)) {
//             link.classList.add('active');
//         }
//     });
    
//     // Load data for specific sections
//     switch (sectionName) {
//         case 'dashboard':
//             loadDashboardData();
//             break;
//         case 'profile':
//             console.log('Loading profile section...');
//             loadHotelProfile();
//             break;
//         case 'requests':
//             loadBookingRequests();
//             break;
//         case 'history':
//             loadBookingHistory();
//             break;
//         case 'rooms':
//             loadRoomTypes();
//             break;
//     }
// }

// // Dashboard functions
// async function loadDashboardData() {
//     console.log('Loading dashboard data...');
    
//     try {
//         // Use the dedicated stats endpoint — it already filters by hotel correctly
//         const statsResponse = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/stats`);
        
//         if (statsResponse && statsResponse.success) {
//             updateDashboardStats(statsResponse.stats);
//             updateRequestsCount(statsResponse.stats.pendingRequests);
//         }
        
//         // Load recent pending booking requests for the dashboard preview
//         const requestsResponse = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/bookings/requests`);
        
//         if (requestsResponse && requestsResponse.success) {
//             const recentBookings = (requestsResponse.requests || []).slice(0, 5).map(booking => ({
//                 bookingId: booking.bookingId || booking._id,
//                 customer: {
//                     name: booking.customer?.name || 'Unknown'
//                 },
//                 tripDetails: {
//                     travelers: booking.tripDetails?.travelers || 1
//                 },
//                 payment: {
//                     totalAmount: booking.payment?.totalAmount || 0
//                 },
//                 status: booking.status || 'pending',
//                 requestedAt: booking.requestedAt || new Date()
//             }));
//             displayRecentBookings(recentBookings);
//         } else {
//             displayRecentBookings([]);
//         }
        
//     } catch (error) {
//         console.error('Error loading dashboard data:', error);
//         showAlert('Failed to load dashboard data', 'error');
//     }
// }

// function updateDashboardStats(stats) {
//     document.getElementById('totalBookings').textContent = stats.totalBookings || 0;
//     document.getElementById('pendingRequests').textContent = stats.pendingRequests || 0;
//     document.getElementById('confirmedBookings').textContent = stats.confirmedBookings || 0;
//     document.getElementById('totalRevenue').textContent = stats.totalRevenue
//         ? Number(stats.totalRevenue).toLocaleString('en-IN') : '0';
// }

// function updateRequestsCount(count) {
//     const badge = document.getElementById('requestsCount');
//     if (badge) {
//         badge.textContent = count || 0;
//     }
// }

// function displayRecentBookings(bookings) {
//     const container = document.getElementById('recentBookings');
    
//     if (!bookings || bookings.length === 0) {
//         container.innerHTML = '<p class="text-muted">No recent booking requests.</p>';
//         return;
//     }
    
//     const html = bookings.map(booking => `
//         <div class="border-bottom py-3">
//             <div class="row align-items-center">
//                 <div class="col-md-3">
//                     <strong>${booking.bookingId}</strong>
//                     <br><small class="text-muted">${booking.customer.name}</small>
//                 </div>
//                 <div class="col-md-3">
//                     <span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span>
//                     <br><small class="text-muted">${formatDate(booking.requestedAt)}</small>
//                 </div>
//                 <div class="col-md-3">
//                     <strong>${formatCurrency(booking.payment.totalAmount)}</strong>
//                     <br><small class="text-muted">${booking.tripDetails.travelers} travelers</small>
//                 </div>
//                 <div class="col-md-3 text-end">
//                     <button class="btn btn-sm btn-outline-primary" onclick="viewBookingDetails('${booking.bookingId}')">
//                         <i class="fas fa-eye me-1"></i>View
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `).join('');
    
//     container.innerHTML = html;
// }

// function getStatusColor(status) {
//     const statusColors = {
//         'pending': 'warning',
//         'agent_confirmed': 'info',
//         'hotel_confirmed': 'primary',
//         'hotel_accepted': 'primary',
//         'hotel_rejected': 'danger',
//         'confirmed': 'success',
//         'cancelled': 'danger',
//         'completed': 'success',
//         'payment_complete': 'success'
//     };
//     return statusColors[status] || 'secondary';
// }

// async function refreshDashboard() {
//     await loadDashboardData();
//     showAlert('Dashboard refreshed successfully!', 'success');
// }

// // Hotel Profile functions
// function createDummyHotelData() {
//     // Create dummy hotel data for first-time setup
//     hotelData = {
//         _id: null, // Flag to indicate this is a new hotel profile
//         manager_email: currentUser.email,
//         hotel_details: {
//             hotel_name: 'Enter Hotel Name',
//             description: 'Enter hotel description here...',
//             contact: 'Enter contact number',
//             location: {
//                 district: 'Enter district',
//                 pincode: 380001
//             },
//             check_in_time: '14:00',
//             check_out_time: '12:00',
//             amenities: []
//         },
//         rooms: [],
//         gallery: [],
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//     };
    
//     console.log('Created dummy hotel data for first-time setup:', hotelData);
    
//     // Populate the form with dummy data
//     populateProfileForm(hotelData);
//     updateProfileStatus('new');
//     showAlert('Welcome! Please fill in your hotel details to create your profile.', 'info');
// }

// async function loadHotelProfile() {
//     console.log('Loading hotel profile...');
    
//     try {
//         // Show loading states
//         updateProfileStatus('loading');
//         showLoading(true);
        
//         // Get current user data first to ensure we have user info
//         const userData = localStorage.getItem('user');
//         if (userData) {
//             currentUser = JSON.parse(userData);
//             // Normalize: ensure both .id and ._id are present
//             if (!currentUser.id && currentUser._id) currentUser.id = currentUser._id;
//             if (!currentUser._id && currentUser.id) currentUser._id = currentUser.id;
//             console.log('Current user loaded:', currentUser);
//         }
        
//         if (!currentUser || !currentUser.id) {
//             throw new Error('User not properly authenticated. Please login again.');
//         }
        
//         // 🔧 SIMPLIFIED: Use the /me endpoint which handles all the complex logic
//         console.log('🔍 Fetching hotel profile using /me endpoint for user:', currentUser.email);
        
//         let response = null;
        
//         try {
//             // Use the /me endpoint that handles all the relationship logic
//             response = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/me`);
            
//             if (response && response.success && response.data) {
//                 console.log('✅ Successfully loaded hotel data via /me endpoint');
//             }
//         } catch (error) {
//             console.log('❌ Failed to load hotel via /me endpoint:', error.message);
//             // The /me endpoint will automatically create a hotel if none exists
//             // So if this fails, it's a real error
//             throw error;
//         }
        
//         console.log('Final hotel profile response:', response);
        
//         if (response && response.success && response.data) {
//             hotelData = response.data;
//             console.log('✅ Hotel data loaded successfully:', {
//                 hotelId: hotelData._id,
//                 hotelName: hotelData.hotel_details?.hotel_name,
//                 managerId: hotelData.manager_id,
//                 managerEmail: hotelData.manager_email
//             });
            
//             // The backend guarantees we have hotel data at this point
//             populateProfileForm(hotelData);
//             updateProfileStatus('loaded');
//             showAlert('Hotel profile loaded successfully!', 'success');
//         } else {
//             // This should not happen with the new backend logic
//             throw new Error('Unexpected: No hotel data returned from /me endpoint');
//         }
//     } catch (error) {
//         console.error('❌ Error loading hotel profile:', error);
//         updateProfileStatus('error');
        
//         let errorMessage = 'Failed to load hotel profile';
//         if (error.message.includes('401')) {
//             errorMessage = 'Authentication required. Please login again.';
//         } else if (error.message.includes('403')) {
//             errorMessage = 'Access denied. You must be a hotel manager to access this page.';
//         } else {
//             errorMessage += ': ' + error.message;
//         }
        
//         showAlert(errorMessage, 'error');
        
//         // For authentication errors, redirect to login
//         if (error.message.includes('401') || error.message.includes('403')) {
//             setTimeout(() => {
//                 logout();
//             }, 3000);
//         }
//     } finally {
//         showLoading(false);
//     }
// }

// // Initialize empty profile form when no data exists
// function initializeEmptyProfile() {
//     console.log('Initializing empty hotel profile form...');
    
//     // Clear all form fields
//     document.getElementById('hotelName').value = '';
//     document.getElementById('contact').value = '';
//     document.getElementById('district').value = '';
//     document.getElementById('pincode').value = '';
//     document.getElementById('checkInTime').value = '14:00';
//     document.getElementById('checkOutTime').value = '11:00';
//     document.getElementById('description').value = '';
//     document.getElementById('amenities').value = '';
    
//     // Reset main image to placeholder
//     document.getElementById('hotelImage').src = PLACEHOLDER_IMAGE;
//     document.getElementById('hotelImage').dataset.changed = 'false';
    
//     // Clear gallery
//     galleryImages = [];
//     displayGalleryImages();
    
//     // Update status
//     updateProfileStatus('empty');
    
//     console.log('Empty profile form initialized');
// }

// // Show message when hotel manager has no associated hotel
// function showNoHotelMessage() {
//     console.log('Displaying no hotel message...');
    
//     // Clear the form area and show message
//     const formContainer = document.getElementById('hotelProfileForm');
//     if (formContainer) {
//         formContainer.innerHTML = `
//             <div class="text-center py-5">
//                 <div class="mb-4">
//                     <i class="fas fa-hotel fa-4x text-muted mb-3"></i>
//                     <h3 class="text-muted">No Hotel Profile Found</h3>
//                     <p class="text-muted mb-4">Your account is not currently associated with any hotel.<br>
//                     Please contact support to get your hotel profile set up.</p>
//                 </div>
//                 <div class="alert alert-info">
//                     <h5 class="alert-heading"><i class="fas fa-info-circle me-2"></i>For Hotel Managers</h5>
//                     <p class="mb-0">If you are a hotel manager, please contact the system administrator to:</p>
//                     <ul class="text-start mt-2 mb-0">
//                         <li>Create your hotel profile in the system</li>
//                         <li>Associate your manager account with your hotel</li>
//                         <li>Set up proper permissions for managing bookings</li>
//                     </ul>
//                 </div>
//                 <button class="btn btn-primary mt-3" onclick="location.reload()">
//                     <i class="fas fa-refresh me-2"></i>Refresh Page
//                 </button>
//                 <button class="btn btn-secondary mt-3 ms-2" onclick="logout()">
//                     <i class="fas fa-sign-out-alt me-2"></i>Logout
//                 </button>
//             </div>
//         `;
//     }
// }

// function populateProfileForm(data) {
//     console.log('Populating profile form with data:', data);
    
//     if (!data || !data.hotel_details) {
//         console.warn('No hotel details found in data');
//         initializeEmptyProfile();
//         return;
//     }
    
//     const { hotel_details, room_types, image, gallery } = data;
    
//     try {
//         // Populate hotel details with safe access
//         const hotelNameField = document.getElementById('hotelName');
//         const contactField = document.getElementById('contact');
//         const districtField = document.getElementById('district');
//         const pincodeField = document.getElementById('pincode');
//         const checkInField = document.getElementById('checkInTime');
//         const checkOutField = document.getElementById('checkOutTime');
//         const descriptionField = document.getElementById('description');
//         const amenitiesField = document.getElementById('amenities');
        
//         if (hotelNameField) hotelNameField.value = hotel_details.hotel_name || '';
//         if (contactField) contactField.value = hotel_details.contact || '';
//         if (districtField) districtField.value = hotel_details.location?.district || '';
//         if (pincodeField) pincodeField.value = hotel_details.location?.pincode || '';
//         if (checkInField) checkInField.value = hotel_details.check_in_time || '14:00';
//         if (checkOutField) checkOutField.value = hotel_details.check_out_time || '11:00';
//         if (descriptionField) descriptionField.value = hotel_details.description || '';
//         if (amenitiesField) {
//             amenitiesField.value = hotel_details.amenities && Array.isArray(hotel_details.amenities) 
//                 ? hotel_details.amenities.join(', ') 
//                 : '';
//         }
        
//         // Set hotel main image
//         const imageElement = document.getElementById('hotelImage');
//         if (imageElement) {
//             if (image && image.base64) {
//                 imageElement.src = `data:image/jpeg;base64,${image.base64}`;
//                 console.log('Main hotel image loaded');
//             } else {
//                 imageElement.src = PLACEHOLDER_IMAGE;
//             }
//             imageElement.dataset.changed = 'false'; // Reset changed flag
//         }
        
//         // Load gallery images
//         if (gallery && Array.isArray(gallery) && gallery.length > 0) {
//             galleryImages = gallery.map((img, index) => ({
//                 base64: img.base64,
//                 id: img.id || `gallery_${Date.now()}_${index}`
//             }));
//             console.log(`Loaded ${galleryImages.length} gallery images`);
//         } else {
//             galleryImages = [];
//             console.log('No gallery images found');
//         }
        
//         // Display gallery images
//         displayGalleryImages();
        
//         console.log('Hotel profile form successfully populated');
        
//         // Show data summary
//         console.log('Profile Summary:', {
//             hotelName: hotel_details.hotel_name,
//             district: hotel_details.location?.district,
//             hasMainImage: !!(image && image.base64),
//             galleryCount: galleryImages.length,
//             amenitiesCount: hotel_details.amenities?.length || 0
//         });
        
//     } catch (error) {
//         console.error('Error populating profile form:', error);
//         showAlert('Error displaying hotel profile data', 'error');
//     }
// }

// // Update profile status indicator
// function updateProfileStatus(status, message = '') {
//     const statusElement = document.getElementById('profileStatus');
//     if (!statusElement) return;
    
//     statusElement.className = 'badge'; // Reset classes
    
//     switch (status) {
//         case 'loading':
//             statusElement.classList.add('bg-secondary');
//             statusElement.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Loading...';
//             break;
//         case 'loaded':
//             statusElement.classList.add('bg-success');
//             statusElement.innerHTML = '<i class="fas fa-check me-1"></i>Profile Loaded';
//             break;
//         case 'empty':
//             statusElement.classList.add('bg-warning');
//             statusElement.innerHTML = '<i class="fas fa-plus me-1"></i>Setup Required';
//             break;
//         case 'new':
//             statusElement.classList.add('bg-info');
//             statusElement.innerHTML = '<i class="fas fa-star me-1"></i>New Profile Setup';
//             break;
//         case 'error':
//             statusElement.classList.add('bg-danger');
//             statusElement.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>Error';
//             break;
//         case 'saving':
//             statusElement.classList.add('bg-info');
//             statusElement.innerHTML = '<i class="fas fa-save fa-spin me-1"></i>Saving...';
//             break;
//         case 'saved':
//             statusElement.classList.add('bg-success');
//             statusElement.innerHTML = '<i class="fas fa-check me-1"></i>Saved Successfully';
//             setTimeout(() => updateProfileStatus('loaded'), 3000);
//             break;
//         case 'not_found':
//             statusElement.classList.add('bg-warning');
//             statusElement.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>No Hotel Profile';
//             break;
//         default:
//             statusElement.classList.add('bg-secondary');
//             statusElement.textContent = message || status;
//     }
// }

// // Handle profile form submission
// document.addEventListener('DOMContentLoaded', function() {
//     const profileForm = document.getElementById('hotelProfileForm');
//     if (profileForm) {
//         profileForm.addEventListener('submit', async function(e) {
//             e.preventDefault();
//             await updateHotelProfile();
//         });
//     }
    
//     // Handle main image upload
//     const imageUpload = document.getElementById('imageUpload');
//     if (imageUpload) {
//         imageUpload.addEventListener('change', handleImageUpload);
//     }
    
//     // Handle gallery images upload
//     const galleryUpload = document.getElementById('galleryUpload');
//     if (galleryUpload) {
//         galleryUpload.addEventListener('change', handleGalleryUpload);
//     }
// });

// async function updateHotelProfile() {
//     console.log('Updating hotel profile...');
    
//     try {
//         // Validate required fields
//         const hotelName = document.getElementById('hotelName').value.trim();
//         const district = document.getElementById('district').value.trim();
        
//         if (!hotelName || !district) {
//             showAlert('Please fill in required fields: Hotel Name and District', 'error');
//             return;
//         }
        
//         // Show saving status
//         updateProfileStatus('saving');
        
//         const formData = {
//             hotel_details: {
//                 hotel_name: hotelName,
//                 contact: document.getElementById('contact').value,
//                 location: {
//                     district: district,
//                     pincode: parseInt(document.getElementById('pincode').value) || 0
//                 },
//                 check_in_time: document.getElementById('checkInTime').value || '14:00',
//                 check_out_time: document.getElementById('checkOutTime').value || '11:00',
//                 description: document.getElementById('description').value,
//                 amenities: document.getElementById('amenities').value
//                     .split(',')
//                     .map(item => item.trim())
//                     .filter(item => item.length > 0)
//             }
//         };
        
//         // Add main image if changed
//         const imageElement = document.getElementById('hotelImage');
//         if (imageElement.dataset.changed === 'true') {
//             formData.image = {
//                 base64: imageElement.src.split(',')[1] // Remove data:image/jpeg;base64, prefix
//             };
//         }
        
//         // Add gallery images
//         if (galleryImages.length > 0) {
//             formData.gallery = galleryImages.map(img => ({
//                 base64: img.base64,
//                 id: img.id
//             }));
//         } else {
//             formData.gallery = []; // Clear gallery if no images
//         }
        
//         console.log('Sending update request with data:', {
//             hotelName: formData.hotel_details.hotel_name,
//             district: formData.hotel_details.location.district,
//             hasMainImage: !!formData.image,
//             galleryCount: formData.gallery.length
//         });
        
//         // Ensure we have currentUser before proceeding
//         if (!currentUser || !currentUser.id) {
//             throw new Error('User not properly authenticated. Please login again.');
//         }
        
//         let response;
        
//         // 🔧 SIMPLIFIED: Always use the existing update endpoint since backend handles creation
//         // The /me endpoint guarantees we have a hotel profile at this point
//         if (!hotelData || !hotelData._id) {
//             throw new Error('No hotel profile loaded. Please refresh the page and try again.');
//         }
        
//         console.log('🔄 Updating existing hotel profile:', hotelData._id);
        
//         // Use the proper update endpoint with user ID (not hotel ID)
//         response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${currentUser.id}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify(formData)
//             }
//         );
        
//         if (response && response.success) {
//             // Update hotelData with the response data
//             hotelData = response.data;
            
//             updateProfileStatus('saved');
//             showAlert('Hotel profile updated successfully!', 'success');
//             console.log('✅ Hotel profile updated successfully');
            
//             // Reset image changed flag
//             if (imageElement) {
//                 imageElement.dataset.changed = 'false';
//             }
            
//         } else {
//             throw new Error(response?.message || 'Update failed');
//         }
        
//     } catch (error) {
//         console.error('Error updating hotel profile:', error);
//         updateProfileStatus('error');
//         showAlert('Failed to update hotel profile: ' + error.message, 'error');
//     }
// }

// function handleImageUpload(event) {
//     const file = event.target.files[0];
//     if (file) {
//         if (file.size > 5 * 1024 * 1024) { // 5MB limit
//             showAlert('Image size should be less than 5MB', 'error');
//             return;
//         }
        
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const imageElement = document.getElementById('hotelImage');
//             imageElement.src = e.target.result;
//             imageElement.dataset.changed = 'true';
//         };
//         reader.readAsDataURL(file);
//     }
// }

// // Gallery Image Management Functions
// function handleGalleryUpload(event) {
//     const files = Array.from(event.target.files);
    
//     if (galleryImages.length + files.length > 5) {
//         showAlert('Maximum 5 gallery images allowed', 'error');
//         return;
//     }
    
//     files.forEach(file => {
//         if (file.size > 5 * 1024 * 1024) { // 5MB limit per image
//             showAlert(`Image ${file.name} is too large. Maximum size is 5MB`, 'error');
//             return;
//         }
        
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const imageData = {
//                 base64: e.target.result.split(',')[1], // Remove data:image/jpeg;base64, prefix
//                 id: Date.now() + Math.random(),
//                 name: file.name
//             };
            
//             galleryImages.push(imageData);
//             displayGalleryImages();
//         };
//         reader.readAsDataURL(file);
//     });
    
//     // Clear the input
//     event.target.value = '';
// }

// function displayGalleryImages() {
//     const container = document.getElementById('galleryPreview');
    
//     if (galleryImages.length === 0) {
//         container.innerHTML = `
//             <div class="col-12">
//                 <div class="gallery-placeholder">
//                     <i class="fas fa-images fa-2x mb-2"></i>
//                     <p class="mb-0">No gallery images uploaded</p>
//                 </div>
//             </div>
//         `;
//         return;
//     }
    
//     const html = galleryImages.map((image, index) => `
//         <div class="col-6 col-md-4">
//             <div class="gallery-item">
//                 <img src="data:image/jpeg;base64,${image.base64}" alt="Gallery Image ${index + 1}">
//                 <button type="button" class="remove-btn" onclick="removeGalleryImage(${index})" title="Remove Image">
//                     <i class="fas fa-times"></i>
//                 </button>
//             </div>
//         </div>
//     `).join('');
    
//     container.innerHTML = html;
// }

// function removeGalleryImage(index) {
//     if (index >= 0 && index < galleryImages.length) {
//         galleryImages.splice(index, 1);
//         displayGalleryImages();
//         showAlert('Gallery image removed', 'success');
//     }
// }

// function clearGallery() {
//     galleryImages = [];
//     displayGalleryImages();
//     showAlert('All gallery images removed', 'success');
// }

// // Booking Requests functions
// async function loadBookingRequests() {
//     console.log('Loading booking requests...');
    
//     try {
//         // Use the dedicated hotel booking requests endpoint
//         const response = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/bookings/requests`);
        
//         if (response && response.success) {
//             const requests = response.requests || [];
//             displayBookingRequests(requests);
//             updateRequestsCount(requests.length);
//         } else {
//             displayBookingRequests([]);
//             updateRequestsCount(0);
//         }
//     } catch (error) {
//         console.error('Error loading booking requests:', error);
//         showAlert('Failed to load booking requests', 'error');
//     }
// }

// function displayBookingRequests(requests) {
//     const tbody = document.getElementById('bookingRequestsTable');
    
//     if (!requests || requests.length === 0) {
//         tbody.innerHTML = '<tr><td colspan="9" class="text-center">No pending booking requests.</td></tr>';
//         return;
//     }
    
//     const html = requests.map(request => `
//         <tr>
//             <td><strong>${request.bookingId || request._id || 'N/A'}</strong></td>
//             <td>
//                 <strong>${request.customer?.name || 'Unknown'}</strong><br>
//                 <small class="text-muted">${request.customer?.email || ''}</small>
//             </td>
//             <td>${request.tourName || 'Tour Package'}</td>
//             <td>${formatDate(request.tripDetails?.checkIn)}</td>
//             <td>${formatDate(request.tripDetails?.checkOut)}</td>
//             <td>${request.tripDetails?.travelers || 1}</td>
//             <td><strong>${formatCurrency(request.payment?.totalAmount || 0)}</strong></td>
//             <td><span class="badge bg-${getStatusColor(request.status)}">${request.status || 'pending'}</span></td>
//             <td>
//                 <div class="btn-group" role="group">
//                     <button class="btn btn-sm btn-outline-info" onclick="viewBookingDetails('${request.bookingId || request._id}')">
//                         <i class="fas fa-eye"></i>
//                     </button>
//                     <button class="btn btn-sm btn-success" onclick="handleBookingAction('${request.bookingId || request._id}', 'accept')">
//                         <i class="fas fa-check"></i>
//                     </button>
//                     <button class="btn btn-sm btn-danger" onclick="handleBookingAction('${request.bookingId || request._id}', 'reject')">
//                         <i class="fas fa-times"></i>
//                     </button>
//                 </div>
//             </td>
//         </tr>
//     `).join('');
    
//     tbody.innerHTML = html;
// }

// // Booking History functions
// async function loadBookingHistory() {
//     console.log('Loading booking history...');
    
//     try {
//         const response = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/bookings/history`);
//         if (response && response.success) {
//             displayBookingHistory(response.history);
//         }
//     } catch (error) {
//         console.error('Error loading booking history:', error);
//         showAlert('Failed to load booking history', 'error');
//     }
// }

// function displayBookingHistory(history) {
//     const tbody = document.getElementById('bookingHistoryTable');
    
//     if (!history || history.length === 0) {
//         tbody.innerHTML = '<tr><td colspan="9" class="text-center">No booking history available.</td></tr>';
//         return;
//     }
    
//     const html = history.map(booking => `
//         <tr>
//             <td><strong>${booking.bookingId}</strong></td>
//             <td>${booking.customer}</td>
//             <td>${booking.tourName}</td>
//             <td>${formatDate(booking.checkInDate)}</td>
//             <td>${formatDate(booking.checkOutDate)}</td>
//             <td>${booking.travelers}</td>
//             <td><strong>${formatCurrency(booking.amount)}</strong></td>
//             <td><span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span></td>
//             <td>${formatDateTime(booking.confirmedAt)}</td>
//         </tr>
//     `).join('');
    
//     tbody.innerHTML = html;
// }

// // Booking action functions
// async function viewBookingDetails(bookingId) {
//     console.log(`Viewing booking details for: ${bookingId}`);
    
//     try {
//         // Get specific booking details from bookingformsdatas collection
//         const response = await makeAPIRequest(`${API_BASE_URL}/bookingformsdata/${bookingId}`);
//         console.log('Booking details response:', response);
        
//         if (response && (response.success || response._id)) {
//             // Handle different response formats
//             const bookingData = response.success ? response.data : response;
            
//             // Convert to expected format for modal
//             const formattedBooking = {
//                 bookingId: bookingData._id,
//                 tourName: 'Custom Tour Package',
//                 status: bookingData.status || 'pending',
//                 customer: {
//                     name: bookingData.user?.fullName || bookingData.tourist?.name || 'Unknown',
//                     email: bookingData.user?.email || bookingData.tourist?.email || '',
//                     phone: bookingData.user?.phone || bookingData.tourist?.phone || ''
//                 },
//                 tripDetails: {
//                     checkIn: bookingData.hotel?.fromDate || bookingData.hotel?.checkIn,
//                     checkOut: bookingData.hotel?.toDate || bookingData.hotel?.checkOut,
//                     travelers: bookingData.tourist?.totalTravellers || 1,
//                     places: bookingData.touristPlaces || []
//                 },
//                 payment: {
//                     totalAmount: bookingData.totalAmount || 0
//                 },
//                 agent: {
//                     name: bookingData.agent?.name || bookingData.selectedAgent?.name || '',
//                     experience: bookingData.agent?.experience || bookingData.selectedAgent?.experience || '',
//                     location: bookingData.agent?.location || bookingData.selectedAgent?.location || ''
//                 },
//                 specialRequests: bookingData.specialRequests || ''
//             };
            
//             showBookingDetailsModal(formattedBooking);
//         } else {
//             showAlert('Booking not found', 'error');
//         }
//     } catch (error) {
//         console.error('Error loading booking details:', error);
//         showAlert('Failed to load booking details: ' + error.message, 'error');
//     }
// }

// function showBookingDetailsModal(booking) {
//     const modalContent = document.getElementById('bookingDetailsContent');
    
//     modalContent.innerHTML = `
//         <div class="row">
//             <div class="col-md-6">
//                 <h6>Booking Information</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Booking ID:</strong></td><td>${booking.bookingId}</td></tr>
//                     <tr><td><strong>Tour Package:</strong></td><td>${booking.tourName}</td></tr>
//                     <tr><td><strong>Status:</strong></td><td><span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span></td></tr>
//                     <tr><td><strong>Total Amount:</strong></td><td><strong>${formatCurrency(booking.payment.totalAmount)}</strong></td></tr>
//                 </table>
//             </div>
//             <div class="col-md-6">
//                 <h6>Customer Information</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Name:</strong></td><td>${booking.customer.name}</td></tr>
//                     <tr><td><strong>Email:</strong></td><td>${booking.customer.email}</td></tr>
//                     <tr><td><strong>Phone:</strong></td><td>${booking.customer.phone}</td></tr>
//                 </table>
//             </div>
//         </div>
        
//         <div class="row">
//             <div class="col-md-6">
//                 <h6>Trip Details</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Check-in:</strong></td><td>${formatDate(booking.tripDetails.checkIn)}</td></tr>
//                     <tr><td><strong>Check-out:</strong></td><td>${formatDate(booking.tripDetails.checkOut)}</td></tr>
//                     <tr><td><strong>Travelers:</strong></td><td>${booking.tripDetails.travelers}</td></tr>
//                     <tr><td><strong>Places:</strong></td><td>${booking.tripDetails.places ? booking.tripDetails.places.join(', ') : 'N/A'}</td></tr>
//                 </table>
//             </div>
//             <div class="col-md-6">
//                 <h6>Agent Information</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Agent:</strong></td><td>${booking.agent.name || 'Not assigned'}</td></tr>
//                     <tr><td><strong>Experience:</strong></td><td>${booking.agent.experience || 'N/A'}</td></tr>
//                     <tr><td><strong>Location:</strong></td><td>${booking.agent.location || 'N/A'}</td></tr>
//                 </table>
//             </div>
//         </div>
        
//         ${booking.specialRequests ? `
//         <div class="row">
//             <div class="col-12">
//                 <h6>Special Requests</h6>
//                 <p class="border p-3 bg-light">${booking.specialRequests}</p>
//             </div>
//         </div>
//         ` : ''}
//     `;
    
//     // Store current booking for actions
//     currentBookingForAction = booking.bookingId;
    
//     // Show modal
//     const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
//     modal.show();
// }

// async function handleBookingAction(bookingId, action) {
//     console.log(`Handling booking ${bookingId} with action: ${action}`);
    
//     // Validate inputs
//     if (!bookingId) {
//         console.error('No booking ID provided');
//         showAlert('Invalid booking ID', 'error');
//         return;
//     }
    
//     if (!action || !['accept', 'reject'].includes(action)) {
//         console.error('Invalid action:', action);
//         showAlert('Invalid action', 'error');
//         return;
//     }
    
//     const confirmMessage = action === 'accept' 
//         ? 'Are you sure you want to accept this booking?'
//         : 'Are you sure you want to reject this booking?';
        
//     if (!confirm(confirmMessage)) {
//         return;
//     }
    
//     // Get optional notes
//     const notes = prompt(action === 'accept' ? 'Add any notes for the customer (optional):' : 'Reason for rejection (optional):', '');
    
//     try {
//         console.log('Starting booking action process...');
        
//         // Check authentication token
//         const token = getAuthToken();
//         console.log('Auth token available:', !!token);
        
//         if (!token) {
//             showAlert('Authentication required. Please login again.', 'error');
//             setTimeout(() => {
//                 logout();
//             }, 2000);
//             return;
//         }
        
//         // Use the dedicated hotel booking handle endpoint
//         const apiUrl = `${HOTEL_DASHBOARD_API}/bookings/${bookingId}/handle`;
//         const requestBody = {
//             action: action,    // 'accept' or 'reject'
//             notes: notes || ''
//         };
        
//         console.log('Using correct API endpoint:', apiUrl);
//         console.log('Request body:', requestBody);
        
//         const response = await makeAPIRequest(apiUrl, {
//             method: 'PUT',
//             body: JSON.stringify(requestBody)
//         });
        
//         console.log('Hotel confirm API response:', response);
        
//         if (response && response.success) {
//             showAlert(response.message, 'success');
            
//             // Refresh views
//             const activeSection = document.querySelector('.content-section.active');
//             if (activeSection) {
//                 const sectionId = activeSection.id.replace('-section', '');
//                 console.log('Refreshing section:', sectionId);
//                 if (sectionId === 'requests') {
//                     await loadBookingRequests();
//                 } else if (sectionId === 'dashboard') {
//                     await loadDashboardData();
//                 }
//             }
//             // Always refresh history so processed requests appear there
//             await loadBookingHistory();
            
//             // Close modal
//             const modal = bootstrap.Modal.getInstance(document.getElementById('bookingDetailsModal'));
//             if (modal) modal.hide();
//         } else {
//             console.error('API returned failure:', response);
//             showAlert(response?.message || `Failed to ${action} booking`, 'error');
//         }
//     } catch (error) {
//         console.error(`Error ${action}ing booking:`, error);
//         showAlert(`Failed to ${action} booking: ${error.message}`, 'error');
//     }
// }

// // Setup modal event listeners
// document.addEventListener('DOMContentLoaded', function() {
//     const acceptBtn = document.getElementById('acceptBookingBtn');
//     const rejectBtn = document.getElementById('rejectBookingBtn');
    
//     if (acceptBtn) {
//         acceptBtn.addEventListener('click', () => {
//             if (currentBookingForAction) {
//                 handleBookingAction(currentBookingForAction, 'accept');
//             }
//         });
//     }
    
//     if (rejectBtn) {
//         rejectBtn.addEventListener('click', () => {
//             if (currentBookingForAction) {
//                 handleBookingAction(currentBookingForAction, 'reject');
//             }
//         });
//     }
// });

// // Room Management functions
// async function loadRoomTypes() {
//     console.log('Loading room types...');
    
//     if (!hotelData) {
//         await loadHotelProfile();
//     }
    
//     if (hotelData && hotelData.room_types) {
//         displayRoomTypes(hotelData.room_types);
//     }
// }

// function displayRoomTypes(roomTypes) {
//     const container = document.getElementById('roomTypesContainer');
    
//     if (!roomTypes || roomTypes.length === 0) {
//         container.innerHTML = '<div class="col-12"><p class="text-muted">No room types configured.</p></div>';
//         return;
//     }
    
//     const html = roomTypes.map((room, index) => `
//         <div class="col-md-6 col-lg-4 mb-4">
//             <div class="card">
//                 <div class="card-body">
//                     <h5 class="card-title">${room.type}</h5>
//                     <h4 class="text-primary">${formatCurrency(room.price_per_night || room.price || room.pricePerNight)}<small class="text-muted">/night</small></h4>
//                     <p class="card-text">
//                         <strong>Features:</strong><br>
//                         ${room.features ? room.features.join(', ') : 'Standard amenities'}
//                     </p>
//                     <button class="btn btn-outline-primary btn-sm" onclick="editRoom(${index})">
//                         <i class="fas fa-edit me-1"></i>Edit
//                     </button>
//                     <button class="btn btn-outline-danger btn-sm ms-2" onclick="deleteRoom(${index})">
//                         <i class="fas fa-trash me-1"></i>Delete
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `).join('');
    
//     container.innerHTML = html;
// }

// function addRoom() {
//     // Clear the form
//     document.getElementById('roomTypeForm').reset();
    
//     // Show modal
//     const modal = new bootstrap.Modal(document.getElementById('addRoomModal'));
//     modal.show();
// }

// async function saveRoom() {
//     const roomType = document.getElementById('roomType').value;
//     const pricePerNight = document.getElementById('pricePerNight').value;
//     const roomFeatures = document.getElementById('roomFeatures').value;
    
//     if (!roomType || !pricePerNight) {
//         showAlert('Please fill in all required fields', 'error');
//         return;
//     }
    
//     const newRoom = {
//         type: roomType,
//         price_per_night: String(sanitizePrice(pricePerNight)),
//         features: roomFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0)
//     };
    
//     try {
//         // Add room to current room types
//         const updatedRoomTypes = [...(hotelData.room_types || []), newRoom];
        
//         const userId = (currentUser && (currentUser.id || currentUser._id)) || localStorage.getItem('userId');
//         const response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${userId}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify({ room_types: updatedRoomTypes })
//             }
//         );
        
//         if (response && response.success) {
//             hotelData = response.data;
//             displayRoomTypes(hotelData.room_types);
            
//             // Hide modal
//             const modal = bootstrap.Modal.getInstance(document.getElementById('addRoomModal'));
//             modal.hide();
            
//             showAlert('Room type added successfully!', 'success');
//         }
//     } catch (error) {
//         console.error('Error adding room type:', error);
//         showAlert('Failed to add room type', 'error');
//     }
// }

// function editRoom(index) {
//     if (!hotelData || !hotelData.room_types[index]) {
//         showAlert('Room not found', 'error');
//         return;
//     }
    
// const room = hotelData.room_types[index];
    
//     // Populate form with existing data
//     document.getElementById('roomType').value = room.type;
//     document.getElementById('pricePerNight').value = sanitizePrice(room.price_per_night || room.price || room.pricePerNight);
//     document.getElementById('roomFeatures').value = room.features ? room.features.join(', ') : '';
    
//     // Change save button to update
//     const saveBtn = document.querySelector('#addRoomModal .btn-primary');
//     saveBtn.textContent = 'Update Room';
//     saveBtn.onclick = () => updateRoom(index);
    
//     // Show modal
//     const modal = new bootstrap.Modal(document.getElementById('addRoomModal'));
//     modal.show();
// }

// async function updateRoom(index) {
//     const roomType = document.getElementById('roomType').value;
//     const pricePerNight = document.getElementById('pricePerNight').value;
//     const roomFeatures = document.getElementById('roomFeatures').value;
    
//     if (!roomType || !pricePerNight) {
//         showAlert('Please fill in all required fields', 'error');
//         return;
//     }
    
// const updatedRoom = {
//         type: roomType,
//         price_per_night: String(sanitizePrice(pricePerNight)),
//         features: roomFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0)
//     };
    
//     try {
//         // Update room types array
//         const updatedRoomTypes = [...hotelData.room_types];
//         updatedRoomTypes[index] = updatedRoom;
        
//         const userId = (currentUser && (currentUser.id || currentUser._id)) || localStorage.getItem('userId');
//         const response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${userId}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify({ room_types: updatedRoomTypes })
//             }
//         );
        
//         if (response && response.success) {
//             hotelData = response.data;
//             displayRoomTypes(hotelData.room_types);
            
//             // Hide modal and reset button
//             const modal = bootstrap.Modal.getInstance(document.getElementById('addRoomModal'));
//             modal.hide();
            
//             const saveBtn = document.querySelector('#addRoomModal .btn-primary');
//             saveBtn.textContent = 'Save Room';
//             saveBtn.onclick = saveRoom;
            
//             showAlert('Room type updated successfully!', 'success');
//         }
//     } catch (error) {
//         console.error('Error updating room type:', error);
//         showAlert('Failed to update room type', 'error');
//     }
// }

// async function deleteRoom(index) {
//     if (!confirm('Are you sure you want to delete this room type?')) {
//         return;
//     }
    
//     try {
//         // Remove room from array
//         const updatedRoomTypes = hotelData.room_types.filter((_, i) => i !== index);
        
// const userId = (currentUser && (currentUser.id || currentUser._id)) || localStorage.getItem('userId');
//         const response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${userId}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify({ room_types: updatedRoomTypes })
//             }
//         );
        
//         if (response && response.success) {
//             hotelData = response.data;
//             displayRoomTypes(hotelData.room_types);
//             showAlert('Room type deleted successfully!', 'success');
//         }
//     } catch (error) {
//         console.error('Error deleting room type:', error);
//         showAlert('Failed to delete room type', 'error');
//     }
// }

// // Initialize dashboard
// document.addEventListener('DOMContentLoaded', async function() {
//     console.log('Hotel Dashboard initializing...');
    
//     // Check authentication
//     if (!isAuthenticated()) {
//         showAlert('Please login to access the dashboard', 'error');
//         setTimeout(() => {
//             window.location.href = 'sign in.html';
//         }, 2000);
//         return;
//     }
    
//     // Get user data
//     const userData = localStorage.getItem('user');
//     if (userData) {
//         currentUser = JSON.parse(userData);
//         // Normalize: ensure both .id and ._id are present (login may save either)
//         if (!currentUser.id && currentUser._id) currentUser.id = currentUser._id;
//         if (!currentUser._id && currentUser.id) currentUser._id = currentUser.id;
        
//         // Check if user is a hotel manager
//         if (currentUser.role !== 'hotel') {
//             showAlert('Access denied. This dashboard is for hotel managers only.', 'error');
//             setTimeout(() => {
//                 logout();
//             }, 3000);
//             return;
//         }
        
//         // Update welcome message
//         const welcomeElement = document.getElementById('userWelcome');
//         if (welcomeElement) {
//             welcomeElement.textContent = currentUser.fullName || 'Hotel Manager';
//         }
//     }
    
//     // Load initial dashboard data
//     await loadDashboardData();
    
//     console.log('Hotel Dashboard initialized successfully');
// });
// // Debug functions for troubleshooting
// window.debugBookingAction = async function(bookingId, action) {
//     console.log('=== BOOKING ACTION DEBUG ===');
//     console.log('Booking ID:', bookingId);
//     console.log('Action:', action);
//     console.log('Auth token:', getAuthToken() ? 'present' : 'missing');
//     console.log('Current user:', currentUser);
    
//     const testEndpoints = [
//         // Test GET first to see if booking exists
//         {
//             name: 'GET booking details',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}`,
//             method: 'GET'
//         },
//         // Test various update endpoints
//         {
//             name: 'PATCH bookingformsdata',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}`,
//             method: 'PATCH',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected',
//                 hotelNotes: 'Debug test'
//             }
//         },
//         {
//             name: 'PUT bookingformsdata',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}`,
//             method: 'PUT',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected'
//             }
//         },
//         {
//             name: 'Hotel confirm endpoint (CORRECT)',
//             url: `${API_BASE_URL}/bookingformsdata/hotel/confirm/${bookingId}`,
//             method: 'PUT',
//             body: { 
//                 confirmed: action === 'accept' ? true : false,
//                 notes: 'Debug test'
//             }
//         },
//         {
//             name: 'Update endpoint',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}/update`,
//             method: 'PUT',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected'
//             }
//         },
//         {
//             name: 'Bookings collection',
//             url: `${API_BASE_URL}/bookings/${bookingId}`,
//             method: 'PATCH',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected'
//             }
//         }
//     ];
    
//     for (const endpoint of testEndpoints) {
//         try {
//             console.log(`\n--- Testing ${endpoint.name} ---`);
//             console.log('URL:', endpoint.url);
//             console.log('Method:', endpoint.method);
            
//             const options = {
//                 method: endpoint.method,
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${getAuthToken()}`
//                 }
//             };
            
//             if (endpoint.body) {
//                 options.body = JSON.stringify(endpoint.body);
//                 console.log('Body:', endpoint.body);
//             }
            
//             const response = await fetch(endpoint.url, options);
//             console.log('Status:', response.status, response.statusText);
            
//             let data;
//             try {
//                 data = await response.json();
//                 console.log('Response:', data);
//             } catch {
//                 const text = await response.text();
//                 console.log('Raw response:', text);
//             }
            
//             if (response.ok) {
//                 console.log('✅ SUCCESS - This endpoint works!');
//                 break; // Stop testing if we find a working endpoint
//             } else {
//                 console.log('❌ FAILED');
//             }
            
//         } catch (error) {
//             console.log('❌ ERROR:', error.message);
//         }
//     }
    
//     console.log('=== END DEBUG ===');
// };

// window.testAuth = function() {
//     console.log('=== AUTH TEST ===');
//     console.log('authToken:', localStorage.getItem('authToken'));
//     console.log('token:', localStorage.getItem('token'));
//     console.log('user:', localStorage.getItem('user'));
//     console.log('Current user object:', currentUser);
//     console.log('getAuthToken():', getAuthToken());
//     console.log('isAuthenticated():', isAuthenticated());
//     console.log('=== END AUTH TEST ===');
// };

// // Expose necessary functions to global scope
// window.showSection = showSection;
// window.refreshDashboard = refreshDashboard;
// window.loadBookingRequests = loadBookingRequests;
// window.loadBookingHistory = loadBookingHistory;
// window.viewBookingDetails = viewBookingDetails;
// window.handleBookingAction = handleBookingAction;
// window.addRoom = addRoom;
// window.saveRoom = saveRoom;
// window.editRoom = editRoom;
// window.updateRoom = updateRoom;
// window.deleteRoom = deleteRoom;
// window.removeGalleryImage = removeGalleryImage;
// window.clearGallery = clearGallery;
// window.loadHotelProfile = loadHotelProfile;
// window.logout = logout;
// window.toggleMobileSidebar = toggleMobileSidebar;





// Hotel Dashboard JavaScript

// Configuration
// const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000/api';
// const HOTEL_DASHBOARD_API = `${API_BASE_URL}/hoteldashboard`;

// const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23e9ecef'/%3E%3Ctext x='150' y='90' font-family='Arial' font-size='14' fill='%236c757d' text-anchor='middle'%3E%3Ctspan x='150' dy='0'%3E%F0%9F%8F%A8%3C/tspan%3E%3Ctspan x='150' dy='25'%3EHotel Image%3C/tspan%3E%3C/text%3E%3C/svg%3E";

// // Global variables
// let currentUser = null;
// let hotelData = null;
// let currentBookingForAction = null;
// let galleryImages = []; // Store gallery images

// // Authentication functions
// function getAuthToken() {
//     const authToken = localStorage.getItem('authToken');
//     const regularToken = localStorage.getItem('token');
//     const token = authToken || regularToken;
    
//     console.log('Token check:', {
//         authToken: authToken ? 'present' : 'missing',
//         regularToken: regularToken ? 'present' : 'missing',
//         using: token ? 'found token' : 'no token'
//     });
    
//     return token;
// }

// function isAuthenticated() {
//     const token = getAuthToken();
//     return token !== null;
// }

// function logout() {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     localStorage.removeItem('userRole');
//     localStorage.removeItem('userEmail');
//     localStorage.removeItem('userId');
//     window.location.href = 'sign in.html';
// }

// // API request function with error handling
// async function makeAPIRequest(url, options = {}) {
//     const token = getAuthToken();
    
//     if (!token) {
//         console.error('No authentication token available');
//         showAlert('Authentication required. Please login again.', 'error');
//         logout();
//         return null;
//     }
    
//     const defaultOptions = {
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//             ...options.headers
//         }
//     };

//     const mergedOptions = { ...defaultOptions, ...options };

//     try {
//         showLoading(true);
//         console.log(`Making API request to: ${url}`);
//         console.log('Request options:', {
//             method: mergedOptions.method || 'GET',
//             headers: mergedOptions.headers,
//             body: mergedOptions.body ? 'present' : 'none'
//         });
        
//         const response = await fetch(url, mergedOptions);
//         console.log('Raw response status:', response.status, response.statusText);
        
//         let data;
//         const contentType = response.headers.get('content-type');
        
//         if (contentType && contentType.includes('application/json')) {
//             data = await response.json();
//         } else {
//             const textData = await response.text();
//             console.log('Non-JSON response:', textData);
//             try {
//                 data = JSON.parse(textData);
//             } catch {
//                 data = { message: textData, status: response.status };
//             }
//         }

//         console.log('Parsed response data:', data);

//         if (!response.ok) {
//             if (response.status === 401) {
//                 showAlert('Session expired. Please login again.', 'error');
//                 logout();
//                 return null;
//             }
            
//             const errorMessage = data?.message || `HTTP ${response.status}: ${response.statusText}`;
//             console.error('API Error Response:', errorMessage);
//             throw new Error(errorMessage);
//         }

//         return data;
//     } catch (error) {
//         console.error('API Request Error:', error);
        
//         // Don't show alerts for expected errors (they're handled by caller)
//         if (!error.message.includes('Session expired')) {
//             console.error('Detailed error info:', {
//                 url,
//                 method: options.method || 'GET',
//                 error: error.message
//             });
//         }
        
//         throw error; // Re-throw so caller can handle
//     } finally {
//         showLoading(false);
//     }
// }

// // Utility functions
// function showLoading(show) {
//     const loader = document.getElementById('loading');
//     if (loader) {
//         loader.style.display = show ? 'block' : 'none';
//     }
// }

// function showAlert(message, type = 'info') {
//     // Create alert element
//     const alertDiv = document.createElement('div');
//     alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
//     alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
//     alertDiv.innerHTML = `
//         <strong>${type === 'error' ? 'Error!' : type === 'success' ? 'Success!' : 'Info!'}</strong> ${message}
//         <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
//     `;
    
//     document.body.appendChild(alertDiv);
    
//     // Auto remove after 5 seconds
//     setTimeout(() => {
//         if (alertDiv.parentNode) {
//             alertDiv.parentNode.removeChild(alertDiv);
//         }
//     }, 5000);
// }

// function formatDate(dateString) {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//     });
// }

// function formatDateTime(dateString) {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-IN', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//     });
// }

// function sanitizePrice(value) {
//     // Accept numbers or strings like "3000", "₹3000", "3,000", etc.
//     if (value === null || value === undefined || value === '') return 0;
//     if (typeof value === 'number') return isNaN(value) ? 0 : value;
//     const cleaned = String(value).replace(/[^0-9.]/g, '');
//     const num = Number(cleaned);
//     return isNaN(num) ? 0 : num;
// }

// function formatCurrency(amount) {
//     const num = sanitizePrice(amount);
//     return `₹${num.toLocaleString('en-IN')}`;
// }

// // Mobile sidebar toggle
// function toggleMobileSidebar() {
//     const sidebar = document.querySelector('.sidebar');
//     const overlay = document.getElementById('sidebarOverlay');
//     sidebar.classList.toggle('show');
//     overlay.classList.toggle('show');
// }

// // Section navigation
// function showSection(sectionName) {
//     console.log(`Showing section: ${sectionName}`);
    
//     // Close mobile sidebar if open
//     const sidebar = document.querySelector('.sidebar');
//     const overlay = document.getElementById('sidebarOverlay');
//     if (sidebar && sidebar.classList.contains('show')) {
//         sidebar.classList.remove('show');
//         overlay && overlay.classList.remove('show');
//     }
    
//     // Hide all sections
//     document.querySelectorAll('.content-section').forEach(section => {
//         section.classList.remove('active');
//     });
    
//     // Remove active class from all nav links
//     document.querySelectorAll('.sidebar .nav-link').forEach(link => {
//         link.classList.remove('active');
//     });
    
//     // Show selected section
//     const targetSection = document.getElementById(`${sectionName}-section`);
//     if (targetSection) {
//         targetSection.classList.add('active');
//     }
    
//     // Add active class to clicked nav link
//     document.querySelectorAll('.sidebar .nav-link').forEach(link => {
//         if (link.onclick && link.onclick.toString().includes(sectionName)) {
//             link.classList.add('active');
//         }
//     });
    
//     // Load data for specific sections
//     switch (sectionName) {
//         case 'dashboard':
//             loadDashboardData();
//             break;
//         case 'profile':
//             console.log('Loading profile section...');
//             loadHotelProfile();
//             break;
//         case 'requests':
//             loadBookingRequests();
//             break;
//         case 'history':
//             loadBookingHistory();
//             break;
//         case 'rooms':
//             loadRoomTypes();
//             break;
//     }
// }

// // Dashboard functions
// async function loadDashboardData() {
//     console.log('Loading dashboard data...');
    
//     try {
//         // Use the dedicated stats endpoint — it already filters by hotel correctly
//         const statsResponse = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/stats`);
        
//         if (statsResponse && statsResponse.success) {
//             updateDashboardStats(statsResponse.stats);
//             updateRequestsCount(statsResponse.stats.pendingRequests);
//         }
        
//         // Load recent pending booking requests for the dashboard preview
//         const requestsResponse = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/bookings/requests`);
        
//         if (requestsResponse && requestsResponse.success) {
//             const recentBookings = (requestsResponse.requests || []).slice(0, 5).map(booking => ({
//                 bookingId: booking.bookingId || booking._id,
//                 customer: {
//                     name: booking.customer?.name || 'Unknown'
//                 },
//                 tripDetails: {
//                     travelers: booking.tripDetails?.travelers || 1
//                 },
//                 payment: {
//                     totalAmount: booking.payment?.totalAmount || 0
//                 },
//                 status: booking.status || 'pending',
//                 requestedAt: booking.requestedAt || new Date()
//             }));
//             displayRecentBookings(recentBookings);
//         } else {
//             displayRecentBookings([]);
//         }
        
//     } catch (error) {
//         console.error('Error loading dashboard data:', error);
//         showAlert('Failed to load dashboard data', 'error');
//     }
// }

// function updateDashboardStats(stats) {
//     document.getElementById('totalBookings').textContent = stats.totalBookings || 0;
//     document.getElementById('pendingRequests').textContent = stats.pendingRequests || 0;
//     document.getElementById('confirmedBookings').textContent = stats.confirmedBookings || 0;
//     document.getElementById('totalRevenue').textContent = stats.totalRevenue
//         ? Number(stats.totalRevenue).toLocaleString('en-IN') : '0';
// }

// function updateRequestsCount(count) {
//     const badge = document.getElementById('requestsCount');
//     if (badge) {
//         badge.textContent = count || 0;
//     }
// }

// function displayRecentBookings(bookings) {
//     const container = document.getElementById('recentBookings');
    
//     if (!bookings || bookings.length === 0) {
//         container.innerHTML = '<p class="text-muted">No recent booking requests.</p>';
//         return;
//     }
    
//     const html = bookings.map(booking => `
//         <div class="border-bottom py-3">
//             <div class="row align-items-center">
//                 <div class="col-md-3">
//                     <strong>${booking.bookingId}</strong>
//                     <br><small class="text-muted">${booking.customer.name}</small>
//                 </div>
//                 <div class="col-md-3">
//                     <span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span>
//                     <br><small class="text-muted">${formatDate(booking.requestedAt)}</small>
//                 </div>
//                 <div class="col-md-3">
//                     <strong>${formatCurrency(booking.payment.totalAmount)}</strong>
//                     <br><small class="text-muted">${booking.tripDetails.travelers} travelers</small>
//                 </div>
//                 <div class="col-md-3 text-end">
//                     <button class="btn btn-sm btn-outline-primary" onclick="viewBookingDetails('${booking.bookingId}')">
//                         <i class="fas fa-eye me-1"></i>View
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `).join('');
    
//     container.innerHTML = html;
// }

// function getStatusColor(status) {
//     const statusColors = {
//         'pending': 'warning',
//         'agent_confirmed': 'info',
//         'hotel_confirmed': 'primary',
//         'hotel_accepted': 'primary',
//         'hotel_rejected': 'danger',
//         'confirmed': 'success',
//         'cancelled': 'danger',
//         'completed': 'success',
//         'payment_complete': 'success'
//     };
//     return statusColors[status] || 'secondary';
// }

// async function refreshDashboard() {
//     await loadDashboardData();
//     showAlert('Dashboard refreshed successfully!', 'success');
// }

// // Hotel Profile functions
// function createDummyHotelData() {
//     // Create dummy hotel data for first-time setup
//     hotelData = {
//         _id: null, // Flag to indicate this is a new hotel profile
//         manager_email: currentUser.email,
//         hotel_details: {
//             hotel_name: 'Enter Hotel Name',
//             description: 'Enter hotel description here...',
//             contact: 'Enter contact number',
//             location: {
//                 district: 'Enter district',
//                 pincode: 380001
//             },
//             check_in_time: '14:00',
//             check_out_time: '12:00',
//             amenities: []
//         },
//         rooms: [],
//         gallery: [],
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//     };
    
//     console.log('Created dummy hotel data for first-time setup:', hotelData);
    
//     // Populate the form with dummy data
//     populateProfileForm(hotelData);
//     updateProfileStatus('new');
//     showAlert('Welcome! Please fill in your hotel details to create your profile.', 'info');
// }

// async function loadHotelProfile() {
//     console.log('Loading hotel profile...');
    
//     try {
//         // Show loading states
//         updateProfileStatus('loading');
//         showLoading(true);
        
//         // Get current user data first to ensure we have user info
//         const userData = localStorage.getItem('user');
//         if (userData) {
//             currentUser = JSON.parse(userData);
//             // Normalize: ensure both .id and ._id are present
//             if (!currentUser.id && currentUser._id) currentUser.id = currentUser._id;
//             if (!currentUser._id && currentUser.id) currentUser._id = currentUser.id;
//             console.log('Current user loaded:', currentUser);
//         }
        
//         if (!currentUser || !currentUser.id) {
//             throw new Error('User not properly authenticated. Please login again.');
//         }
        
//         // 🔧 SIMPLIFIED: Use the /me endpoint which handles all the complex logic
//         console.log('🔍 Fetching hotel profile using /me endpoint for user:', currentUser.email);
        
//         let response = null;
        
//         try {
//             // Use the /me endpoint that handles all the relationship logic
//             response = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/me`);
            
//             if (response && response.success && response.data) {
//                 console.log('✅ Successfully loaded hotel data via /me endpoint');
//             }
//         } catch (error) {
//             console.log('❌ Failed to load hotel via /me endpoint:', error.message);
//             // The /me endpoint will automatically create a hotel if none exists
//             // So if this fails, it's a real error
//             throw error;
//         }
        
//         console.log('Final hotel profile response:', response);
        
//         if (response && response.success && response.data) {
//             hotelData = response.data;
//             console.log('✅ Hotel data loaded successfully:', {
//                 hotelId: hotelData._id,
//                 hotelName: hotelData.hotel_details?.hotel_name,
//                 managerId: hotelData.manager_id,
//                 managerEmail: hotelData.manager_email
//             });
            
//             // The backend guarantees we have hotel data at this point
//             populateProfileForm(hotelData);
//             updateProfileStatus('loaded');
//             showAlert('Hotel profile loaded successfully!', 'success');
//         } else {
//             // This should not happen with the new backend logic
//             throw new Error('Unexpected: No hotel data returned from /me endpoint');
//         }
//     } catch (error) {
//         console.error('❌ Error loading hotel profile:', error);
//         updateProfileStatus('error');
        
//         let errorMessage = 'Failed to load hotel profile';
//         if (error.message.includes('401')) {
//             errorMessage = 'Authentication required. Please login again.';
//         } else if (error.message.includes('403')) {
//             errorMessage = 'Access denied. You must be a hotel manager to access this page.';
//         } else {
//             errorMessage += ': ' + error.message;
//         }
        
//         showAlert(errorMessage, 'error');
        
//         // For authentication errors, redirect to login
//         if (error.message.includes('401') || error.message.includes('403')) {
//             setTimeout(() => {
//                 logout();
//             }, 3000);
//         }
//     } finally {
//         showLoading(false);
//     }
// }

// // Initialize empty profile form when no data exists
// function initializeEmptyProfile() {
//     console.log('Initializing empty hotel profile form...');
    
//     // Clear all form fields
//     document.getElementById('hotelName').value = '';
//     document.getElementById('contact').value = '';
//     document.getElementById('district').value = '';
//     document.getElementById('pincode').value = '';
//     document.getElementById('checkInTime').value = '14:00';
//     document.getElementById('checkOutTime').value = '11:00';
//     document.getElementById('description').value = '';
//     document.getElementById('amenities').value = '';
    
//     // Reset main image to placeholder
//     document.getElementById('hotelImage').src = PLACEHOLDER_IMAGE;
//     document.getElementById('hotelImage').dataset.changed = 'false';
    
//     // Clear gallery
//     galleryImages = [];
//     displayGalleryImages();
    
//     // Update status
//     updateProfileStatus('empty');
    
//     console.log('Empty profile form initialized');
// }

// // Show message when hotel manager has no associated hotel
// function showNoHotelMessage() {
//     console.log('Displaying no hotel message...');
    
//     // Clear the form area and show message
//     const formContainer = document.getElementById('hotelProfileForm');
//     if (formContainer) {
//         formContainer.innerHTML = `
//             <div class="text-center py-5">
//                 <div class="mb-4">
//                     <i class="fas fa-hotel fa-4x text-muted mb-3"></i>
//                     <h3 class="text-muted">No Hotel Profile Found</h3>
//                     <p class="text-muted mb-4">Your account is not currently associated with any hotel.<br>
//                     Please contact support to get your hotel profile set up.</p>
//                 </div>
//                 <div class="alert alert-info">
//                     <h5 class="alert-heading"><i class="fas fa-info-circle me-2"></i>For Hotel Managers</h5>
//                     <p class="mb-0">If you are a hotel manager, please contact the system administrator to:</p>
//                     <ul class="text-start mt-2 mb-0">
//                         <li>Create your hotel profile in the system</li>
//                         <li>Associate your manager account with your hotel</li>
//                         <li>Set up proper permissions for managing bookings</li>
//                     </ul>
//                 </div>
//                 <button class="btn btn-primary mt-3" onclick="location.reload()">
//                     <i class="fas fa-refresh me-2"></i>Refresh Page
//                 </button>
//                 <button class="btn btn-secondary mt-3 ms-2" onclick="logout()">
//                     <i class="fas fa-sign-out-alt me-2"></i>Logout
//                 </button>
//             </div>
//         `;
//     }
// }

// function populateProfileForm(data) {
//     console.log('Populating profile form with data:', data);
    
//     if (!data || !data.hotel_details) {
//         console.warn('No hotel details found in data');
//         initializeEmptyProfile();
//         return;
//     }
    
//     const { hotel_details, room_types, image, gallery } = data;
    
//     try {
//         // Populate hotel details with safe access
//         const hotelNameField = document.getElementById('hotelName');
//         const contactField = document.getElementById('contact');
//         const districtField = document.getElementById('district');
//         const pincodeField = document.getElementById('pincode');
//         const checkInField = document.getElementById('checkInTime');
//         const checkOutField = document.getElementById('checkOutTime');
//         const descriptionField = document.getElementById('description');
//         const amenitiesField = document.getElementById('amenities');
        
//         if (hotelNameField) hotelNameField.value = hotel_details.hotel_name || '';
//         if (contactField) contactField.value = hotel_details.contact || '';
//         if (districtField) districtField.value = hotel_details.location?.district || '';
//         if (pincodeField) pincodeField.value = hotel_details.location?.pincode || '';
//         if (checkInField) checkInField.value = hotel_details.check_in_time || '14:00';
//         if (checkOutField) checkOutField.value = hotel_details.check_out_time || '11:00';
//         if (descriptionField) descriptionField.value = hotel_details.description || '';
//         if (amenitiesField) {
//             amenitiesField.value = hotel_details.amenities && Array.isArray(hotel_details.amenities) 
//                 ? hotel_details.amenities.join(', ') 
//                 : '';
//         }
        
//         // Set hotel main image
//         const imageElement = document.getElementById('hotelImage');
//         if (imageElement) {
//             if (image && image.base64) {
//                 imageElement.src = `data:image/jpeg;base64,${image.base64}`;
//                 console.log('Main hotel image loaded');
//             } else {
//                 imageElement.src = PLACEHOLDER_IMAGE;
//             }
//             imageElement.dataset.changed = 'false'; // Reset changed flag
//         }
        
//         // Load gallery images
//         if (gallery && Array.isArray(gallery) && gallery.length > 0) {
//             galleryImages = gallery.map((img, index) => ({
//                 base64: img.base64,
//                 id: img.id || `gallery_${Date.now()}_${index}`
//             }));
//             console.log(`Loaded ${galleryImages.length} gallery images`);
//         } else {
//             galleryImages = [];
//             console.log('No gallery images found');
//         }
        
//         // Display gallery images
//         displayGalleryImages();
        
//         console.log('Hotel profile form successfully populated');
        
//         // Show data summary
//         console.log('Profile Summary:', {
//             hotelName: hotel_details.hotel_name,
//             district: hotel_details.location?.district,
//             hasMainImage: !!(image && image.base64),
//             galleryCount: galleryImages.length,
//             amenitiesCount: hotel_details.amenities?.length || 0
//         });
        
//     } catch (error) {
//         console.error('Error populating profile form:', error);
//         showAlert('Error displaying hotel profile data', 'error');
//     }
// }

// // Update profile status indicator
// function updateProfileStatus(status, message = '') {
//     const statusElement = document.getElementById('profileStatus');
//     if (!statusElement) return;
    
//     statusElement.className = 'badge'; // Reset classes
    
//     switch (status) {
//         case 'loading':
//             statusElement.classList.add('bg-secondary');
//             statusElement.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Loading...';
//             break;
//         case 'loaded':
//             statusElement.classList.add('bg-success');
//             statusElement.innerHTML = '<i class="fas fa-check me-1"></i>Profile Loaded';
//             break;
//         case 'empty':
//             statusElement.classList.add('bg-warning');
//             statusElement.innerHTML = '<i class="fas fa-plus me-1"></i>Setup Required';
//             break;
//         case 'new':
//             statusElement.classList.add('bg-info');
//             statusElement.innerHTML = '<i class="fas fa-star me-1"></i>New Profile Setup';
//             break;
//         case 'error':
//             statusElement.classList.add('bg-danger');
//             statusElement.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>Error';
//             break;
//         case 'saving':
//             statusElement.classList.add('bg-info');
//             statusElement.innerHTML = '<i class="fas fa-save fa-spin me-1"></i>Saving...';
//             break;
//         case 'saved':
//             statusElement.classList.add('bg-success');
//             statusElement.innerHTML = '<i class="fas fa-check me-1"></i>Saved Successfully';
//             setTimeout(() => updateProfileStatus('loaded'), 3000);
//             break;
//         case 'not_found':
//             statusElement.classList.add('bg-warning');
//             statusElement.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>No Hotel Profile';
//             break;
//         default:
//             statusElement.classList.add('bg-secondary');
//             statusElement.textContent = message || status;
//     }
// }

// // Handle profile form submission
// document.addEventListener('DOMContentLoaded', function() {
//     const profileForm = document.getElementById('hotelProfileForm');
//     if (profileForm) {
//         profileForm.addEventListener('submit', async function(e) {
//             e.preventDefault();
//             await updateHotelProfile();
//         });
//     }
    
//     // Handle main image upload
//     const imageUpload = document.getElementById('imageUpload');
//     if (imageUpload) {
//         imageUpload.addEventListener('change', handleImageUpload);
//     }
    
//     // Handle gallery images upload
//     const galleryUpload = document.getElementById('galleryUpload');
//     if (galleryUpload) {
//         galleryUpload.addEventListener('change', handleGalleryUpload);
//     }
// });

// async function updateHotelProfile() {
//     console.log('Updating hotel profile...');
    
//     try {
//         // Validate required fields
//         const hotelName = document.getElementById('hotelName').value.trim();
//         const district = document.getElementById('district').value.trim();
        
//         if (!hotelName || !district) {
//             showAlert('Please fill in required fields: Hotel Name and District', 'error');
//             return;
//         }
        
//         // Show saving status
//         updateProfileStatus('saving');
        
//         const formData = {
//             hotel_details: {
//                 hotel_name: hotelName,
//                 contact: document.getElementById('contact').value,
//                 location: {
//                     district: district,
//                     pincode: parseInt(document.getElementById('pincode').value) || 0
//                 },
//                 check_in_time: document.getElementById('checkInTime').value || '14:00',
//                 check_out_time: document.getElementById('checkOutTime').value || '11:00',
//                 description: document.getElementById('description').value,
//                 amenities: document.getElementById('amenities').value
//                     .split(',')
//                     .map(item => item.trim())
//                     .filter(item => item.length > 0)
//             }
//         };
        
//         // Add main image if changed
//         const imageElement = document.getElementById('hotelImage');
//         if (imageElement.dataset.changed === 'true') {
//             formData.image = {
//                 base64: imageElement.src.split(',')[1] // Remove data:image/jpeg;base64, prefix
//             };
//         }
        
//         // Add gallery images
//         if (galleryImages.length > 0) {
//             formData.gallery = galleryImages.map(img => ({
//                 base64: img.base64,
//                 id: img.id
//             }));
//         } else {
//             formData.gallery = []; // Clear gallery if no images
//         }
        
//         console.log('Sending update request with data:', {
//             hotelName: formData.hotel_details.hotel_name,
//             district: formData.hotel_details.location.district,
//             hasMainImage: !!formData.image,
//             galleryCount: formData.gallery.length
//         });
        
//         // Ensure we have currentUser before proceeding
//         if (!currentUser || !currentUser.id) {
//             throw new Error('User not properly authenticated. Please login again.');
//         }
        
//         let response;
        
//         // 🔧 SIMPLIFIED: Always use the existing update endpoint since backend handles creation
//         // The /me endpoint guarantees we have a hotel profile at this point
//         if (!hotelData || !hotelData._id) {
//             throw new Error('No hotel profile loaded. Please refresh the page and try again.');
//         }
        
//         console.log('🔄 Updating existing hotel profile:', hotelData._id);
        
//         // Use the proper update endpoint with user ID (not hotel ID)
//         response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${currentUser.id}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify(formData)
//             }
//         );
        
//         if (response && response.success) {
//             // Update hotelData with the response data
//             hotelData = response.data;
            
//             updateProfileStatus('saved');
//             showAlert('Hotel profile updated successfully!', 'success');
//             console.log('✅ Hotel profile updated successfully');
            
//             // Reset image changed flag
//             if (imageElement) {
//                 imageElement.dataset.changed = 'false';
//             }
            
//         } else {
//             throw new Error(response?.message || 'Update failed');
//         }
        
//     } catch (error) {
//         console.error('Error updating hotel profile:', error);
//         updateProfileStatus('error');
//         showAlert('Failed to update hotel profile: ' + error.message, 'error');
//     }
// }

// function handleImageUpload(event) {
//     const file = event.target.files[0];
//     if (file) {
//         if (file.size > 5 * 1024 * 1024) { // 5MB limit
//             showAlert('Image size should be less than 5MB', 'error');
//             return;
//         }
        
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const imageElement = document.getElementById('hotelImage');
//             imageElement.src = e.target.result;
//             imageElement.dataset.changed = 'true';
//         };
//         reader.readAsDataURL(file);
//     }
// }

// // Gallery Image Management Functions
// function handleGalleryUpload(event) {
//     const files = Array.from(event.target.files);
    
//     if (galleryImages.length + files.length > 5) {
//         showAlert('Maximum 5 gallery images allowed', 'error');
//         return;
//     }
    
//     files.forEach(file => {
//         if (file.size > 5 * 1024 * 1024) { // 5MB limit per image
//             showAlert(`Image ${file.name} is too large. Maximum size is 5MB`, 'error');
//             return;
//         }
        
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const imageData = {
//                 base64: e.target.result.split(',')[1], // Remove data:image/jpeg;base64, prefix
//                 id: Date.now() + Math.random(),
//                 name: file.name
//             };
            
//             galleryImages.push(imageData);
//             displayGalleryImages();
//         };
//         reader.readAsDataURL(file);
//     });
    
//     // Clear the input
//     event.target.value = '';
// }

// function displayGalleryImages() {
//     const container = document.getElementById('galleryPreview');
    
//     if (galleryImages.length === 0) {
//         container.innerHTML = `
//             <div class="col-12">
//                 <div class="gallery-placeholder">
//                     <i class="fas fa-images fa-2x mb-2"></i>
//                     <p class="mb-0">No gallery images uploaded</p>
//                 </div>
//             </div>
//         `;
//         return;
//     }
    
//     const html = galleryImages.map((image, index) => `
//         <div class="col-6 col-md-4">
//             <div class="gallery-item">
//                 <img src="data:image/jpeg;base64,${image.base64}" alt="Gallery Image ${index + 1}">
//                 <button type="button" class="remove-btn" onclick="removeGalleryImage(${index})" title="Remove Image">
//                     <i class="fas fa-times"></i>
//                 </button>
//             </div>
//         </div>
//     `).join('');
    
//     container.innerHTML = html;
// }

// function removeGalleryImage(index) {
//     if (index >= 0 && index < galleryImages.length) {
//         galleryImages.splice(index, 1);
//         displayGalleryImages();
//         showAlert('Gallery image removed', 'success');
//     }
// }

// function clearGallery() {
//     galleryImages = [];
//     displayGalleryImages();
//     showAlert('All gallery images removed', 'success');
// }

// // Booking Requests functions
// async function loadBookingRequests() {
//     console.log('Loading booking requests...');
    
//     try {
//         // Use the dedicated hotel booking requests endpoint
//         const response = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/bookings/requests`);
        
//         if (response && response.success) {
//             const requests = response.requests || [];
//             displayBookingRequests(requests);
//             updateRequestsCount(requests.length);
//         } else {
//             displayBookingRequests([]);
//             updateRequestsCount(0);
//         }
//     } catch (error) {
//         console.error('Error loading booking requests:', error);
//         showAlert('Failed to load booking requests', 'error');
//     }
// }

// function displayBookingRequests(requests) {
//     const tbody = document.getElementById('bookingRequestsTable');
    
//     if (!requests || requests.length === 0) {
//         tbody.innerHTML = '<tr><td colspan="9" class="text-center">No pending booking requests.</td></tr>';
//         return;
//     }
    
//     const html = requests.map(request => `
//         <tr>
//             <td><strong>${request.bookingId || request._id || 'N/A'}</strong></td>
//             <td>
//                 <strong>${request.customer?.name || 'Unknown'}</strong><br>
//                 <small class="text-muted">${request.customer?.email || ''}</small>
//             </td>
//             <td>${request.tourName || 'Tour Package'}</td>
//             <td>${formatDate(request.tripDetails?.checkIn)}</td>
//             <td>${formatDate(request.tripDetails?.checkOut)}</td>
//             <td>${request.tripDetails?.travelers || 1}</td>
//             <td><strong>${formatCurrency(request.payment?.totalAmount || 0)}</strong></td>
//             <td><span class="badge bg-${getStatusColor(request.status)}">${request.status || 'pending'}</span></td>
//             <td>
//                 <div class="btn-group" role="group">
//                     <button class="btn btn-sm btn-outline-info" onclick="viewBookingDetails('${request.bookingId || request._id}')">
//                         <i class="fas fa-eye"></i>
//                     </button>
//                     <button class="btn btn-sm btn-success" onclick="handleBookingAction('${request.bookingId || request._id}', 'accept')">
//                         <i class="fas fa-check"></i>
//                     </button>
//                     <button class="btn btn-sm btn-danger" onclick="handleBookingAction('${request.bookingId || request._id}', 'reject')">
//                         <i class="fas fa-times"></i>
//                     </button>
//                 </div>
//             </td>
//         </tr>
//     `).join('');
    
//     tbody.innerHTML = html;
// }

// // Booking History functions
// async function loadBookingHistory() {
//     console.log('Loading booking history...');
    
//     try {
//         const response = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/bookings/history`);
//         if (response && response.success) {
//             displayBookingHistory(response.history);
//         }
//     } catch (error) {
//         console.error('Error loading booking history:', error);
//         showAlert('Failed to load booking history', 'error');
//     }
// }

// function displayBookingHistory(history) {
//     const tbody = document.getElementById('bookingHistoryTable');
    
//     if (!history || history.length === 0) {
//         tbody.innerHTML = '<tr><td colspan="9" class="text-center">No booking history available.</td></tr>';
//         return;
//     }
    
//     const html = history.map(booking => `
//         <tr>
//             <td><strong>${booking.bookingId}</strong></td>
//             <td>${booking.customer}</td>
//             <td>${booking.tourName}</td>
//             <td>${formatDate(booking.checkInDate)}</td>
//             <td>${formatDate(booking.checkOutDate)}</td>
//             <td>${booking.travelers}</td>
//             <td><strong>${formatCurrency(booking.amount)}</strong></td>
//             <td><span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span></td>
//             <td>${formatDateTime(booking.confirmedAt)}</td>
//         </tr>
//     `).join('');
    
//     tbody.innerHTML = html;
// }

// // Booking action functions
// async function viewBookingDetails(bookingId) {
//     console.log(`Viewing booking details for: ${bookingId}`);
    
//     try {
//         // Get specific booking details from bookingformsdatas collection
//         const response = await makeAPIRequest(`${API_BASE_URL}/bookingformsdata/${bookingId}`);
//         console.log('Booking details response:', response);
        
//         if (response && (response.success || response._id)) {
//             // Handle different response formats
//             const bookingData = response.success ? response.data : response;
            
//             // Convert to expected format for modal
//             const formattedBooking = {
//                 bookingId: bookingData._id,
//                 tourName: 'Custom Tour Package',
//                 status: bookingData.status || 'pending',
//                 customer: {
//                     name: bookingData.user?.fullName || bookingData.tourist?.name || 'Unknown',
//                     email: bookingData.user?.email || bookingData.tourist?.email || '',
//                     phone: bookingData.user?.phone || bookingData.tourist?.phone || ''
//                 },
//                 tripDetails: {
//                     checkIn: bookingData.hotel?.fromDate || bookingData.hotel?.checkIn,
//                     checkOut: bookingData.hotel?.toDate || bookingData.hotel?.checkOut,
//                     travelers: bookingData.tourist?.totalTravellers || 1,
//                     places: bookingData.touristPlaces || []
//                 },
//                 payment: {
//                     totalAmount: bookingData.totalAmount || 0
//                 },
//                 agent: {
//                     name: bookingData.agent?.name || bookingData.selectedAgent?.name || '',
//                     experience: bookingData.agent?.experience || bookingData.selectedAgent?.experience || '',
//                     location: bookingData.agent?.location || bookingData.selectedAgent?.location || ''
//                 },
//                 specialRequests: bookingData.specialRequests || ''
//             };
            
//             showBookingDetailsModal(formattedBooking);
//         } else {
//             showAlert('Booking not found', 'error');
//         }
//     } catch (error) {
//         console.error('Error loading booking details:', error);
//         showAlert('Failed to load booking details: ' + error.message, 'error');
//     }
// }

// function showBookingDetailsModal(booking) {
//     const modalContent = document.getElementById('bookingDetailsContent');
    
//     modalContent.innerHTML = `
//         <div class="row">
//             <div class="col-md-6">
//                 <h6>Booking Information</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Booking ID:</strong></td><td>${booking.bookingId}</td></tr>
//                     <tr><td><strong>Tour Package:</strong></td><td>${booking.tourName}</td></tr>
//                     <tr><td><strong>Status:</strong></td><td><span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span></td></tr>
//                     <tr><td><strong>Total Amount:</strong></td><td><strong>${formatCurrency(booking.payment.totalAmount)}</strong></td></tr>
//                 </table>
//             </div>
//             <div class="col-md-6">
//                 <h6>Customer Information</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Name:</strong></td><td>${booking.customer.name}</td></tr>
//                     <tr><td><strong>Email:</strong></td><td>${booking.customer.email}</td></tr>
//                     <tr><td><strong>Phone:</strong></td><td>${booking.customer.phone}</td></tr>
//                 </table>
//             </div>
//         </div>
        
//         <div class="row">
//             <div class="col-md-6">
//                 <h6>Trip Details</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Check-in:</strong></td><td>${formatDate(booking.tripDetails.checkIn)}</td></tr>
//                     <tr><td><strong>Check-out:</strong></td><td>${formatDate(booking.tripDetails.checkOut)}</td></tr>
//                     <tr><td><strong>Travelers:</strong></td><td>${booking.tripDetails.travelers}</td></tr>
//                     <tr><td><strong>Places:</strong></td><td>${booking.tripDetails.places ? booking.tripDetails.places.join(', ') : 'N/A'}</td></tr>
//                 </table>
//             </div>
//             <div class="col-md-6">
//                 <h6>Agent Information</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Agent:</strong></td><td>${booking.agent.name || 'Not assigned'}</td></tr>
//                     <tr><td><strong>Experience:</strong></td><td>${booking.agent.experience || 'N/A'}</td></tr>
//                     <tr><td><strong>Location:</strong></td><td>${booking.agent.location || 'N/A'}</td></tr>
//                 </table>
//             </div>
//         </div>
        
//         ${booking.specialRequests ? `
//         <div class="row">
//             <div class="col-12">
//                 <h6>Special Requests</h6>
//                 <p class="border p-3 bg-light">${booking.specialRequests}</p>
//             </div>
//         </div>
//         ` : ''}
//     `;
    
//     // Store current booking for actions
//     currentBookingForAction = booking.bookingId;
    
//     // Show modal
//     const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
//     modal.show();
// }

// async function handleBookingAction(bookingId, action) {
//     console.log(`Handling booking ${bookingId} with action: ${action}`);
    
//     // Validate inputs
//     if (!bookingId) {
//         console.error('No booking ID provided');
//         showAlert('Invalid booking ID', 'error');
//         return;
//     }
    
//     if (!action || !['accept', 'reject'].includes(action)) {
//         console.error('Invalid action:', action);
//         showAlert('Invalid action', 'error');
//         return;
//     }
    
//     const confirmMessage = action === 'accept' 
//         ? 'Are you sure you want to accept this booking?'
//         : 'Are you sure you want to reject this booking?';
        
//     if (!confirm(confirmMessage)) {
//         return;
//     }
    
//     // Get optional notes
//     const notes = prompt(action === 'accept' ? 'Add any notes for the customer (optional):' : 'Reason for rejection (optional):', '');
    
//     try {
//         console.log('Starting booking action process...');
        
//         // Check authentication token
//         const token = getAuthToken();
//         console.log('Auth token available:', !!token);
        
//         if (!token) {
//             showAlert('Authentication required. Please login again.', 'error');
//             setTimeout(() => {
//                 logout();
//             }, 2000);
//             return;
//         }
        
//         // Use the dedicated hotel booking handle endpoint
//         const apiUrl = `${HOTEL_DASHBOARD_API}/bookings/${bookingId}/handle`;
//         const requestBody = {
//             action: action,    // 'accept' or 'reject'
//             notes: notes || ''
//         };
        
//         console.log('Using correct API endpoint:', apiUrl);
//         console.log('Request body:', requestBody);
        
//         const response = await makeAPIRequest(apiUrl, {
//             method: 'PUT',
//             body: JSON.stringify(requestBody)
//         });
        
//         console.log('Hotel confirm API response:', response);
        
//         if (response && response.success) {
//             showAlert(response.message, 'success');
            
//             // Refresh views
//             const activeSection = document.querySelector('.content-section.active');
//             if (activeSection) {
//                 const sectionId = activeSection.id.replace('-section', '');
//                 console.log('Refreshing section:', sectionId);
//                 if (sectionId === 'requests') {
//                     await loadBookingRequests();
//                 } else if (sectionId === 'dashboard') {
//                     await loadDashboardData();
//                 }
//             }
//             // Always refresh history so processed requests appear there
//             await loadBookingHistory();
            
//             // Close modal
//             const modal = bootstrap.Modal.getInstance(document.getElementById('bookingDetailsModal'));
//             if (modal) modal.hide();
//         } else {
//             console.error('API returned failure:', response);
//             showAlert(response?.message || `Failed to ${action} booking`, 'error');
//         }
//     } catch (error) {
//         console.error(`Error ${action}ing booking:`, error);
//         showAlert(`Failed to ${action} booking: ${error.message}`, 'error');
//     }
// }

// // Setup modal event listeners
// document.addEventListener('DOMContentLoaded', function() {
//     const acceptBtn = document.getElementById('acceptBookingBtn');
//     const rejectBtn = document.getElementById('rejectBookingBtn');
    
//     if (acceptBtn) {
//         acceptBtn.addEventListener('click', () => {
//             if (currentBookingForAction) {
//                 handleBookingAction(currentBookingForAction, 'accept');
//             }
//         });
//     }
    
//     if (rejectBtn) {
//         rejectBtn.addEventListener('click', () => {
//             if (currentBookingForAction) {
//                 handleBookingAction(currentBookingForAction, 'reject');
//             }
//         });
//     }
// });

// // Room Management functions
// async function loadRoomTypes() {
//     console.log('Loading room types...');
    
//     if (!hotelData) {
//         await loadHotelProfile();
//     }
    
//     if (hotelData && hotelData.room_types) {
//         displayRoomTypes(hotelData.room_types);
//     }
// }

// function displayRoomTypes(roomTypes) {
//     const container = document.getElementById('roomTypesContainer');
    
//     if (!roomTypes || roomTypes.length === 0) {
//         container.innerHTML = '<div class="col-12"><p class="text-muted">No room types configured.</p></div>';
//         return;
//     }
    
//     const html = roomTypes.map((room, index) => `
//         <div class="col-md-6 col-lg-4 mb-4">
//             <div class="card">
//                 <div class="card-body">
//                     <h5 class="card-title">${room.type}</h5>
//                     <h4 class="text-primary">${formatCurrency(room.price_per_night || room.price || room.pricePerNight)}<small class="text-muted">/night</small></h4>
//                     <p class="card-text">
//                         <strong>Features:</strong><br>
//                         ${room.features ? room.features.join(', ') : 'Standard amenities'}
//                     </p>
//                     <button class="btn btn-outline-primary btn-sm" onclick="editRoom(${index})">
//                         <i class="fas fa-edit me-1"></i>Edit
//                     </button>
//                     <button class="btn btn-outline-danger btn-sm ms-2" onclick="deleteRoom(${index})">
//                         <i class="fas fa-trash me-1"></i>Delete
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `).join('');
    
//     container.innerHTML = html;
// }

// function addRoom() {
//     // Clear the form
//     document.getElementById('roomTypeForm').reset();
    
//     // Show modal
//     const modal = new bootstrap.Modal(document.getElementById('addRoomModal'));
//     modal.show();
// }

// async function saveRoom() {
//     const roomType = document.getElementById('roomType').value;
//     const pricePerNight = document.getElementById('pricePerNight').value;
//     const roomFeatures = document.getElementById('roomFeatures').value;
    
//     if (!roomType || !pricePerNight) {
//         showAlert('Please fill in all required fields', 'error');
//         return;
//     }
    
//     const newRoom = {
//         type: roomType,
//         price_per_night: String(sanitizePrice(pricePerNight)),
//         features: roomFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0)
//     };
    
//     try {
//         // Add room to current room types
//         const updatedRoomTypes = [...(hotelData.room_types || []), newRoom];
        
//         const userId = (currentUser && (currentUser.id || currentUser._id)) || localStorage.getItem('userId');
//         const response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${userId}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify({ room_types: updatedRoomTypes })
//             }
//         );
        
//         if (response && response.success) {
//             hotelData = response.data;
//             displayRoomTypes(hotelData.room_types);
            
//             // Hide modal
//             const modal = bootstrap.Modal.getInstance(document.getElementById('addRoomModal'));
//             modal.hide();
            
//             showAlert('Room type added successfully!', 'success');
//         }
//     } catch (error) {
//         console.error('Error adding room type:', error);
//         showAlert('Failed to add room type', 'error');
//     }
// }

// function editRoom(index) {
//     if (!hotelData || !hotelData.room_types[index]) {
//         showAlert('Room not found', 'error');
//         return;
//     }
    
// const room = hotelData.room_types[index];
    
//     // Populate form with existing data
//     document.getElementById('roomType').value = room.type;
//     document.getElementById('pricePerNight').value = sanitizePrice(room.price_per_night || room.price || room.pricePerNight);
//     document.getElementById('roomFeatures').value = room.features ? room.features.join(', ') : '';
    
//     // Change save button to update
//     const saveBtn = document.querySelector('#addRoomModal .btn-primary');
//     saveBtn.textContent = 'Update Room';
//     saveBtn.onclick = () => updateRoom(index);
    
//     // Show modal
//     const modal = new bootstrap.Modal(document.getElementById('addRoomModal'));
//     modal.show();
// }

// async function updateRoom(index) {
//     const roomType = document.getElementById('roomType').value;
//     const pricePerNight = document.getElementById('pricePerNight').value;
//     const roomFeatures = document.getElementById('roomFeatures').value;
    
//     if (!roomType || !pricePerNight) {
//         showAlert('Please fill in all required fields', 'error');
//         return;
//     }
    
// const updatedRoom = {
//         type: roomType,
//         price_per_night: String(sanitizePrice(pricePerNight)),
//         features: roomFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0)
//     };
    
//     try {
//         // Update room types array
//         const updatedRoomTypes = [...hotelData.room_types];
//         updatedRoomTypes[index] = updatedRoom;
        
//         const userId = (currentUser && (currentUser.id || currentUser._id)) || localStorage.getItem('userId');
//         const response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${userId}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify({ room_types: updatedRoomTypes })
//             }
//         );
        
//         if (response && response.success) {
//             hotelData = response.data;
//             displayRoomTypes(hotelData.room_types);
            
//             // Hide modal and reset button
//             const modal = bootstrap.Modal.getInstance(document.getElementById('addRoomModal'));
//             modal.hide();
            
//             const saveBtn = document.querySelector('#addRoomModal .btn-primary');
//             saveBtn.textContent = 'Save Room';
//             saveBtn.onclick = saveRoom;
            
//             showAlert('Room type updated successfully!', 'success');
//         }
//     } catch (error) {
//         console.error('Error updating room type:', error);
//         showAlert('Failed to update room type', 'error');
//     }
// }

// async function deleteRoom(index) {
//     if (!confirm('Are you sure you want to delete this room type?')) {
//         return;
//     }
    
//     try {
//         // Remove room from array
//         const updatedRoomTypes = hotelData.room_types.filter((_, i) => i !== index);
        
// const userId = (currentUser && (currentUser.id || currentUser._id)) || localStorage.getItem('userId');
//         const response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${userId}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify({ room_types: updatedRoomTypes })
//             }
//         );
        
//         if (response && response.success) {
//             hotelData = response.data;
//             displayRoomTypes(hotelData.room_types);
//             showAlert('Room type deleted successfully!', 'success');
//         }
//     } catch (error) {
//         console.error('Error deleting room type:', error);
//         showAlert('Failed to delete room type', 'error');
//     }
// }

// // Initialize dashboard
// document.addEventListener('DOMContentLoaded', async function() {
//     console.log('Hotel Dashboard initializing...');
    
//     // Check authentication
//     if (!isAuthenticated()) {
//         showAlert('Please login to access the dashboard', 'error');
//         setTimeout(() => {
//             window.location.href = 'sign in.html';
//         }, 2000);
//         return;
//     }
    
//     // Get user data
//     const userData = localStorage.getItem('user');
//     if (userData) {
//         currentUser = JSON.parse(userData);
//         // Normalize: ensure both .id and ._id are present (login may save either)
//         if (!currentUser.id && currentUser._id) currentUser.id = currentUser._id;
//         if (!currentUser._id && currentUser.id) currentUser._id = currentUser.id;
        
//         // Check if user is a hotel manager
//         if (currentUser.role !== 'hotel') {
//             showAlert('Access denied. This dashboard is for hotel managers only.', 'error');
//             setTimeout(() => {
//                 logout();
//             }, 3000);
//             return;
//         }
        
//         // Update welcome message
//         const welcomeElement = document.getElementById('userWelcome');
//         if (welcomeElement) {
//             welcomeElement.textContent = currentUser.fullName || 'Hotel Manager';
//         }
//     }
    
//     // Load initial dashboard data
//     await loadDashboardData();
    
//     console.log('Hotel Dashboard initialized successfully');
// });
// // Debug functions for troubleshooting
// window.debugBookingAction = async function(bookingId, action) {
//     console.log('=== BOOKING ACTION DEBUG ===');
//     console.log('Booking ID:', bookingId);
//     console.log('Action:', action);
//     console.log('Auth token:', getAuthToken() ? 'present' : 'missing');
//     console.log('Current user:', currentUser);
    
//     const testEndpoints = [
//         // Test GET first to see if booking exists
//         {
//             name: 'GET booking details',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}`,
//             method: 'GET'
//         },
//         // Test various update endpoints
//         {
//             name: 'PATCH bookingformsdata',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}`,
//             method: 'PATCH',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected',
//                 hotelNotes: 'Debug test'
//             }
//         },
//         {
//             name: 'PUT bookingformsdata',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}`,
//             method: 'PUT',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected'
//             }
//         },
//         {
//             name: 'Hotel confirm endpoint (CORRECT)',
//             url: `${API_BASE_URL}/bookingformsdata/hotel/confirm/${bookingId}`,
//             method: 'PUT',
//             body: { 
//                 confirmed: action === 'accept' ? true : false,
//                 notes: 'Debug test'
//             }
//         },
//         {
//             name: 'Update endpoint',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}/update`,
//             method: 'PUT',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected'
//             }
//         },
//         {
//             name: 'Bookings collection',
//             url: `${API_BASE_URL}/bookings/${bookingId}`,
//             method: 'PATCH',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected'
//             }
//         }
//     ];
    
//     for (const endpoint of testEndpoints) {
//         try {
//             console.log(`\n--- Testing ${endpoint.name} ---`);
//             console.log('URL:', endpoint.url);
//             console.log('Method:', endpoint.method);
            
//             const options = {
//                 method: endpoint.method,
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${getAuthToken()}`
//                 }
//             };
            
//             if (endpoint.body) {
//                 options.body = JSON.stringify(endpoint.body);
//                 console.log('Body:', endpoint.body);
//             }
            
//             const response = await fetch(endpoint.url, options);
//             console.log('Status:', response.status, response.statusText);
            
//             let data;
//             try {
//                 data = await response.json();
//                 console.log('Response:', data);
//             } catch {
//                 const text = await response.text();
//                 console.log('Raw response:', text);
//             }
            
//             if (response.ok) {
//                 console.log('✅ SUCCESS - This endpoint works!');
//                 break; // Stop testing if we find a working endpoint
//             } else {
//                 console.log('❌ FAILED');
//             }
            
//         } catch (error) {
//             console.log('❌ ERROR:', error.message);
//         }
//     }
    
//     console.log('=== END DEBUG ===');
// };

// window.testAuth = function() {
//     console.log('=== AUTH TEST ===');
//     console.log('authToken:', localStorage.getItem('authToken'));
//     console.log('token:', localStorage.getItem('token'));
//     console.log('user:', localStorage.getItem('user'));
//     console.log('Current user object:', currentUser);
//     console.log('getAuthToken():', getAuthToken());
//     console.log('isAuthenticated():', isAuthenticated());
//     console.log('=== END AUTH TEST ===');
// };

// // Expose necessary functions to global scope
// window.showSection = showSection;
// window.refreshDashboard = refreshDashboard;
// window.loadBookingRequests = loadBookingRequests;
// window.loadBookingHistory = loadBookingHistory;
// window.viewBookingDetails = viewBookingDetails;
// window.handleBookingAction = handleBookingAction;
// window.addRoom = addRoom;
// window.saveRoom = saveRoom;
// window.editRoom = editRoom;
// window.updateRoom = updateRoom;
// window.deleteRoom = deleteRoom;
// window.removeGalleryImage = removeGalleryImage;
// window.clearGallery = clearGallery;
// window.loadHotelProfile = loadHotelProfile;
// window.logout = logout;
// window.toggleMobileSidebar = toggleMobileSidebar;







// Hotel Dashboard JavaScript

// Configuration
// const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000/api';
// const HOTEL_DASHBOARD_API = `${API_BASE_URL}/hoteldashboard`;

// const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23e9ecef'/%3E%3Ctext x='150' y='90' font-family='Arial' font-size='14' fill='%236c757d' text-anchor='middle'%3E%3Ctspan x='150' dy='0'%3E%F0%9F%8F%A8%3C/tspan%3E%3Ctspan x='150' dy='25'%3EHotel Image%3C/tspan%3E%3C/text%3E%3C/svg%3E";

// // Global variables
// let currentUser = null;
// let hotelData = null;
// let currentBookingForAction = null;
// let galleryImages = []; // Store gallery images

// // Authentication functions
// function getAuthToken() {
//     const authToken = localStorage.getItem('authToken');
//     const regularToken = localStorage.getItem('token');
//     const token = authToken || regularToken;
    
//     console.log('Token check:', {
//         authToken: authToken ? 'present' : 'missing',
//         regularToken: regularToken ? 'present' : 'missing',
//         using: token ? 'found token' : 'no token'
//     });
    
//     return token;
// }

// function isAuthenticated() {
//     const token = getAuthToken();
//     return token !== null;
// }

// function logout() {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     localStorage.removeItem('userRole');
//     localStorage.removeItem('userEmail');
//     localStorage.removeItem('userId');
//     window.location.href = 'sign in.html';
// }

// // API request function with error handling
// async function makeAPIRequest(url, options = {}) {
//     const token = getAuthToken();
    
//     if (!token) {
//         console.error('No authentication token available');
//         showAlert('Authentication required. Please login again.', 'error');
//         logout();
//         return null;
//     }
    
//     const defaultOptions = {
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//             ...options.headers
//         }
//     };

//     const mergedOptions = { ...defaultOptions, ...options };

//     try {
//         showLoading(true);
//         console.log(`Making API request to: ${url}`);
//         console.log('Request options:', {
//             method: mergedOptions.method || 'GET',
//             headers: mergedOptions.headers,
//             body: mergedOptions.body ? 'present' : 'none'
//         });
        
//         const response = await fetch(url, mergedOptions);
//         console.log('Raw response status:', response.status, response.statusText);
        
//         let data;
//         const contentType = response.headers.get('content-type');
        
//         if (contentType && contentType.includes('application/json')) {
//             data = await response.json();
//         } else {
//             const textData = await response.text();
//             console.log('Non-JSON response:', textData);
//             try {
//                 data = JSON.parse(textData);
//             } catch {
//                 data = { message: textData, status: response.status };
//             }
//         }

//         console.log('Parsed response data:', data);

//         if (!response.ok) {
//             if (response.status === 401) {
//                 showAlert('Session expired. Please login again.', 'error');
//                 logout();
//                 return null;
//             }
            
//             const errorMessage = data?.message || `HTTP ${response.status}: ${response.statusText}`;
//             console.error('API Error Response:', errorMessage);
//             throw new Error(errorMessage);
//         }

//         return data;
//     } catch (error) {
//         console.error('API Request Error:', error);
        
//         // Don't show alerts for expected errors (they're handled by caller)
//         if (!error.message.includes('Session expired')) {
//             console.error('Detailed error info:', {
//                 url,
//                 method: options.method || 'GET',
//                 error: error.message
//             });
//         }
        
//         throw error; // Re-throw so caller can handle
//     } finally {
//         showLoading(false);
//     }
// }

// // Utility functions
// function showLoading(show) {
//     const loader = document.getElementById('loading');
//     if (loader) {
//         loader.style.display = show ? 'block' : 'none';
//     }
// }

// function showAlert(message, type = 'info') {
//     // Create alert element
//     const alertDiv = document.createElement('div');
//     alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
//     alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
//     alertDiv.innerHTML = `
//         <strong>${type === 'error' ? 'Error!' : type === 'success' ? 'Success!' : 'Info!'}</strong> ${message}
//         <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
//     `;
    
//     document.body.appendChild(alertDiv);
    
//     // Auto remove after 5 seconds
//     setTimeout(() => {
//         if (alertDiv.parentNode) {
//             alertDiv.parentNode.removeChild(alertDiv);
//         }
//     }, 5000);
// }

// function formatDate(dateString) {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//     });
// }

// function formatDateTime(dateString) {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-IN', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//     });
// }

// function sanitizePrice(value) {
//     // Accept numbers or strings like "3000", "₹3000", "3,000", etc.
//     if (value === null || value === undefined || value === '') return 0;
//     if (typeof value === 'number') return isNaN(value) ? 0 : value;
//     const cleaned = String(value).replace(/[^0-9.]/g, '');
//     const num = Number(cleaned);
//     return isNaN(num) ? 0 : num;
// }

// function formatCurrency(amount) {
//     const num = sanitizePrice(amount);
//     return `₹${num.toLocaleString('en-IN')}`;
// }

// // Mobile sidebar toggle
// function toggleMobileSidebar() {
//     const sidebar = document.querySelector('.sidebar');
//     const overlay = document.getElementById('sidebarOverlay');
//     sidebar.classList.toggle('show');
//     overlay.classList.toggle('show');
// }

// // Section navigation
// function showSection(sectionName) {
//     console.log(`Showing section: ${sectionName}`);
    
//     // Close mobile sidebar if open
//     const sidebar = document.querySelector('.sidebar');
//     const overlay = document.getElementById('sidebarOverlay');
//     if (sidebar && sidebar.classList.contains('show')) {
//         sidebar.classList.remove('show');
//         overlay && overlay.classList.remove('show');
//     }
    
//     // Hide all sections
//     document.querySelectorAll('.content-section').forEach(section => {
//         section.classList.remove('active');
//     });
    
//     // Remove active class from all nav links
//     document.querySelectorAll('.sidebar .nav-link').forEach(link => {
//         link.classList.remove('active');
//     });
    
//     // Show selected section
//     const targetSection = document.getElementById(`${sectionName}-section`);
//     if (targetSection) {
//         targetSection.classList.add('active');
//     }
    
//     // Add active class to clicked nav link
//     document.querySelectorAll('.sidebar .nav-link').forEach(link => {
//         if (link.onclick && link.onclick.toString().includes(sectionName)) {
//             link.classList.add('active');
//         }
//     });
    
//     // Load data for specific sections
//     switch (sectionName) {
//         case 'dashboard':
//             loadDashboardData();
//             break;
//         case 'profile':
//             console.log('Loading profile section...');
//             loadHotelProfile();
//             break;
//         case 'requests':
//             loadBookingRequests();
//             break;
//         case 'history':
//             loadBookingHistory();
//             break;
//         case 'rooms':
//             loadRoomTypes();
//             break;
//     }
// }

// // Dashboard functions
// async function loadDashboardData() {
//     console.log('Loading dashboard data...');
    
//     try {
//         // Use the dedicated stats endpoint — it already filters by hotel correctly
//         const statsResponse = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/stats`);
        
//         if (statsResponse && statsResponse.success) {
//             updateDashboardStats(statsResponse.stats);
//             updateRequestsCount(statsResponse.stats.pendingRequests);
//         }
        
//         // Load recent pending booking requests for the dashboard preview
//         const requestsResponse = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/bookings/requests`);
        
//         if (requestsResponse && requestsResponse.success) {
//             const recentBookings = (requestsResponse.requests || []).slice(0, 5).map(booking => ({
//                 bookingId: booking.bookingId || booking._id,
//                 customer: {
//                     name: booking.customer?.name || 'Unknown'
//                 },
//                 tripDetails: {
//                     travelers: booking.tripDetails?.travelers || 1
//                 },
//                 payment: {
//                     totalAmount: booking.payment?.totalAmount || 0
//                 },
//                 status: booking.status || 'pending',
//                 requestedAt: booking.requestedAt || new Date()
//             }));
//             displayRecentBookings(recentBookings);
//         } else {
//             displayRecentBookings([]);
//         }
        
//     } catch (error) {
//         console.error('Error loading dashboard data:', error);
//         showAlert('Failed to load dashboard data', 'error');
//     }
// }

// function updateDashboardStats(stats) {
//     document.getElementById('totalBookings').textContent = stats.totalBookings || 0;
//     document.getElementById('pendingRequests').textContent = stats.pendingRequests || 0;
//     document.getElementById('confirmedBookings').textContent = stats.confirmedBookings || 0;
//     document.getElementById('totalRevenue').textContent = stats.totalRevenue
//         ? Number(stats.totalRevenue).toLocaleString('en-IN') : '0';
// }

// function updateRequestsCount(count) {
//     const badge = document.getElementById('requestsCount');
//     if (badge) {
//         badge.textContent = count || 0;
//     }
// }

// function displayRecentBookings(bookings) {
//     const container = document.getElementById('recentBookings');
    
//     if (!bookings || bookings.length === 0) {
//         container.innerHTML = '<p class="text-muted">No recent booking requests.</p>';
//         return;
//     }
    
//     const html = bookings.map(booking => `
//         <div class="border-bottom py-3">
//             <div class="row align-items-center">
//                 <div class="col-md-3">
//                     <strong>${booking.bookingId}</strong>
//                     <br><small class="text-muted">${booking.customer.name}</small>
//                 </div>
//                 <div class="col-md-3">
//                     <span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span>
//                     <br><small class="text-muted">${formatDate(booking.requestedAt)}</small>
//                 </div>
//                 <div class="col-md-3">
//                     <strong>${formatCurrency(booking.payment.totalAmount)}</strong>
//                     <br><small class="text-muted">${booking.tripDetails.travelers} travelers</small>
//                 </div>
//                 <div class="col-md-3 text-end">
//                     <button class="btn btn-sm btn-outline-primary" onclick="viewBookingDetails('${booking.bookingId}')">
//                         <i class="fas fa-eye me-1"></i>View
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `).join('');
    
//     container.innerHTML = html;
// }

// function getStatusColor(status) {
//     const statusColors = {
//         'pending': 'warning',
//         'agent_confirmed': 'info',
//         'hotel_confirmed': 'primary',
//         'hotel_accepted': 'primary',
//         'hotel_rejected': 'danger',
//         'confirmed': 'success',
//         'cancelled': 'danger',
//         'completed': 'success',
//         'payment_complete': 'success'
//     };
//     return statusColors[status] || 'secondary';
// }

// async function refreshDashboard() {
//     await loadDashboardData();
//     showAlert('Dashboard refreshed successfully!', 'success');
// }

// // Hotel Profile functions
// function createDummyHotelData() {
//     // Create dummy hotel data for first-time setup
//     hotelData = {
//         _id: null, // Flag to indicate this is a new hotel profile
//         manager_email: currentUser.email,
//         hotel_details: {
//             hotel_name: 'Enter Hotel Name',
//             description: 'Enter hotel description here...',
//             contact: 'Enter contact number',
//             location: {
//                 district: 'Enter district',
//                 pincode: 380001
//             },
//             check_in_time: '14:00',
//             check_out_time: '12:00',
//             amenities: []
//         },
//         rooms: [],
//         gallery: [],
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//     };
    
//     console.log('Created dummy hotel data for first-time setup:', hotelData);
    
//     // Populate the form with dummy data
//     populateProfileForm(hotelData);
//     updateProfileStatus('new');
//     showAlert('Welcome! Please fill in your hotel details to create your profile.', 'info');
// }

// async function loadHotelProfile() {
//     console.log('Loading hotel profile...');
    
//     try {
//         // Show loading states
//         updateProfileStatus('loading');
//         showLoading(true);
        
//         // Get current user data first to ensure we have user info
//         const userData = localStorage.getItem('user');
//         if (userData) {
//             currentUser = JSON.parse(userData);
//             // Normalize: ensure both .id and ._id are present
//             if (!currentUser.id && currentUser._id) currentUser.id = currentUser._id;
//             if (!currentUser._id && currentUser.id) currentUser._id = currentUser.id;
//             console.log('Current user loaded:', currentUser);
//         }
        
//         if (!currentUser || !currentUser.id) {
//             throw new Error('User not properly authenticated. Please login again.');
//         }
        
//         // 🔧 SIMPLIFIED: Use the /me endpoint which handles all the complex logic
//         console.log('🔍 Fetching hotel profile using /me endpoint for user:', currentUser.email);
        
//         let response = null;
        
//         try {
//             // Use the /me endpoint that handles all the relationship logic
//             response = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/me`);
            
//             if (response && response.success && response.data) {
//                 console.log('✅ Successfully loaded hotel data via /me endpoint');
//             }
//         } catch (error) {
//             console.log('❌ Failed to load hotel via /me endpoint:', error.message);
//             // The /me endpoint will automatically create a hotel if none exists
//             // So if this fails, it's a real error
//             throw error;
//         }
        
//         console.log('Final hotel profile response:', response);
        
//         if (response && response.success && response.data) {
//             hotelData = response.data;
//             console.log('✅ Hotel data loaded successfully:', {
//                 hotelId: hotelData._id,
//                 hotelName: hotelData.hotel_details?.hotel_name,
//                 managerId: hotelData.manager_id,
//                 managerEmail: hotelData.manager_email
//             });
            
//             // The backend guarantees we have hotel data at this point
//             populateProfileForm(hotelData);
//             updateProfileStatus('loaded');
//             showAlert('Hotel profile loaded successfully!', 'success');
//         } else {
//             // This should not happen with the new backend logic
//             throw new Error('Unexpected: No hotel data returned from /me endpoint');
//         }
//     } catch (error) {
//         console.error('❌ Error loading hotel profile:', error);
//         updateProfileStatus('error');
        
//         let errorMessage = 'Failed to load hotel profile';
//         if (error.message.includes('401')) {
//             errorMessage = 'Authentication required. Please login again.';
//         } else if (error.message.includes('403')) {
//             errorMessage = 'Access denied. You must be a hotel manager to access this page.';
//         } else {
//             errorMessage += ': ' + error.message;
//         }
        
//         showAlert(errorMessage, 'error');
        
//         // For authentication errors, redirect to login
//         if (error.message.includes('401') || error.message.includes('403')) {
//             setTimeout(() => {
//                 logout();
//             }, 3000);
//         }
//     } finally {
//         showLoading(false);
//     }
// }

// // Initialize empty profile form when no data exists
// function initializeEmptyProfile() {
//     console.log('Initializing empty hotel profile form...');
    
//     // Clear all form fields
//     document.getElementById('hotelName').value = '';
//     document.getElementById('contact').value = '';
//     document.getElementById('district').value = '';
//     document.getElementById('pincode').value = '';
//     document.getElementById('checkInTime').value = '14:00';
//     document.getElementById('checkOutTime').value = '11:00';
//     document.getElementById('description').value = '';
//     document.getElementById('amenities').value = '';
    
//     // Reset main image to placeholder
//     document.getElementById('hotelImage').src = PLACEHOLDER_IMAGE;
//     document.getElementById('hotelImage').dataset.changed = 'false';
    
//     // Clear gallery
//     galleryImages = [];
//     displayGalleryImages();
    
//     // Update status
//     updateProfileStatus('empty');
    
//     console.log('Empty profile form initialized');
// }

// // Show message when hotel manager has no associated hotel
// function showNoHotelMessage() {
//     console.log('Displaying no hotel message...');
    
//     // Clear the form area and show message
//     const formContainer = document.getElementById('hotelProfileForm');
//     if (formContainer) {
//         formContainer.innerHTML = `
//             <div class="text-center py-5">
//                 <div class="mb-4">
//                     <i class="fas fa-hotel fa-4x text-muted mb-3"></i>
//                     <h3 class="text-muted">No Hotel Profile Found</h3>
//                     <p class="text-muted mb-4">Your account is not currently associated with any hotel.<br>
//                     Please contact support to get your hotel profile set up.</p>
//                 </div>
//                 <div class="alert alert-info">
//                     <h5 class="alert-heading"><i class="fas fa-info-circle me-2"></i>For Hotel Managers</h5>
//                     <p class="mb-0">If you are a hotel manager, please contact the system administrator to:</p>
//                     <ul class="text-start mt-2 mb-0">
//                         <li>Create your hotel profile in the system</li>
//                         <li>Associate your manager account with your hotel</li>
//                         <li>Set up proper permissions for managing bookings</li>
//                     </ul>
//                 </div>
//                 <button class="btn btn-primary mt-3" onclick="location.reload()">
//                     <i class="fas fa-refresh me-2"></i>Refresh Page
//                 </button>
//                 <button class="btn btn-secondary mt-3 ms-2" onclick="logout()">
//                     <i class="fas fa-sign-out-alt me-2"></i>Logout
//                 </button>
//             </div>
//         `;
//     }
// }

// function populateProfileForm(data) {
//     console.log('Populating profile form with data:', data);
    
//     if (!data || !data.hotel_details) {
//         console.warn('No hotel details found in data');
//         initializeEmptyProfile();
//         return;
//     }
    
//     const { hotel_details, room_types, image, gallery } = data;
    
//     try {
//         // Populate hotel details with safe access
//         const hotelNameField = document.getElementById('hotelName');
//         const contactField = document.getElementById('contact');
//         const districtField = document.getElementById('district');
//         const pincodeField = document.getElementById('pincode');
//         const checkInField = document.getElementById('checkInTime');
//         const checkOutField = document.getElementById('checkOutTime');
//         const descriptionField = document.getElementById('description');
//         const amenitiesField = document.getElementById('amenities');
        
//         if (hotelNameField) hotelNameField.value = hotel_details.hotel_name || '';
//         if (contactField) contactField.value = hotel_details.contact || '';
//         if (districtField) districtField.value = hotel_details.location?.district || '';
//         if (pincodeField) pincodeField.value = hotel_details.location?.pincode || '';
//         if (checkInField) checkInField.value = hotel_details.check_in_time || '14:00';
//         if (checkOutField) checkOutField.value = hotel_details.check_out_time || '11:00';
//         if (descriptionField) descriptionField.value = hotel_details.description || '';
//         if (amenitiesField) {
//             amenitiesField.value = hotel_details.amenities && Array.isArray(hotel_details.amenities) 
//                 ? hotel_details.amenities.join(', ') 
//                 : '';
//         }
        
//         // Set hotel main image
//         const imageElement = document.getElementById('hotelImage');
//         if (imageElement) {
//             if (image && image.base64) {
//                 imageElement.src = `data:image/jpeg;base64,${image.base64}`;
//                 console.log('Main hotel image loaded');
//             } else {
//                 imageElement.src = PLACEHOLDER_IMAGE;
//             }
//             imageElement.dataset.changed = 'false'; // Reset changed flag
//         }
        
//         // Load gallery images
//         if (gallery && Array.isArray(gallery) && gallery.length > 0) {
//             galleryImages = gallery.map((img, index) => ({
//                 base64: img.base64,
//                 id: img.id || `gallery_${Date.now()}_${index}`
//             }));
//             console.log(`Loaded ${galleryImages.length} gallery images`);
//         } else {
//             galleryImages = [];
//             console.log('No gallery images found');
//         }
        
//         // Display gallery images
//         displayGalleryImages();
        
//         console.log('Hotel profile form successfully populated');
        
//         // Show data summary
//         console.log('Profile Summary:', {
//             hotelName: hotel_details.hotel_name,
//             district: hotel_details.location?.district,
//             hasMainImage: !!(image && image.base64),
//             galleryCount: galleryImages.length,
//             amenitiesCount: hotel_details.amenities?.length || 0
//         });
        
//     } catch (error) {
//         console.error('Error populating profile form:', error);
//         showAlert('Error displaying hotel profile data', 'error');
//     }
// }

// // Update profile status indicator
// function updateProfileStatus(status, message = '') {
//     const statusElement = document.getElementById('profileStatus');
//     if (!statusElement) return;
    
//     statusElement.className = 'badge'; // Reset classes
    
//     switch (status) {
//         case 'loading':
//             statusElement.classList.add('bg-secondary');
//             statusElement.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Loading...';
//             break;
//         case 'loaded':
//             statusElement.classList.add('bg-success');
//             statusElement.innerHTML = '<i class="fas fa-check me-1"></i>Profile Loaded';
//             break;
//         case 'empty':
//             statusElement.classList.add('bg-warning');
//             statusElement.innerHTML = '<i class="fas fa-plus me-1"></i>Setup Required';
//             break;
//         case 'new':
//             statusElement.classList.add('bg-info');
//             statusElement.innerHTML = '<i class="fas fa-star me-1"></i>New Profile Setup';
//             break;
//         case 'error':
//             statusElement.classList.add('bg-danger');
//             statusElement.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>Error';
//             break;
//         case 'saving':
//             statusElement.classList.add('bg-info');
//             statusElement.innerHTML = '<i class="fas fa-save fa-spin me-1"></i>Saving...';
//             break;
//         case 'saved':
//             statusElement.classList.add('bg-success');
//             statusElement.innerHTML = '<i class="fas fa-check me-1"></i>Saved Successfully';
//             setTimeout(() => updateProfileStatus('loaded'), 3000);
//             break;
//         case 'not_found':
//             statusElement.classList.add('bg-warning');
//             statusElement.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>No Hotel Profile';
//             break;
//         default:
//             statusElement.classList.add('bg-secondary');
//             statusElement.textContent = message || status;
//     }
// }

// // Handle profile form submission
// document.addEventListener('DOMContentLoaded', function() {
//     const profileForm = document.getElementById('hotelProfileForm');
//     if (profileForm) {
//         profileForm.addEventListener('submit', async function(e) {
//             e.preventDefault();
//             await updateHotelProfile();
//         });
//     }
    
//     // Handle main image upload
//     const imageUpload = document.getElementById('imageUpload');
//     if (imageUpload) {
//         imageUpload.addEventListener('change', handleImageUpload);
//     }
    
//     // Handle gallery images upload
//     const galleryUpload = document.getElementById('galleryUpload');
//     if (galleryUpload) {
//         galleryUpload.addEventListener('change', handleGalleryUpload);
//     }
// });

// async function updateHotelProfile() {
//     console.log('Updating hotel profile...');
    
//     try {
//         // Validate required fields
//         const hotelName = document.getElementById('hotelName').value.trim();
//         const district = document.getElementById('district').value.trim();
        
//         if (!hotelName || !district) {
//             showAlert('Please fill in required fields: Hotel Name and District', 'error');
//             return;
//         }
        
//         // Show saving status
//         updateProfileStatus('saving');
        
//         const formData = {
//             hotel_details: {
//                 hotel_name: hotelName,
//                 contact: document.getElementById('contact').value,
//                 location: {
//                     district: district,
//                     pincode: parseInt(document.getElementById('pincode').value) || 0
//                 },
//                 check_in_time: document.getElementById('checkInTime').value || '14:00',
//                 check_out_time: document.getElementById('checkOutTime').value || '11:00',
//                 description: document.getElementById('description').value,
//                 amenities: document.getElementById('amenities').value
//                     .split(',')
//                     .map(item => item.trim())
//                     .filter(item => item.length > 0)
//             }
//         };
        
//         // Add main image if changed
//         const imageElement = document.getElementById('hotelImage');
//         if (imageElement.dataset.changed === 'true') {
//             formData.image = {
//                 base64: imageElement.src.split(',')[1] // Remove data:image/jpeg;base64, prefix
//             };
//         }
        
//         // Add gallery images
//         if (galleryImages.length > 0) {
//             formData.gallery = galleryImages.map(img => ({
//                 base64: img.base64,
//                 id: img.id
//             }));
//         } else {
//             formData.gallery = []; // Clear gallery if no images
//         }
        
//         console.log('Sending update request with data:', {
//             hotelName: formData.hotel_details.hotel_name,
//             district: formData.hotel_details.location.district,
//             hasMainImage: !!formData.image,
//             galleryCount: formData.gallery.length
//         });
        
//         // Ensure we have currentUser before proceeding
//         if (!currentUser || !currentUser.id) {
//             throw new Error('User not properly authenticated. Please login again.');
//         }
        
//         let response;
        
//         // 🔧 SIMPLIFIED: Always use the existing update endpoint since backend handles creation
//         // The /me endpoint guarantees we have a hotel profile at this point
//         if (!hotelData || !hotelData._id) {
//             throw new Error('No hotel profile loaded. Please refresh the page and try again.');
//         }
        
//         console.log('🔄 Updating existing hotel profile:', hotelData._id);
        
//         // Use the proper update endpoint with user ID (not hotel ID)
//         response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${currentUser.id}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify(formData)
//             }
//         );
        
//         if (response && response.success) {
//             // Update hotelData with the response data
//             hotelData = response.data;
            
//             updateProfileStatus('saved');
//             showAlert('Hotel profile updated successfully!', 'success');
//             console.log('✅ Hotel profile updated successfully');
            
//             // Reset image changed flag
//             if (imageElement) {
//                 imageElement.dataset.changed = 'false';
//             }
            
//         } else {
//             throw new Error(response?.message || 'Update failed');
//         }
        
//     } catch (error) {
//         console.error('Error updating hotel profile:', error);
//         updateProfileStatus('error');
//         showAlert('Failed to update hotel profile: ' + error.message, 'error');
//     }
// }

// function handleImageUpload(event) {
//     const file = event.target.files[0];
//     if (file) {
//         if (file.size > 5 * 1024 * 1024) { // 5MB limit
//             showAlert('Image size should be less than 5MB', 'error');
//             return;
//         }
        
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const imageElement = document.getElementById('hotelImage');
//             imageElement.src = e.target.result;
//             imageElement.dataset.changed = 'true';
//         };
//         reader.readAsDataURL(file);
//     }
// }

// // Gallery Image Management Functions
// function handleGalleryUpload(event) {
//     const files = Array.from(event.target.files);
    
//     if (galleryImages.length + files.length > 5) {
//         showAlert('Maximum 5 gallery images allowed', 'error');
//         return;
//     }
    
//     files.forEach(file => {
//         if (file.size > 5 * 1024 * 1024) { // 5MB limit per image
//             showAlert(`Image ${file.name} is too large. Maximum size is 5MB`, 'error');
//             return;
//         }
        
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const imageData = {
//                 base64: e.target.result.split(',')[1], // Remove data:image/jpeg;base64, prefix
//                 id: Date.now() + Math.random(),
//                 name: file.name
//             };
            
//             galleryImages.push(imageData);
//             displayGalleryImages();
//         };
//         reader.readAsDataURL(file);
//     });
    
//     // Clear the input
//     event.target.value = '';
// }

// function displayGalleryImages() {
//     const container = document.getElementById('galleryPreview');
    
//     if (galleryImages.length === 0) {
//         container.innerHTML = `
//             <div class="col-12">
//                 <div class="gallery-placeholder">
//                     <i class="fas fa-images fa-2x mb-2"></i>
//                     <p class="mb-0">No gallery images uploaded</p>
//                 </div>
//             </div>
//         `;
//         return;
//     }
    
//     const html = galleryImages.map((image, index) => `
//         <div class="col-6 col-md-4">
//             <div class="gallery-item">
//                 <img src="data:image/jpeg;base64,${image.base64}" alt="Gallery Image ${index + 1}">
//                 <button type="button" class="remove-btn" onclick="removeGalleryImage(${index})" title="Remove Image">
//                     <i class="fas fa-times"></i>
//                 </button>
//             </div>
//         </div>
//     `).join('');
    
//     container.innerHTML = html;
// }

// function removeGalleryImage(index) {
//     if (index >= 0 && index < galleryImages.length) {
//         galleryImages.splice(index, 1);
//         displayGalleryImages();
//         showAlert('Gallery image removed', 'success');
//     }
// }

// function clearGallery() {
//     galleryImages = [];
//     displayGalleryImages();
//     showAlert('All gallery images removed', 'success');
// }

// // Booking Requests functions
// async function loadBookingRequests() {
//     console.log('Loading booking requests...');
    
//     try {
//         // Use the dedicated hotel booking requests endpoint
//         const response = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/bookings/requests`);
        
//         if (response && response.success) {
//             const requests = response.requests || [];
//             displayBookingRequests(requests);
//             updateRequestsCount(requests.length);
//         } else {
//             displayBookingRequests([]);
//             updateRequestsCount(0);
//         }
//     } catch (error) {
//         console.error('Error loading booking requests:', error);
//         showAlert('Failed to load booking requests', 'error');
//     }
// }

// function displayBookingRequests(requests) {
//     const tbody = document.getElementById('bookingRequestsTable');
    
//     if (!requests || requests.length === 0) {
//         tbody.innerHTML = '<tr><td colspan="9" class="text-center">No pending booking requests.</td></tr>';
//         return;
//     }
    
//     const html = requests.map(request => `
//         <tr>
//             <td><strong>${request.bookingId || request._id || 'N/A'}</strong></td>
//             <td>
//                 <strong>${request.customer?.name || 'Unknown'}</strong><br>
//                 <small class="text-muted">${request.customer?.email || ''}</small>
//             </td>
//             <td>${request.tourName || 'Tour Package'}</td>
//             <td>${formatDate(request.tripDetails?.checkIn)}</td>
//             <td>${formatDate(request.tripDetails?.checkOut)}</td>
//             <td>${request.tripDetails?.travelers || 1}</td>
//             <td><strong>${formatCurrency(request.payment?.totalAmount || 0)}</strong></td>
//             <td><span class="badge bg-${getStatusColor(request.status)}">${request.status || 'pending'}</span></td>
//             <td>
//                 <div class="btn-group" role="group">
//                     <button class="btn btn-sm btn-outline-info" onclick="viewBookingDetails('${request.bookingId || request._id}')">
//                         <i class="fas fa-eye"></i>
//                     </button>
//                     <button class="btn btn-sm btn-success" onclick="handleBookingAction('${request.bookingId || request._id}', 'accept')">
//                         <i class="fas fa-check"></i>
//                     </button>
//                     <button class="btn btn-sm btn-danger" onclick="handleBookingAction('${request.bookingId || request._id}', 'reject')">
//                         <i class="fas fa-times"></i>
//                     </button>
//                 </div>
//             </td>
//         </tr>
//     `).join('');
    
//     tbody.innerHTML = html;
// }

// // Booking History functions
// async function loadBookingHistory() {
//     console.log('Loading booking history...');
    
//     try {
//         const response = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/bookings/history`);
//         if (response && response.success) {
//             displayBookingHistory(response.history);
//         }
//     } catch (error) {
//         console.error('Error loading booking history:', error);
//         showAlert('Failed to load booking history', 'error');
//     }
// }

// function displayBookingHistory(history) {
//     const tbody = document.getElementById('bookingHistoryTable');
    
//     if (!history || history.length === 0) {
//         tbody.innerHTML = '<tr><td colspan="9" class="text-center">No booking history available.</td></tr>';
//         return;
//     }
    
//     const html = history.map(booking => `
//         <tr>
//             <td><strong>${booking.bookingId}</strong></td>
//             <td>${booking.customer}</td>
//             <td>${booking.tourName}</td>
//             <td>${formatDate(booking.checkInDate)}</td>
//             <td>${formatDate(booking.checkOutDate)}</td>
//             <td>${booking.travelers}</td>
//             <td><strong>${formatCurrency(booking.amount)}</strong></td>
//             <td><span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span></td>
//             <td>${formatDateTime(booking.confirmedAt)}</td>
//         </tr>
//     `).join('');
    
//     tbody.innerHTML = html;
// }

// // Booking action functions
// async function viewBookingDetails(bookingId) {
//     console.log(`Viewing booking details for: ${bookingId}`);
    
//     try {
//         // Get specific booking details from bookingformsdatas collection
//         const response = await makeAPIRequest(`${API_BASE_URL}/bookingformsdata/${bookingId}`);
//         console.log('Booking details response:', response);
        
//         if (response && (response.success || response._id)) {
//             // Handle different response formats
//             const bookingData = response.success ? response.data : response;
            
//             // Convert to expected format for modal
//             const formattedBooking = {
//                 bookingId: bookingData._id,
//                 tourName: 'Custom Tour Package',
//                 status: bookingData.status || 'pending',
//                 customer: {
//                     name: bookingData.user?.fullName || bookingData.tourist?.name || 'Unknown',
//                     email: bookingData.user?.email || bookingData.tourist?.email || '',
//                     phone: bookingData.user?.phone || bookingData.tourist?.phone || ''
//                 },
//                 tripDetails: {
//                     checkIn: bookingData.hotel?.fromDate || bookingData.hotel?.checkIn,
//                     checkOut: bookingData.hotel?.toDate || bookingData.hotel?.checkOut,
//                     travelers: bookingData.tourist?.totalTravellers || 1,
//                     places: bookingData.touristPlaces || []
//                 },
//                 payment: {
//                     totalAmount: bookingData.totalAmount || 0
//                 },
//                 agent: {
//                     name: bookingData.agent?.name || bookingData.selectedAgent?.name || '',
//                     experience: bookingData.agent?.experience || bookingData.selectedAgent?.experience || '',
//                     location: bookingData.agent?.location || bookingData.selectedAgent?.location || ''
//                 },
//                 specialRequests: bookingData.specialRequests || ''
//             };
            
//             showBookingDetailsModal(formattedBooking);
//         } else {
//             showAlert('Booking not found', 'error');
//         }
//     } catch (error) {
//         console.error('Error loading booking details:', error);
//         showAlert('Failed to load booking details: ' + error.message, 'error');
//     }
// }

// function showBookingDetailsModal(booking) {
//     const modalContent = document.getElementById('bookingDetailsContent');
    
//     modalContent.innerHTML = `
//         <div class="row">
//             <div class="col-md-6">
//                 <h6>Booking Information</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Booking ID:</strong></td><td>${booking.bookingId}</td></tr>
//                     <tr><td><strong>Tour Package:</strong></td><td>${booking.tourName}</td></tr>
//                     <tr><td><strong>Status:</strong></td><td><span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span></td></tr>
//                     <tr><td><strong>Total Amount:</strong></td><td><strong>${formatCurrency(booking.payment.totalAmount)}</strong></td></tr>
//                 </table>
//             </div>
//             <div class="col-md-6">
//                 <h6>Customer Information</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Name:</strong></td><td>${booking.customer.name}</td></tr>
//                     <tr><td><strong>Email:</strong></td><td>${booking.customer.email}</td></tr>
//                     <tr><td><strong>Phone:</strong></td><td>${booking.customer.phone}</td></tr>
//                 </table>
//             </div>
//         </div>
        
//         <div class="row">
//             <div class="col-md-6">
//                 <h6>Trip Details</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Check-in:</strong></td><td>${formatDate(booking.tripDetails.checkIn)}</td></tr>
//                     <tr><td><strong>Check-out:</strong></td><td>${formatDate(booking.tripDetails.checkOut)}</td></tr>
//                     <tr><td><strong>Travelers:</strong></td><td>${booking.tripDetails.travelers}</td></tr>
//                     <tr><td><strong>Places:</strong></td><td>${booking.tripDetails.places ? booking.tripDetails.places.join(', ') : 'N/A'}</td></tr>
//                 </table>
//             </div>
//             <div class="col-md-6">
//                 <h6>Agent Information</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Agent:</strong></td><td>${booking.agent.name || 'Not assigned'}</td></tr>
//                     <tr><td><strong>Experience:</strong></td><td>${booking.agent.experience || 'N/A'}</td></tr>
//                     <tr><td><strong>Location:</strong></td><td>${booking.agent.location || 'N/A'}</td></tr>
//                 </table>
//             </div>
//         </div>
        
//         ${booking.specialRequests ? `
//         <div class="row">
//             <div class="col-12">
//                 <h6>Special Requests</h6>
//                 <p class="border p-3 bg-light">${booking.specialRequests}</p>
//             </div>
//         </div>
//         ` : ''}
//     `;
    
//     // Store current booking for actions
//     currentBookingForAction = booking.bookingId;
    
//     // Show modal
//     const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
//     modal.show();
// }

// async function handleBookingAction(bookingId, action) {
//     console.log(`Handling booking ${bookingId} with action: ${action}`);
    
//     // Validate inputs
//     if (!bookingId) {
//         console.error('No booking ID provided');
//         showAlert('Invalid booking ID', 'error');
//         return;
//     }
    
//     if (!action || !['accept', 'reject'].includes(action)) {
//         console.error('Invalid action:', action);
//         showAlert('Invalid action', 'error');
//         return;
//     }
    
//     const confirmMessage = action === 'accept' 
//         ? 'Are you sure you want to accept this booking?'
//         : 'Are you sure you want to reject this booking?';
        
//     if (!confirm(confirmMessage)) {
//         return;
//     }
    
//     // Get optional notes
//     const notes = prompt(action === 'accept' ? 'Add any notes for the customer (optional):' : 'Reason for rejection (optional):', '');
    
//     try {
//         console.log('Starting booking action process...');
        
//         // Check authentication token
//         const token = getAuthToken();
//         console.log('Auth token available:', !!token);
        
//         if (!token) {
//             showAlert('Authentication required. Please login again.', 'error');
//             setTimeout(() => {
//                 logout();
//             }, 2000);
//             return;
//         }
        
//         // Use the dedicated hotel booking handle endpoint
//         const apiUrl = `${HOTEL_DASHBOARD_API}/bookings/${bookingId}/handle`;
//         const requestBody = {
//             action: action,    // 'accept' or 'reject'
//             notes: notes || ''
//         };
        
//         console.log('Using correct API endpoint:', apiUrl);
//         console.log('Request body:', requestBody);
        
//         const response = await makeAPIRequest(apiUrl, {
//             method: 'PUT',
//             body: JSON.stringify(requestBody)
//         });
        
//         console.log('Hotel confirm API response:', response);
        
//         if (response && response.success) {
//             showAlert(response.message, 'success');
            
//             // Refresh views
//             const activeSection = document.querySelector('.content-section.active');
//             if (activeSection) {
//                 const sectionId = activeSection.id.replace('-section', '');
//                 console.log('Refreshing section:', sectionId);
//                 if (sectionId === 'requests') {
//                     await loadBookingRequests();
//                 } else if (sectionId === 'dashboard') {
//                     await loadDashboardData();
//                 }
//             }
//             // Always refresh history so processed requests appear there
//             await loadBookingHistory();
            
//             // Close modal
//             const modal = bootstrap.Modal.getInstance(document.getElementById('bookingDetailsModal'));
//             if (modal) modal.hide();
//         } else {
//             console.error('API returned failure:', response);
//             showAlert(response?.message || `Failed to ${action} booking`, 'error');
//         }
//     } catch (error) {
//         console.error(`Error ${action}ing booking:`, error);
//         showAlert(`Failed to ${action} booking: ${error.message}`, 'error');
//     }
// }

// // Setup modal event listeners
// document.addEventListener('DOMContentLoaded', function() {
//     const acceptBtn = document.getElementById('acceptBookingBtn');
//     const rejectBtn = document.getElementById('rejectBookingBtn');
    
//     if (acceptBtn) {
//         acceptBtn.addEventListener('click', () => {
//             if (currentBookingForAction) {
//                 handleBookingAction(currentBookingForAction, 'accept');
//             }
//         });
//     }
    
//     if (rejectBtn) {
//         rejectBtn.addEventListener('click', () => {
//             if (currentBookingForAction) {
//                 handleBookingAction(currentBookingForAction, 'reject');
//             }
//         });
//     }
// });

// // Room Management functions
// async function loadRoomTypes() {
//     console.log('Loading room types...');
    
//     if (!hotelData) {
//         await loadHotelProfile();
//     }
    
//     if (hotelData && hotelData.room_types) {
//         displayRoomTypes(hotelData.room_types);
//     }
// }

// function displayRoomTypes(roomTypes) {
//     const container = document.getElementById('roomTypesContainer');
    
//     if (!roomTypes || roomTypes.length === 0) {
//         container.innerHTML = '<div class="col-12"><p class="text-muted">No room types configured.</p></div>';
//         return;
//     }
    
//     const html = roomTypes.map((room, index) => `
//         <div class="col-md-6 col-lg-4 mb-4">
//             <div class="card">
//                 <div class="card-body">
//                     <h5 class="card-title">${room.type}</h5>
//                     <h4 class="text-primary">${formatCurrency(room.price_per_night || room.price || room.pricePerNight)}<small class="text-muted">/night</small></h4>
//                     <p class="card-text">
//                         <strong>Features:</strong><br>
//                         ${room.features ? room.features.join(', ') : 'Standard amenities'}
//                     </p>
//                     <button class="btn btn-outline-primary btn-sm" onclick="editRoom(${index})">
//                         <i class="fas fa-edit me-1"></i>Edit
//                     </button>
//                     <button class="btn btn-outline-danger btn-sm ms-2" onclick="deleteRoom(${index})">
//                         <i class="fas fa-trash me-1"></i>Delete
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `).join('');
    
//     container.innerHTML = html;
// }

// function addRoom() {
//     // Clear the form
//     document.getElementById('roomTypeForm').reset();
    
//     // Show modal
//     const modal = new bootstrap.Modal(document.getElementById('addRoomModal'));
//     modal.show();
// }

// async function saveRoom() {
//     const roomType = document.getElementById('roomType').value;
//     const pricePerNight = document.getElementById('pricePerNight').value;
//     const roomFeatures = document.getElementById('roomFeatures').value;
    
//     if (!roomType || !pricePerNight) {
//         showAlert('Please fill in all required fields', 'error');
//         return;
//     }
    
//     const newRoom = {
//         type: roomType,
//         price_per_night: String(sanitizePrice(pricePerNight)),
//         features: roomFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0)
//     };
    
//     try {
//         // Add room to current room types
//         const updatedRoomTypes = [...(hotelData.room_types || []), newRoom];
        
//         const userId = (currentUser && (currentUser.id || currentUser._id)) || localStorage.getItem('userId');
//         const response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${userId}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify({ room_types: updatedRoomTypes })
//             }
//         );
        
//         if (response && response.success) {
//             hotelData = response.data;
//             displayRoomTypes(hotelData.room_types);
            
//             // Hide modal
//             const modal = bootstrap.Modal.getInstance(document.getElementById('addRoomModal'));
//             modal.hide();
            
//             showAlert('Room type added successfully!', 'success');
//         }
//     } catch (error) {
//         console.error('Error adding room type:', error);
//         showAlert('Failed to add room type', 'error');
//     }
// }

// function editRoom(index) {
//     if (!hotelData || !hotelData.room_types[index]) {
//         showAlert('Room not found', 'error');
//         return;
//     }
    
// const room = hotelData.room_types[index];
    
//     // Populate form with existing data
//     document.getElementById('roomType').value = room.type;
//     document.getElementById('pricePerNight').value = sanitizePrice(room.price_per_night || room.price || room.pricePerNight);
//     document.getElementById('roomFeatures').value = room.features ? room.features.join(', ') : '';
    
//     // Change save button to update
//     const saveBtn = document.querySelector('#addRoomModal .btn-primary');
//     saveBtn.textContent = 'Update Room';
//     saveBtn.onclick = () => updateRoom(index);
    
//     // Show modal
//     const modal = new bootstrap.Modal(document.getElementById('addRoomModal'));
//     modal.show();
// }

// async function updateRoom(index) {
//     const roomType = document.getElementById('roomType').value;
//     const pricePerNight = document.getElementById('pricePerNight').value;
//     const roomFeatures = document.getElementById('roomFeatures').value;
    
//     if (!roomType || !pricePerNight) {
//         showAlert('Please fill in all required fields', 'error');
//         return;
//     }
    
// const updatedRoom = {
//         type: roomType,
//         price_per_night: String(sanitizePrice(pricePerNight)),
//         features: roomFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0)
//     };
    
//     try {
//         // Update room types array
//         const updatedRoomTypes = [...hotelData.room_types];
//         updatedRoomTypes[index] = updatedRoom;
        
//         const userId = (currentUser && (currentUser.id || currentUser._id)) || localStorage.getItem('userId');
//         const response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${userId}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify({ room_types: updatedRoomTypes })
//             }
//         );
        
//         if (response && response.success) {
//             hotelData = response.data;
//             displayRoomTypes(hotelData.room_types);
            
//             // Hide modal and reset button
//             const modal = bootstrap.Modal.getInstance(document.getElementById('addRoomModal'));
//             modal.hide();
            
//             const saveBtn = document.querySelector('#addRoomModal .btn-primary');
//             saveBtn.textContent = 'Save Room';
//             saveBtn.onclick = saveRoom;
            
//             showAlert('Room type updated successfully!', 'success');
//         }
//     } catch (error) {
//         console.error('Error updating room type:', error);
//         showAlert('Failed to update room type', 'error');
//     }
// }

// async function deleteRoom(index) {
//     if (!confirm('Are you sure you want to delete this room type?')) {
//         return;
//     }
    
//     try {
//         // Remove room from array
//         const updatedRoomTypes = hotelData.room_types.filter((_, i) => i !== index);
        
// const userId = (currentUser && (currentUser.id || currentUser._id)) || localStorage.getItem('userId');
//         const response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${userId}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify({ room_types: updatedRoomTypes })
//             }
//         );
        
//         if (response && response.success) {
//             hotelData = response.data;
//             displayRoomTypes(hotelData.room_types);
//             showAlert('Room type deleted successfully!', 'success');
//         }
//     } catch (error) {
//         console.error('Error deleting room type:', error);
//         showAlert('Failed to delete room type', 'error');
//     }
// }

// // Initialize dashboard
// document.addEventListener('DOMContentLoaded', async function() {
//     console.log('Hotel Dashboard initializing...');
    
//     // Check authentication
//     if (!isAuthenticated()) {
//         showAlert('Please login to access the dashboard', 'error');
//         setTimeout(() => {
//             window.location.href = 'sign in.html';
//         }, 2000);
//         return;
//     }
    
//     // Get user data
//     const userData = localStorage.getItem('user');
//     if (userData) {
//         currentUser = JSON.parse(userData);
//         // Normalize: ensure both .id and ._id are present (login may save either)
//         if (!currentUser.id && currentUser._id) currentUser.id = currentUser._id;
//         if (!currentUser._id && currentUser.id) currentUser._id = currentUser.id;
        
//         // Check if user is a hotel manager
//         if (currentUser.role !== 'hotel') {
//             showAlert('Access denied. This dashboard is for hotel managers only.', 'error');
//             setTimeout(() => {
//                 logout();
//             }, 3000);
//             return;
//         }
        
//         // Update welcome message
//         const welcomeElement = document.getElementById('userWelcome');
//         if (welcomeElement) {
//             welcomeElement.textContent = currentUser.fullName || 'Hotel Manager';
//         }
//     }
    
//     // Load initial dashboard data
//     await loadDashboardData();
    
//     console.log('Hotel Dashboard initialized successfully');
// });
// // Debug functions for troubleshooting
// window.debugBookingAction = async function(bookingId, action) {
//     console.log('=== BOOKING ACTION DEBUG ===');
//     console.log('Booking ID:', bookingId);
//     console.log('Action:', action);
//     console.log('Auth token:', getAuthToken() ? 'present' : 'missing');
//     console.log('Current user:', currentUser);
    
//     const testEndpoints = [
//         // Test GET first to see if booking exists
//         {
//             name: 'GET booking details',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}`,
//             method: 'GET'
//         },
//         // Test various update endpoints
//         {
//             name: 'PATCH bookingformsdata',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}`,
//             method: 'PATCH',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected',
//                 hotelNotes: 'Debug test'
//             }
//         },
//         {
//             name: 'PUT bookingformsdata',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}`,
//             method: 'PUT',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected'
//             }
//         },
//         {
//             name: 'Hotel confirm endpoint (CORRECT)',
//             url: `${API_BASE_URL}/bookingformsdata/hotel/confirm/${bookingId}`,
//             method: 'PUT',
//             body: { 
//                 confirmed: action === 'accept' ? true : false,
//                 notes: 'Debug test'
//             }
//         },
//         {
//             name: 'Update endpoint',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}/update`,
//             method: 'PUT',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected'
//             }
//         },
//         {
//             name: 'Bookings collection',
//             url: `${API_BASE_URL}/bookings/${bookingId}`,
//             method: 'PATCH',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected'
//             }
//         }
//     ];
    
//     for (const endpoint of testEndpoints) {
//         try {
//             console.log(`\n--- Testing ${endpoint.name} ---`);
//             console.log('URL:', endpoint.url);
//             console.log('Method:', endpoint.method);
            
//             const options = {
//                 method: endpoint.method,
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${getAuthToken()}`
//                 }
//             };
            
//             if (endpoint.body) {
//                 options.body = JSON.stringify(endpoint.body);
//                 console.log('Body:', endpoint.body);
//             }
            
//             const response = await fetch(endpoint.url, options);
//             console.log('Status:', response.status, response.statusText);
            
//             let data;
//             try {
//                 data = await response.json();
//                 console.log('Response:', data);
//             } catch {
//                 const text = await response.text();
//                 console.log('Raw response:', text);
//             }
            
//             if (response.ok) {
//                 console.log('✅ SUCCESS - This endpoint works!');
//                 break; // Stop testing if we find a working endpoint
//             } else {
//                 console.log('❌ FAILED');
//             }
            
//         } catch (error) {
//             console.log('❌ ERROR:', error.message);
//         }
//     }
    
//     console.log('=== END DEBUG ===');
// };

// window.testAuth = function() {
//     console.log('=== AUTH TEST ===');
//     console.log('authToken:', localStorage.getItem('authToken'));
//     console.log('token:', localStorage.getItem('token'));
//     console.log('user:', localStorage.getItem('user'));
//     console.log('Current user object:', currentUser);
//     console.log('getAuthToken():', getAuthToken());
//     console.log('isAuthenticated():', isAuthenticated());
//     console.log('=== END AUTH TEST ===');
// };

// // Expose necessary functions to global scope
// window.showSection = showSection;
// window.refreshDashboard = refreshDashboard;
// window.loadBookingRequests = loadBookingRequests;
// window.loadBookingHistory = loadBookingHistory;
// window.viewBookingDetails = viewBookingDetails;
// window.handleBookingAction = handleBookingAction;
// window.addRoom = addRoom;
// window.saveRoom = saveRoom;
// window.editRoom = editRoom;
// window.updateRoom = updateRoom;
// window.deleteRoom = deleteRoom;
// window.removeGalleryImage = removeGalleryImage;
// window.clearGallery = clearGallery;
// window.loadHotelProfile = loadHotelProfile;
// window.logout = logout;
// window.toggleMobileSidebar = toggleMobileSidebar;







// Hotel Dashboard JavaScript

// Configuration
// const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000/api';
// const HOTEL_DASHBOARD_API = `${API_BASE_URL}/hoteldashboard`;

// const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23e9ecef'/%3E%3Ctext x='150' y='90' font-family='Arial' font-size='14' fill='%236c757d' text-anchor='middle'%3E%3Ctspan x='150' dy='0'%3E%F0%9F%8F%A8%3C/tspan%3E%3Ctspan x='150' dy='25'%3EHotel Image%3C/tspan%3E%3C/text%3E%3C/svg%3E";

// // Global variables
// let currentUser = null;
// let hotelData = null;
// let currentBookingForAction = null;
// let galleryImages = []; // Store gallery images

// // Authentication functions
// function getAuthToken() {
//     const authToken = localStorage.getItem('authToken');
//     const regularToken = localStorage.getItem('token');
//     const token = authToken || regularToken;
    
//     console.log('Token check:', {
//         authToken: authToken ? 'present' : 'missing',
//         regularToken: regularToken ? 'present' : 'missing',
//         using: token ? 'found token' : 'no token'
//     });
    
//     return token;
// }

// function isAuthenticated() {
//     const token = getAuthToken();
//     return token !== null;
// }

// function logout() {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     localStorage.removeItem('userRole');
//     localStorage.removeItem('userEmail');
//     localStorage.removeItem('userId');
//     window.location.href = 'sign in.html';
// }

// // API request function with error handling
// async function makeAPIRequest(url, options = {}) {
//     const token = getAuthToken();
    
//     if (!token) {
//         console.error('No authentication token available');
//         showAlert('Authentication required. Please login again.', 'error');
//         logout();
//         return null;
//     }
    
//     const defaultOptions = {
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//             ...options.headers
//         }
//     };

//     const mergedOptions = { ...defaultOptions, ...options };

//     try {
//         showLoading(true);
//         console.log(`Making API request to: ${url}`);
//         console.log('Request options:', {
//             method: mergedOptions.method || 'GET',
//             headers: mergedOptions.headers,
//             body: mergedOptions.body ? 'present' : 'none'
//         });
        
//         const response = await fetch(url, mergedOptions);
//         console.log('Raw response status:', response.status, response.statusText);
        
//         let data;
//         const contentType = response.headers.get('content-type');
        
//         if (contentType && contentType.includes('application/json')) {
//             data = await response.json();
//         } else {
//             const textData = await response.text();
//             console.log('Non-JSON response:', textData);
//             try {
//                 data = JSON.parse(textData);
//             } catch {
//                 data = { message: textData, status: response.status };
//             }
//         }

//         console.log('Parsed response data:', data);

//         if (!response.ok) {
//             if (response.status === 401) {
//                 showAlert('Session expired. Please login again.', 'error');
//                 logout();
//                 return null;
//             }
            
//             const errorMessage = data?.message || `HTTP ${response.status}: ${response.statusText}`;
//             console.error('API Error Response:', errorMessage);
//             throw new Error(errorMessage);
//         }

//         return data;
//     } catch (error) {
//         console.error('API Request Error:', error);
        
//         // Don't show alerts for expected errors (they're handled by caller)
//         if (!error.message.includes('Session expired')) {
//             console.error('Detailed error info:', {
//                 url,
//                 method: options.method || 'GET',
//                 error: error.message
//             });
//         }
        
//         throw error; // Re-throw so caller can handle
//     } finally {
//         showLoading(false);
//     }
// }

// // Utility functions
// function showLoading(show) {
//     const loader = document.getElementById('loading');
//     if (loader) {
//         loader.style.display = show ? 'block' : 'none';
//     }
// }

// function showAlert(message, type = 'info') {
//     // Create alert element
//     const alertDiv = document.createElement('div');
//     alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
//     alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
//     alertDiv.innerHTML = `
//         <strong>${type === 'error' ? 'Error!' : type === 'success' ? 'Success!' : 'Info!'}</strong> ${message}
//         <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
//     `;
    
//     document.body.appendChild(alertDiv);
    
//     // Auto remove after 5 seconds
//     setTimeout(() => {
//         if (alertDiv.parentNode) {
//             alertDiv.parentNode.removeChild(alertDiv);
//         }
//     }, 5000);
// }

// function formatDate(dateString) {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//     });
// }

// function formatDateTime(dateString) {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-IN', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//     });
// }

// function sanitizePrice(value) {
//     // Accept numbers or strings like "3000", "₹3000", "3,000", etc.
//     if (value === null || value === undefined || value === '') return 0;
//     if (typeof value === 'number') return isNaN(value) ? 0 : value;
//     const cleaned = String(value).replace(/[^0-9.]/g, '');
//     const num = Number(cleaned);
//     return isNaN(num) ? 0 : num;
// }

// function formatCurrency(amount) {
//     const num = sanitizePrice(amount);
//     return `₹${num.toLocaleString('en-IN')}`;
// }

// // Mobile sidebar toggle
// function toggleMobileSidebar() {
//     const sidebar = document.querySelector('.sidebar');
//     const overlay = document.getElementById('sidebarOverlay');
//     sidebar.classList.toggle('show');
//     overlay.classList.toggle('show');
// }

// // Section navigation
// function showSection(sectionName) {
//     console.log(`Showing section: ${sectionName}`);
    
//     // Close mobile sidebar if open
//     const sidebar = document.querySelector('.sidebar');
//     const overlay = document.getElementById('sidebarOverlay');
//     if (sidebar && sidebar.classList.contains('show')) {
//         sidebar.classList.remove('show');
//         overlay && overlay.classList.remove('show');
//     }
    
//     // Hide all sections
//     document.querySelectorAll('.content-section').forEach(section => {
//         section.classList.remove('active');
//     });
    
//     // Remove active class from all nav links
//     document.querySelectorAll('.sidebar .nav-link').forEach(link => {
//         link.classList.remove('active');
//     });
    
//     // Show selected section
//     const targetSection = document.getElementById(`${sectionName}-section`);
//     if (targetSection) {
//         targetSection.classList.add('active');
//     }
    
//     // Add active class to clicked nav link
//     document.querySelectorAll('.sidebar .nav-link').forEach(link => {
//         if (link.onclick && link.onclick.toString().includes(sectionName)) {
//             link.classList.add('active');
//         }
//     });
    
//     // Load data for specific sections
//     switch (sectionName) {
//         case 'dashboard':
//             loadDashboardData();
//             break;
//         case 'profile':
//             console.log('Loading profile section...');
//             loadHotelProfile();
//             break;
//         case 'requests':
//             loadBookingRequests();
//             break;
//         case 'history':
//             loadBookingHistory();
//             break;
//         case 'rooms':
//             loadRoomTypes();
//             break;
//     }
// }

// // Dashboard functions
// async function loadDashboardData() {
//     console.log('Loading dashboard data...');
    
//     try {
//         // Use the dedicated stats endpoint — it already filters by hotel correctly
//         const statsResponse = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/stats`);
        
//         if (statsResponse && statsResponse.success) {
//             updateDashboardStats(statsResponse.stats);
//             updateRequestsCount(statsResponse.stats.pendingRequests);
//         }
        
//         // Load recent pending booking requests for the dashboard preview
//         const requestsResponse = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/bookings/requests`);
        
//         if (requestsResponse && requestsResponse.success) {
//             const recentBookings = (requestsResponse.requests || []).slice(0, 5).map(booking => ({
//                 bookingId: booking.bookingId || booking._id,
//                 customer: {
//                     name: booking.customer?.name || 'Unknown'
//                 },
//                 tripDetails: {
//                     travelers: booking.tripDetails?.travelers || 1
//                 },
//                 payment: {
//                     totalAmount: booking.payment?.totalAmount || 0
//                 },
//                 status: booking.status || 'pending',
//                 requestedAt: booking.requestedAt || new Date()
//             }));
//             displayRecentBookings(recentBookings);
//         } else {
//             displayRecentBookings([]);
//         }
        
//     } catch (error) {
//         console.error('Error loading dashboard data:', error);
//         showAlert('Failed to load dashboard data', 'error');
//     }
// }

// function updateDashboardStats(stats) {
//     document.getElementById('totalBookings').textContent = stats.totalBookings || 0;
//     document.getElementById('pendingRequests').textContent = stats.pendingRequests || 0;
//     document.getElementById('confirmedBookings').textContent = stats.confirmedBookings || 0;
//     document.getElementById('totalRevenue').textContent = stats.totalRevenue
//         ? Number(stats.totalRevenue).toLocaleString('en-IN') : '0';
// }

// function updateRequestsCount(count) {
//     const badge = document.getElementById('requestsCount');
//     if (badge) {
//         badge.textContent = count || 0;
//     }
// }

// function displayRecentBookings(bookings) {
//     const container = document.getElementById('recentBookings');
    
//     if (!bookings || bookings.length === 0) {
//         container.innerHTML = '<p class="text-muted">No recent booking requests.</p>';
//         return;
//     }
    
//     const html = bookings.map(booking => `
//         <div class="border-bottom py-3">
//             <div class="row align-items-center">
//                 <div class="col-md-3">
//                     <strong>${booking.bookingId}</strong>
//                     <br><small class="text-muted">${booking.customer.name}</small>
//                 </div>
//                 <div class="col-md-3">
//                     <span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span>
//                     <br><small class="text-muted">${formatDate(booking.requestedAt)}</small>
//                 </div>
//                 <div class="col-md-3">
//                     <strong>${formatCurrency(booking.payment.totalAmount)}</strong>
//                     <br><small class="text-muted">${booking.tripDetails.travelers} travelers</small>
//                 </div>
//                 <div class="col-md-3 text-end">
//                     <button class="btn btn-sm btn-outline-primary" onclick="viewBookingDetails('${booking.bookingId}')">
//                         <i class="fas fa-eye me-1"></i>View
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `).join('');
    
//     container.innerHTML = html;
// }

// function getStatusColor(status) {
//     const statusColors = {
//         'pending': 'warning',
//         'agent_confirmed': 'info',
//         'hotel_confirmed': 'primary',
//         'hotel_accepted': 'primary',
//         'hotel_rejected': 'danger',
//         'confirmed': 'success',
//         'cancelled': 'danger',
//         'completed': 'success',
//         'payment_complete': 'success'
//     };
//     return statusColors[status] || 'secondary';
// }

// async function refreshDashboard() {
//     await loadDashboardData();
//     showAlert('Dashboard refreshed successfully!', 'success');
// }

// // Hotel Profile functions
// function createDummyHotelData() {
//     // Create dummy hotel data for first-time setup
//     hotelData = {
//         _id: null, // Flag to indicate this is a new hotel profile
//         manager_email: currentUser.email,
//         hotel_details: {
//             hotel_name: 'Enter Hotel Name',
//             description: 'Enter hotel description here...',
//             contact: 'Enter contact number',
//             location: {
//                 district: 'Enter district',
//                 pincode: 380001
//             },
//             check_in_time: '14:00',
//             check_out_time: '12:00',
//             amenities: []
//         },
//         rooms: [],
//         gallery: [],
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//     };
    
//     console.log('Created dummy hotel data for first-time setup:', hotelData);
    
//     // Populate the form with dummy data
//     populateProfileForm(hotelData);
//     updateProfileStatus('new');
//     showAlert('Welcome! Please fill in your hotel details to create your profile.', 'info');
// }

// async function loadHotelProfile() {
//     console.log('Loading hotel profile...');
    
//     try {
//         // Show loading states
//         updateProfileStatus('loading');
//         showLoading(true);
        
//         // Get current user data first to ensure we have user info
//         const userData = localStorage.getItem('user');
//         if (userData) {
//             currentUser = JSON.parse(userData);
//             // Normalize: ensure both .id and ._id are present
//             if (!currentUser.id && currentUser._id) currentUser.id = currentUser._id;
//             if (!currentUser._id && currentUser.id) currentUser._id = currentUser.id;
//             console.log('Current user loaded:', currentUser);
//         }
        
//         if (!currentUser || !currentUser.id) {
//             throw new Error('User not properly authenticated. Please login again.');
//         }
        
//         // 🔧 SIMPLIFIED: Use the /me endpoint which handles all the complex logic
//         console.log('🔍 Fetching hotel profile using /me endpoint for user:', currentUser.email);
        
//         let response = null;
        
//         try {
//             // Use the /me endpoint that handles all the relationship logic
//             response = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/me`);
            
//             if (response && response.success && response.data) {
//                 console.log('✅ Successfully loaded hotel data via /me endpoint');
//             }
//         } catch (error) {
//             console.log('❌ Failed to load hotel via /me endpoint:', error.message);
//             // The /me endpoint will automatically create a hotel if none exists
//             // So if this fails, it's a real error
//             throw error;
//         }
        
//         console.log('Final hotel profile response:', response);
        
//         if (response && response.success && response.data) {
//             hotelData = response.data;
//             console.log('✅ Hotel data loaded successfully:', {
//                 hotelId: hotelData._id,
//                 hotelName: hotelData.hotel_details?.hotel_name,
//                 managerId: hotelData.manager_id,
//                 managerEmail: hotelData.manager_email
//             });
            
//             // The backend guarantees we have hotel data at this point
//             populateProfileForm(hotelData);
//             updateProfileStatus('loaded');
//             showAlert('Hotel profile loaded successfully!', 'success');
//         } else {
//             // This should not happen with the new backend logic
//             throw new Error('Unexpected: No hotel data returned from /me endpoint');
//         }
//     } catch (error) {
//         console.error('❌ Error loading hotel profile:', error);
//         updateProfileStatus('error');
        
//         let errorMessage = 'Failed to load hotel profile';
//         if (error.message.includes('401')) {
//             errorMessage = 'Authentication required. Please login again.';
//         } else if (error.message.includes('403')) {
//             errorMessage = 'Access denied. You must be a hotel manager to access this page.';
//         } else {
//             errorMessage += ': ' + error.message;
//         }
        
//         showAlert(errorMessage, 'error');
        
//         // For authentication errors, redirect to login
//         if (error.message.includes('401') || error.message.includes('403')) {
//             setTimeout(() => {
//                 logout();
//             }, 3000);
//         }
//     } finally {
//         showLoading(false);
//     }
// }

// // Initialize empty profile form when no data exists
// function initializeEmptyProfile() {
//     console.log('Initializing empty hotel profile form...');
    
//     // Clear all form fields
//     document.getElementById('hotelName').value = '';
//     document.getElementById('contact').value = '';
//     document.getElementById('district').value = '';
//     document.getElementById('pincode').value = '';
//     document.getElementById('checkInTime').value = '14:00';
//     document.getElementById('checkOutTime').value = '11:00';
//     document.getElementById('description').value = '';
//     document.getElementById('amenities').value = '';
    
//     // Reset main image to placeholder
//     document.getElementById('hotelImage').src = PLACEHOLDER_IMAGE;
//     document.getElementById('hotelImage').dataset.changed = 'false';
    
//     // Clear gallery
//     galleryImages = [];
//     displayGalleryImages();
    
//     // Update status
//     updateProfileStatus('empty');
    
//     console.log('Empty profile form initialized');
// }

// // Show message when hotel manager has no associated hotel
// function showNoHotelMessage() {
//     console.log('Displaying no hotel message...');
    
//     // Clear the form area and show message
//     const formContainer = document.getElementById('hotelProfileForm');
//     if (formContainer) {
//         formContainer.innerHTML = `
//             <div class="text-center py-5">
//                 <div class="mb-4">
//                     <i class="fas fa-hotel fa-4x text-muted mb-3"></i>
//                     <h3 class="text-muted">No Hotel Profile Found</h3>
//                     <p class="text-muted mb-4">Your account is not currently associated with any hotel.<br>
//                     Please contact support to get your hotel profile set up.</p>
//                 </div>
//                 <div class="alert alert-info">
//                     <h5 class="alert-heading"><i class="fas fa-info-circle me-2"></i>For Hotel Managers</h5>
//                     <p class="mb-0">If you are a hotel manager, please contact the system administrator to:</p>
//                     <ul class="text-start mt-2 mb-0">
//                         <li>Create your hotel profile in the system</li>
//                         <li>Associate your manager account with your hotel</li>
//                         <li>Set up proper permissions for managing bookings</li>
//                     </ul>
//                 </div>
//                 <button class="btn btn-primary mt-3" onclick="location.reload()">
//                     <i class="fas fa-refresh me-2"></i>Refresh Page
//                 </button>
//                 <button class="btn btn-secondary mt-3 ms-2" onclick="logout()">
//                     <i class="fas fa-sign-out-alt me-2"></i>Logout
//                 </button>
//             </div>
//         `;
//     }
// }

// function populateProfileForm(data) {
//     console.log('Populating profile form with data:', data);
    
//     if (!data || !data.hotel_details) {
//         console.warn('No hotel details found in data');
//         initializeEmptyProfile();
//         return;
//     }
    
//     const { hotel_details, room_types, image, gallery } = data;
    
//     try {
//         // Populate hotel details with safe access
//         const hotelNameField = document.getElementById('hotelName');
//         const contactField = document.getElementById('contact');
//         const districtField = document.getElementById('district');
//         const pincodeField = document.getElementById('pincode');
//         const checkInField = document.getElementById('checkInTime');
//         const checkOutField = document.getElementById('checkOutTime');
//         const descriptionField = document.getElementById('description');
//         const amenitiesField = document.getElementById('amenities');
        
//         if (hotelNameField) hotelNameField.value = hotel_details.hotel_name || '';
//         if (contactField) contactField.value = hotel_details.contact || '';
//         if (districtField) districtField.value = hotel_details.location?.district || '';
//         if (pincodeField) pincodeField.value = hotel_details.location?.pincode || '';
//         if (checkInField) checkInField.value = hotel_details.check_in_time || '14:00';
//         if (checkOutField) checkOutField.value = hotel_details.check_out_time || '11:00';
//         if (descriptionField) descriptionField.value = hotel_details.description || '';
//         if (amenitiesField) {
//             amenitiesField.value = hotel_details.amenities && Array.isArray(hotel_details.amenities) 
//                 ? hotel_details.amenities.join(', ') 
//                 : '';
//         }
        
//         // Set hotel main image
//         const imageElement = document.getElementById('hotelImage');
//         if (imageElement) {
//             if (image && image.base64) {
//                 imageElement.src = `data:image/jpeg;base64,${image.base64}`;
//                 console.log('Main hotel image loaded');
//             } else {
//                 imageElement.src = PLACEHOLDER_IMAGE;
//             }
//             imageElement.dataset.changed = 'false'; // Reset changed flag
//         }
        
//         // Load gallery images
//         if (gallery && Array.isArray(gallery) && gallery.length > 0) {
//             galleryImages = gallery.map((img, index) => ({
//                 base64: img.base64,
//                 id: img.id || `gallery_${Date.now()}_${index}`
//             }));
//             console.log(`Loaded ${galleryImages.length} gallery images`);
//         } else {
//             galleryImages = [];
//             console.log('No gallery images found');
//         }
        
//         // Display gallery images
//         displayGalleryImages();
        
//         console.log('Hotel profile form successfully populated');
        
//         // Show data summary
//         console.log('Profile Summary:', {
//             hotelName: hotel_details.hotel_name,
//             district: hotel_details.location?.district,
//             hasMainImage: !!(image && image.base64),
//             galleryCount: galleryImages.length,
//             amenitiesCount: hotel_details.amenities?.length || 0
//         });
        
//     } catch (error) {
//         console.error('Error populating profile form:', error);
//         showAlert('Error displaying hotel profile data', 'error');
//     }
// }

// // Update profile status indicator
// function updateProfileStatus(status, message = '') {
//     const statusElement = document.getElementById('profileStatus');
//     if (!statusElement) return;
    
//     statusElement.className = 'badge'; // Reset classes
    
//     switch (status) {
//         case 'loading':
//             statusElement.classList.add('bg-secondary');
//             statusElement.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Loading...';
//             break;
//         case 'loaded':
//             statusElement.classList.add('bg-success');
//             statusElement.innerHTML = '<i class="fas fa-check me-1"></i>Profile Loaded';
//             break;
//         case 'empty':
//             statusElement.classList.add('bg-warning');
//             statusElement.innerHTML = '<i class="fas fa-plus me-1"></i>Setup Required';
//             break;
//         case 'new':
//             statusElement.classList.add('bg-info');
//             statusElement.innerHTML = '<i class="fas fa-star me-1"></i>New Profile Setup';
//             break;
//         case 'error':
//             statusElement.classList.add('bg-danger');
//             statusElement.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>Error';
//             break;
//         case 'saving':
//             statusElement.classList.add('bg-info');
//             statusElement.innerHTML = '<i class="fas fa-save fa-spin me-1"></i>Saving...';
//             break;
//         case 'saved':
//             statusElement.classList.add('bg-success');
//             statusElement.innerHTML = '<i class="fas fa-check me-1"></i>Saved Successfully';
//             setTimeout(() => updateProfileStatus('loaded'), 3000);
//             break;
//         case 'not_found':
//             statusElement.classList.add('bg-warning');
//             statusElement.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>No Hotel Profile';
//             break;
//         default:
//             statusElement.classList.add('bg-secondary');
//             statusElement.textContent = message || status;
//     }
// }

// // Handle profile form submission
// document.addEventListener('DOMContentLoaded', function() {
//     const profileForm = document.getElementById('hotelProfileForm');
//     if (profileForm) {
//         profileForm.addEventListener('submit', async function(e) {
//             e.preventDefault();
//             await updateHotelProfile();
//         });
//     }
    
//     // Handle main image upload
//     const imageUpload = document.getElementById('imageUpload');
//     if (imageUpload) {
//         imageUpload.addEventListener('change', handleImageUpload);
//     }
    
//     // Handle gallery images upload
//     const galleryUpload = document.getElementById('galleryUpload');
//     if (galleryUpload) {
//         galleryUpload.addEventListener('change', handleGalleryUpload);
//     }
// });

// async function updateHotelProfile() {
//     console.log('Updating hotel profile...');
    
//     try {
//         // Validate required fields
//         const hotelName = document.getElementById('hotelName').value.trim();
//         const district = document.getElementById('district').value.trim();
        
//         if (!hotelName || !district) {
//             showAlert('Please fill in required fields: Hotel Name and District', 'error');
//             return;
//         }
        
//         // Show saving status
//         updateProfileStatus('saving');
        
//         const formData = {
//             hotel_details: {
//                 hotel_name: hotelName,
//                 contact: document.getElementById('contact').value,
//                 location: {
//                     district: district,
//                     pincode: parseInt(document.getElementById('pincode').value) || 0
//                 },
//                 check_in_time: document.getElementById('checkInTime').value || '14:00',
//                 check_out_time: document.getElementById('checkOutTime').value || '11:00',
//                 description: document.getElementById('description').value,
//                 amenities: document.getElementById('amenities').value
//                     .split(',')
//                     .map(item => item.trim())
//                     .filter(item => item.length > 0)
//             }
//         };
        
//         // Add main image if changed
//         const imageElement = document.getElementById('hotelImage');
//         if (imageElement.dataset.changed === 'true') {
//             formData.image = {
//                 base64: imageElement.src.split(',')[1] // Remove data:image/jpeg;base64, prefix
//             };
//         }
        
//         // Add gallery images
//         if (galleryImages.length > 0) {
//             formData.gallery = galleryImages.map(img => ({
//                 base64: img.base64,
//                 id: img.id
//             }));
//         } else {
//             formData.gallery = []; // Clear gallery if no images
//         }
        
//         console.log('Sending update request with data:', {
//             hotelName: formData.hotel_details.hotel_name,
//             district: formData.hotel_details.location.district,
//             hasMainImage: !!formData.image,
//             galleryCount: formData.gallery.length
//         });
        
//         // Ensure we have currentUser before proceeding
//         if (!currentUser || !currentUser.id) {
//             throw new Error('User not properly authenticated. Please login again.');
//         }
        
//         let response;
        
//         // 🔧 SIMPLIFIED: Always use the existing update endpoint since backend handles creation
//         // The /me endpoint guarantees we have a hotel profile at this point
//         if (!hotelData || !hotelData._id) {
//             throw new Error('No hotel profile loaded. Please refresh the page and try again.');
//         }
        
//         console.log('🔄 Updating existing hotel profile:', hotelData._id);
        
//         // Use the proper update endpoint with user ID (not hotel ID)
//         response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${currentUser.id}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify(formData)
//             }
//         );
        
//         if (response && response.success) {
//             // Update hotelData with the response data
//             hotelData = response.data;
            
//             updateProfileStatus('saved');
//             showAlert('Hotel profile updated successfully!', 'success');
//             console.log('✅ Hotel profile updated successfully');
            
//             // Reset image changed flag
//             if (imageElement) {
//                 imageElement.dataset.changed = 'false';
//             }
            
//         } else {
//             throw new Error(response?.message || 'Update failed');
//         }
        
//     } catch (error) {
//         console.error('Error updating hotel profile:', error);
//         updateProfileStatus('error');
//         showAlert('Failed to update hotel profile: ' + error.message, 'error');
//     }
// }

// function handleImageUpload(event) {
//     const file = event.target.files[0];
//     if (file) {
//         if (file.size > 5 * 1024 * 1024) { // 5MB limit
//             showAlert('Image size should be less than 5MB', 'error');
//             return;
//         }
        
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const imageElement = document.getElementById('hotelImage');
//             imageElement.src = e.target.result;
//             imageElement.dataset.changed = 'true';
//         };
//         reader.readAsDataURL(file);
//     }
// }

// // Gallery Image Management Functions
// function handleGalleryUpload(event) {
//     const files = Array.from(event.target.files);
    
//     if (galleryImages.length + files.length > 5) {
//         showAlert('Maximum 5 gallery images allowed', 'error');
//         return;
//     }
    
//     files.forEach(file => {
//         if (file.size > 5 * 1024 * 1024) { // 5MB limit per image
//             showAlert(`Image ${file.name} is too large. Maximum size is 5MB`, 'error');
//             return;
//         }
        
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             const imageData = {
//                 base64: e.target.result.split(',')[1], // Remove data:image/jpeg;base64, prefix
//                 id: Date.now() + Math.random(),
//                 name: file.name
//             };
            
//             galleryImages.push(imageData);
//             displayGalleryImages();
//         };
//         reader.readAsDataURL(file);
//     });
    
//     // Clear the input
//     event.target.value = '';
// }

// function displayGalleryImages() {
//     const container = document.getElementById('galleryPreview');
    
//     if (galleryImages.length === 0) {
//         container.innerHTML = `
//             <div class="col-12">
//                 <div class="gallery-placeholder">
//                     <i class="fas fa-images fa-2x mb-2"></i>
//                     <p class="mb-0">No gallery images uploaded</p>
//                 </div>
//             </div>
//         `;
//         return;
//     }
    
//     const html = galleryImages.map((image, index) => `
//         <div class="col-6 col-md-4">
//             <div class="gallery-item">
//                 <img src="data:image/jpeg;base64,${image.base64}" alt="Gallery Image ${index + 1}">
//                 <button type="button" class="remove-btn" onclick="removeGalleryImage(${index})" title="Remove Image">
//                     <i class="fas fa-times"></i>
//                 </button>
//             </div>
//         </div>
//     `).join('');
    
//     container.innerHTML = html;
// }

// function removeGalleryImage(index) {
//     if (index >= 0 && index < galleryImages.length) {
//         galleryImages.splice(index, 1);
//         displayGalleryImages();
//         showAlert('Gallery image removed', 'success');
//     }
// }

// function clearGallery() {
//     galleryImages = [];
//     displayGalleryImages();
//     showAlert('All gallery images removed', 'success');
// }

// // Booking Requests functions
// async function loadBookingRequests() {
//     console.log('Loading booking requests...');
    
//     try {
//         // Use the dedicated hotel booking requests endpoint
//         const response = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/bookings/requests`);
        
//         if (response && response.success) {
//             const requests = response.requests || [];
//             displayBookingRequests(requests);
//             updateRequestsCount(requests.length);
//         } else {
//             displayBookingRequests([]);
//             updateRequestsCount(0);
//         }
//     } catch (error) {
//         console.error('Error loading booking requests:', error);
//         showAlert('Failed to load booking requests', 'error');
//     }
// }

// function displayBookingRequests(requests) {
//     const tbody = document.getElementById('bookingRequestsTable');
    
//     if (!requests || requests.length === 0) {
//         tbody.innerHTML = '<tr><td colspan="9" class="text-center">No pending booking requests.</td></tr>';
//         return;
//     }
    
//     const html = requests.map(request => `
//         <tr>
//             <td><strong>${request.bookingId || request._id || 'N/A'}</strong></td>
//             <td>
//                 <strong>${request.customer?.name || 'Unknown'}</strong><br>
//                 <small class="text-muted">${request.customer?.email || ''}</small>
//             </td>
//             <td>${request.tourName || 'Tour Package'}</td>
//             <td>${formatDate(request.tripDetails?.checkIn)}</td>
//             <td>${formatDate(request.tripDetails?.checkOut)}</td>
//             <td>${request.tripDetails?.travelers || 1}</td>
//             <td><strong>${formatCurrency(request.payment?.totalAmount || 0)}</strong></td>
//             <td><span class="badge bg-${getStatusColor(request.status)}">${request.status || 'pending'}</span></td>
//             <td>
//                 <div class="btn-group" role="group">
//                     <button class="btn btn-sm btn-outline-info" onclick="viewBookingDetails('${request.bookingId || request._id}')">
//                         <i class="fas fa-eye"></i>
//                     </button>
//                     <button class="btn btn-sm btn-success" onclick="handleBookingAction('${request.bookingId || request._id}', 'accept')">
//                         <i class="fas fa-check"></i>
//                     </button>
//                     <button class="btn btn-sm btn-danger" onclick="handleBookingAction('${request.bookingId || request._id}', 'reject')">
//                         <i class="fas fa-times"></i>
//                     </button>
//                 </div>
//             </td>
//         </tr>
//     `).join('');
    
//     tbody.innerHTML = html;
// }

// // Booking History functions
// async function loadBookingHistory() {
//     console.log('Loading booking history...');
    
//     try {
//         const response = await makeAPIRequest(`${HOTEL_DASHBOARD_API}/bookings/history`);
//         if (response && response.success) {
//             displayBookingHistory(response.history);
//         }
//     } catch (error) {
//         console.error('Error loading booking history:', error);
//         showAlert('Failed to load booking history', 'error');
//     }
// }

// function displayBookingHistory(history) {
//     const tbody = document.getElementById('bookingHistoryTable');
    
//     if (!history || history.length === 0) {
//         tbody.innerHTML = '<tr><td colspan="9" class="text-center">No booking history available.</td></tr>';
//         return;
//     }
    
//     const html = history.map(booking => `
//         <tr>
//             <td><strong>${booking.bookingId}</strong></td>
//             <td>${booking.customer}</td>
//             <td>${booking.tourName}</td>
//             <td>${formatDate(booking.checkInDate)}</td>
//             <td>${formatDate(booking.checkOutDate)}</td>
//             <td>${booking.travelers}</td>
//             <td><strong>${formatCurrency(booking.amount)}</strong></td>
//             <td><span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span></td>
//             <td>${formatDateTime(booking.confirmedAt)}</td>
//         </tr>
//     `).join('');
    
//     tbody.innerHTML = html;
// }

// // Booking action functions
// async function viewBookingDetails(bookingId) {
//     console.log(`Viewing booking details for: ${bookingId}`);
    
//     try {
//         // Get specific booking details from bookingformsdatas collection
//         const response = await makeAPIRequest(`${API_BASE_URL}/bookingformsdata/${bookingId}`);
//         console.log('Booking details response:', response);
        
//         if (response && (response.success || response._id)) {
//             // Handle different response formats
//             const bookingData = response.success ? response.data : response;
            
//             // Convert to expected format for modal
//             const formattedBooking = {
//                 bookingId: bookingData._id,
//                 tourName: 'Custom Tour Package',
//                 status: bookingData.status || 'pending',
//                 customer: {
//                     name: bookingData.user?.fullName || bookingData.tourist?.name || 'Unknown',
//                     email: bookingData.user?.email || bookingData.tourist?.email || '',
//                     phone: bookingData.user?.phone || bookingData.tourist?.phone || ''
//                 },
//                 tripDetails: {
//                     checkIn: bookingData.hotel?.fromDate || bookingData.hotel?.checkIn,
//                     checkOut: bookingData.hotel?.toDate || bookingData.hotel?.checkOut,
//                     travelers: bookingData.tourist?.totalTravellers || 1,
//                     places: bookingData.touristPlaces || []
//                 },
//                 payment: {
//                     totalAmount: bookingData.totalAmount || 0
//                 },
//                 agent: {
//                     name: bookingData.agent?.name || bookingData.selectedAgent?.name || '',
//                     experience: bookingData.agent?.experience || bookingData.selectedAgent?.experience || '',
//                     location: bookingData.agent?.location || bookingData.selectedAgent?.location || ''
//                 },
//                 specialRequests: bookingData.specialRequests || ''
//             };
            
//             showBookingDetailsModal(formattedBooking);
//         } else {
//             showAlert('Booking not found', 'error');
//         }
//     } catch (error) {
//         console.error('Error loading booking details:', error);
//         showAlert('Failed to load booking details: ' + error.message, 'error');
//     }
// }

// function showBookingDetailsModal(booking) {
//     const modalContent = document.getElementById('bookingDetailsContent');
    
//     modalContent.innerHTML = `
//         <div class="row">
//             <div class="col-md-6">
//                 <h6>Booking Information</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Booking ID:</strong></td><td>${booking.bookingId}</td></tr>
//                     <tr><td><strong>Tour Package:</strong></td><td>${booking.tourName}</td></tr>
//                     <tr><td><strong>Status:</strong></td><td><span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span></td></tr>
//                     <tr><td><strong>Total Amount:</strong></td><td><strong>${formatCurrency(booking.payment.totalAmount)}</strong></td></tr>
//                 </table>
//             </div>
//             <div class="col-md-6">
//                 <h6>Customer Information</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Name:</strong></td><td>${booking.customer.name}</td></tr>
//                     <tr><td><strong>Email:</strong></td><td>${booking.customer.email}</td></tr>
//                     <tr><td><strong>Phone:</strong></td><td>${booking.customer.phone}</td></tr>
//                 </table>
//             </div>
//         </div>
        
//         <div class="row">
//             <div class="col-md-6">
//                 <h6>Trip Details</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Check-in:</strong></td><td>${formatDate(booking.tripDetails.checkIn)}</td></tr>
//                     <tr><td><strong>Check-out:</strong></td><td>${formatDate(booking.tripDetails.checkOut)}</td></tr>
//                     <tr><td><strong>Travelers:</strong></td><td>${booking.tripDetails.travelers}</td></tr>
//                     <tr><td><strong>Places:</strong></td><td>${booking.tripDetails.places ? booking.tripDetails.places.join(', ') : 'N/A'}</td></tr>
//                 </table>
//             </div>
//             <div class="col-md-6">
//                 <h6>Agent Information</h6>
//                 <table class="table table-borderless">
//                     <tr><td><strong>Agent:</strong></td><td>${booking.agent.name || 'Not assigned'}</td></tr>
//                     <tr><td><strong>Experience:</strong></td><td>${booking.agent.experience || 'N/A'}</td></tr>
//                     <tr><td><strong>Location:</strong></td><td>${booking.agent.location || 'N/A'}</td></tr>
//                 </table>
//             </div>
//         </div>
        
//         ${booking.specialRequests ? `
//         <div class="row">
//             <div class="col-12">
//                 <h6>Special Requests</h6>
//                 <p class="border p-3 bg-light">${booking.specialRequests}</p>
//             </div>
//         </div>
//         ` : ''}
//     `;
    
//     // Store current booking for actions
//     currentBookingForAction = booking.bookingId;
    
//     // Show modal
//     const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
//     modal.show();
// }

// async function handleBookingAction(bookingId, action) {
//     console.log(`Handling booking ${bookingId} with action: ${action}`);
    
//     // Validate inputs
//     if (!bookingId) {
//         console.error('No booking ID provided');
//         showAlert('Invalid booking ID', 'error');
//         return;
//     }
    
//     if (!action || !['accept', 'reject'].includes(action)) {
//         console.error('Invalid action:', action);
//         showAlert('Invalid action', 'error');
//         return;
//     }
    
//     const confirmMessage = action === 'accept' 
//         ? 'Are you sure you want to accept this booking?'
//         : 'Are you sure you want to reject this booking?';
        
//     if (!confirm(confirmMessage)) {
//         return;
//     }
    
//     // Get optional notes
//     const notes = prompt(action === 'accept' ? 'Add any notes for the customer (optional):' : 'Reason for rejection (optional):', '');
    
//     try {
//         console.log('Starting booking action process...');
        
//         // Check authentication token
//         const token = getAuthToken();
//         console.log('Auth token available:', !!token);
        
//         if (!token) {
//             showAlert('Authentication required. Please login again.', 'error');
//             setTimeout(() => {
//                 logout();
//             }, 2000);
//             return;
//         }
        
//         // Use the dedicated hotel booking handle endpoint
//         const apiUrl = `${HOTEL_DASHBOARD_API}/bookings/${bookingId}/handle`;
//         const requestBody = {
//             action: action,    // 'accept' or 'reject'
//             notes: notes || ''
//         };
        
//         console.log('Using correct API endpoint:', apiUrl);
//         console.log('Request body:', requestBody);
        
//         const response = await makeAPIRequest(apiUrl, {
//             method: 'PUT',
//             body: JSON.stringify(requestBody)
//         });
        
//         console.log('Hotel confirm API response:', response);
        
//         if (response && response.success) {
//             showAlert(response.message, 'success');
            
//             // Refresh views
//             const activeSection = document.querySelector('.content-section.active');
//             if (activeSection) {
//                 const sectionId = activeSection.id.replace('-section', '');
//                 console.log('Refreshing section:', sectionId);
//                 if (sectionId === 'requests') {
//                     await loadBookingRequests();
//                 } else if (sectionId === 'dashboard') {
//                     await loadDashboardData();
//                 }
//             }
//             // Always refresh history so processed requests appear there
//             await loadBookingHistory();
            
//             // Close modal
//             const modal = bootstrap.Modal.getInstance(document.getElementById('bookingDetailsModal'));
//             if (modal) modal.hide();
//         } else {
//             console.error('API returned failure:', response);
//             showAlert(response?.message || `Failed to ${action} booking`, 'error');
//         }
//     } catch (error) {
//         console.error(`Error ${action}ing booking:`, error);
//         showAlert(`Failed to ${action} booking: ${error.message}`, 'error');
//     }
// }

// // Setup modal event listeners
// document.addEventListener('DOMContentLoaded', function() {
//     const acceptBtn = document.getElementById('acceptBookingBtn');
//     const rejectBtn = document.getElementById('rejectBookingBtn');
    
//     if (acceptBtn) {
//         acceptBtn.addEventListener('click', () => {
//             if (currentBookingForAction) {
//                 handleBookingAction(currentBookingForAction, 'accept');
//             }
//         });
//     }
    
//     if (rejectBtn) {
//         rejectBtn.addEventListener('click', () => {
//             if (currentBookingForAction) {
//                 handleBookingAction(currentBookingForAction, 'reject');
//             }
//         });
//     }
// });

// // Room Management functions
// async function loadRoomTypes() {
//     console.log('Loading room types...');
    
//     if (!hotelData) {
//         await loadHotelProfile();
//     }
    
//     if (hotelData && hotelData.room_types) {
//         displayRoomTypes(hotelData.room_types);
//     }
// }

// function displayRoomTypes(roomTypes) {
//     const container = document.getElementById('roomTypesContainer');
    
//     if (!roomTypes || roomTypes.length === 0) {
//         container.innerHTML = '<div class="col-12"><p class="text-muted">No room types configured.</p></div>';
//         return;
//     }
    
//     const html = roomTypes.map((room, index) => `
//         <div class="col-md-6 col-lg-4 mb-4">
//             <div class="card">
//                 <div class="card-body">
//                     <h5 class="card-title">${room.type}</h5>
//                     <h4 class="text-primary">${formatCurrency(room.price_per_night || room.price || room.pricePerNight)}<small class="text-muted">/night</small></h4>
//                     <p class="card-text">
//                         <strong>Features:</strong><br>
//                         ${room.features ? room.features.join(', ') : 'Standard amenities'}
//                     </p>
//                     <button class="btn btn-outline-primary btn-sm" onclick="editRoom(${index})">
//                         <i class="fas fa-edit me-1"></i>Edit
//                     </button>
//                     <button class="btn btn-outline-danger btn-sm ms-2" onclick="deleteRoom(${index})">
//                         <i class="fas fa-trash me-1"></i>Delete
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `).join('');
    
//     container.innerHTML = html;
// }

// function addRoom() {
//     // Clear the form
//     document.getElementById('roomTypeForm').reset();
    
//     // Show modal
//     const modal = new bootstrap.Modal(document.getElementById('addRoomModal'));
//     modal.show();
// }

// async function saveRoom() {
//     const roomType = document.getElementById('roomType').value;
//     const pricePerNight = document.getElementById('pricePerNight').value;
//     const roomFeatures = document.getElementById('roomFeatures').value;
    
//     if (!roomType || !pricePerNight) {
//         showAlert('Please fill in all required fields', 'error');
//         return;
//     }
    
//     const newRoom = {
//         type: roomType,
//         price_per_night: String(sanitizePrice(pricePerNight)),
//         features: roomFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0)
//     };
    
//     try {
//         // Add room to current room types
//         const updatedRoomTypes = [...(hotelData.room_types || []), newRoom];
        
//         const userId = (currentUser && (currentUser.id || currentUser._id)) || localStorage.getItem('userId');
//         const response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${userId}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify({ room_types: updatedRoomTypes })
//             }
//         );
        
//         if (response && response.success) {
//             hotelData = response.data;
//             displayRoomTypes(hotelData.room_types);
            
//             // Hide modal
//             const modal = bootstrap.Modal.getInstance(document.getElementById('addRoomModal'));
//             modal.hide();
            
//             showAlert('Room type added successfully!', 'success');
//         }
//     } catch (error) {
//         console.error('Error adding room type:', error);
//         showAlert('Failed to add room type', 'error');
//     }
// }

// function editRoom(index) {
//     if (!hotelData || !hotelData.room_types[index]) {
//         showAlert('Room not found', 'error');
//         return;
//     }
    
// const room = hotelData.room_types[index];
    
//     // Populate form with existing data
//     document.getElementById('roomType').value = room.type;
//     document.getElementById('pricePerNight').value = sanitizePrice(room.price_per_night || room.price || room.pricePerNight);
//     document.getElementById('roomFeatures').value = room.features ? room.features.join(', ') : '';
    
//     // Change save button to update
//     const saveBtn = document.querySelector('#addRoomModal .btn-primary');
//     saveBtn.textContent = 'Update Room';
//     saveBtn.onclick = () => updateRoom(index);
    
//     // Show modal
//     const modal = new bootstrap.Modal(document.getElementById('addRoomModal'));
//     modal.show();
// }

// async function updateRoom(index) {
//     const roomType = document.getElementById('roomType').value;
//     const pricePerNight = document.getElementById('pricePerNight').value;
//     const roomFeatures = document.getElementById('roomFeatures').value;
    
//     if (!roomType || !pricePerNight) {
//         showAlert('Please fill in all required fields', 'error');
//         return;
//     }
    
// const updatedRoom = {
//         type: roomType,
//         price_per_night: String(sanitizePrice(pricePerNight)),
//         features: roomFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0)
//     };
    
//     try {
//         // Update room types array
//         const updatedRoomTypes = [...hotelData.room_types];
//         updatedRoomTypes[index] = updatedRoom;
        
//         const userId = (currentUser && (currentUser.id || currentUser._id)) || localStorage.getItem('userId');
//         const response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${userId}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify({ room_types: updatedRoomTypes })
//             }
//         );
        
//         if (response && response.success) {
//             hotelData = response.data;
//             displayRoomTypes(hotelData.room_types);
            
//             // Hide modal and reset button
//             const modal = bootstrap.Modal.getInstance(document.getElementById('addRoomModal'));
//             modal.hide();
            
//             const saveBtn = document.querySelector('#addRoomModal .btn-primary');
//             saveBtn.textContent = 'Save Room';
//             saveBtn.onclick = saveRoom;
            
//             showAlert('Room type updated successfully!', 'success');
//         }
//     } catch (error) {
//         console.error('Error updating room type:', error);
//         showAlert('Failed to update room type', 'error');
//     }
// }

// async function deleteRoom(index) {
//     if (!confirm('Are you sure you want to delete this room type?')) {
//         return;
//     }
    
//     try {
//         // Remove room from array
//         const updatedRoomTypes = hotelData.room_types.filter((_, i) => i !== index);
        
// const userId = (currentUser && (currentUser.id || currentUser._id)) || localStorage.getItem('userId');
//         const response = await makeAPIRequest(
//             `${HOTEL_DASHBOARD_API}/${userId}`,
//             {
//                 method: 'PUT',
//                 body: JSON.stringify({ room_types: updatedRoomTypes })
//             }
//         );
        
//         if (response && response.success) {
//             hotelData = response.data;
//             displayRoomTypes(hotelData.room_types);
//             showAlert('Room type deleted successfully!', 'success');
//         }
//     } catch (error) {
//         console.error('Error deleting room type:', error);
//         showAlert('Failed to delete room type', 'error');
//     }
// }

// // Initialize dashboard
// document.addEventListener('DOMContentLoaded', async function() {
//     console.log('Hotel Dashboard initializing...');
    
//     // Check authentication
//     if (!isAuthenticated()) {
//         showAlert('Please login to access the dashboard', 'error');
//         setTimeout(() => {
//             window.location.href = 'sign in.html';
//         }, 2000);
//         return;
//     }
    
//     // Get user data
//     const userData = localStorage.getItem('user');
//     if (userData) {
//         currentUser = JSON.parse(userData);
//         // Normalize: ensure both .id and ._id are present (login may save either)
//         if (!currentUser.id && currentUser._id) currentUser.id = currentUser._id;
//         if (!currentUser._id && currentUser.id) currentUser._id = currentUser.id;
        
//         // Check if user is a hotel manager
//         if (currentUser.role !== 'hotel') {
//             showAlert('Access denied. This dashboard is for hotel managers only.', 'error');
//             setTimeout(() => {
//                 logout();
//             }, 3000);
//             return;
//         }
        
//         // Update welcome message
//         const welcomeElement = document.getElementById('userWelcome');
//         if (welcomeElement) {
//             welcomeElement.textContent = currentUser.fullName || 'Hotel Manager';
//         }
//     }
    
//     // Load initial dashboard data
//     await loadDashboardData();
    
//     console.log('Hotel Dashboard initialized successfully');
// });
// // Debug functions for troubleshooting
// window.debugBookingAction = async function(bookingId, action) {
//     console.log('=== BOOKING ACTION DEBUG ===');
//     console.log('Booking ID:', bookingId);
//     console.log('Action:', action);
//     console.log('Auth token:', getAuthToken() ? 'present' : 'missing');
//     console.log('Current user:', currentUser);
    
//     const testEndpoints = [
//         // Test GET first to see if booking exists
//         {
//             name: 'GET booking details',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}`,
//             method: 'GET'
//         },
//         // Test various update endpoints
//         {
//             name: 'PATCH bookingformsdata',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}`,
//             method: 'PATCH',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected',
//                 hotelNotes: 'Debug test'
//             }
//         },
//         {
//             name: 'PUT bookingformsdata',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}`,
//             method: 'PUT',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected'
//             }
//         },
//         {
//             name: 'Hotel confirm endpoint (CORRECT)',
//             url: `${API_BASE_URL}/bookingformsdata/hotel/confirm/${bookingId}`,
//             method: 'PUT',
//             body: { 
//                 confirmed: action === 'accept' ? true : false,
//                 notes: 'Debug test'
//             }
//         },
//         {
//             name: 'Update endpoint',
//             url: `${API_BASE_URL}/bookingformsdata/${bookingId}/update`,
//             method: 'PUT',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected'
//             }
//         },
//         {
//             name: 'Bookings collection',
//             url: `${API_BASE_URL}/bookings/${bookingId}`,
//             method: 'PATCH',
//             body: {
//                 status: action === 'accept' ? 'hotel_accepted' : 'hotel_rejected'
//             }
//         }
//     ];
    
//     for (const endpoint of testEndpoints) {
//         try {
//             console.log(`\n--- Testing ${endpoint.name} ---`);
//             console.log('URL:', endpoint.url);
//             console.log('Method:', endpoint.method);
            
//             const options = {
//                 method: endpoint.method,
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${getAuthToken()}`
//                 }
//             };
            
//             if (endpoint.body) {
//                 options.body = JSON.stringify(endpoint.body);
//                 console.log('Body:', endpoint.body);
//             }
            
//             const response = await fetch(endpoint.url, options);
//             console.log('Status:', response.status, response.statusText);
            
//             let data;
//             try {
//                 data = await response.json();
//                 console.log('Response:', data);
//             } catch {
//                 const text = await response.text();
//                 console.log('Raw response:', text);
//             }
            
//             if (response.ok) {
//                 console.log('✅ SUCCESS - This endpoint works!');
//                 break; // Stop testing if we find a working endpoint
//             } else {
//                 console.log('❌ FAILED');
//             }
            
//         } catch (error) {
//             console.log('❌ ERROR:', error.message);
//         }
//     }
    
//     console.log('=== END DEBUG ===');
// };

// window.testAuth = function() {
//     console.log('=== AUTH TEST ===');
//     console.log('authToken:', localStorage.getItem('authToken'));
//     console.log('token:', localStorage.getItem('token'));
//     console.log('user:', localStorage.getItem('user'));
//     console.log('Current user object:', currentUser);
//     console.log('getAuthToken():', getAuthToken());
//     console.log('isAuthenticated():', isAuthenticated());
//     console.log('=== END AUTH TEST ===');
// };

// // Expose necessary functions to global scope
// window.showSection = showSection;
// window.refreshDashboard = refreshDashboard;
// window.loadBookingRequests = loadBookingRequests;
// window.loadBookingHistory = loadBookingHistory;
// window.viewBookingDetails = viewBookingDetails;
// window.handleBookingAction = handleBookingAction;
// window.addRoom = addRoom;
// window.saveRoom = saveRoom;
// window.editRoom = editRoom;
// window.updateRoom = updateRoom;
// window.deleteRoom = deleteRoom;
// window.removeGalleryImage = removeGalleryImage;
// window.clearGallery = clearGallery;
// window.loadHotelProfile = loadHotelProfile;
// window.logout = logout;
// window.toggleMobileSidebar = toggleMobileSidebar;







// ─── Config ──────────────────────────────────────────────────────────────────
const API = 'http://localhost:8000/api';

// ─── State ───────────────────────────────────────────────────────────────────
let hotelData  = null;   // full hotel document from DB
let hotelToken = null;   // JWT for hotel manager
let pendingMainImage  = null;   // { base64, mimeType } — set when user picks a file, sent on Save
let pendingGallery    = null;   // array of { id, base64, mimeType } — set when user picks files

// ─────────────────────────────────────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('hotelToken');
}

function getStoredHotel() {
  try { return JSON.parse(localStorage.getItem('hotelInfo') || 'null'); }
  catch { return null; }
}

function logout() {
  localStorage.removeItem('hotelToken');
  localStorage.removeItem('hotelInfo');
  window.location.href = 'sign in.html';
}

// ─────────────────────────────────────────────────────────────────────────────
// API request wrapper
// ─────────────────────────────────────────────────────────────────────────────
async function apiRequest(url, options = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await res.json();

  if (res.status === 401) {
    showAlert('Session expired. Please log in again.', 'error');
    setTimeout(logout, 1500);
    throw new Error('Unauthorized');
  }

  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast / alert
// ─────────────────────────────────────────────────────────────────────────────
function showAlert(message, type = 'info') {
  const div = document.createElement('div');
  div.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
  div.style.cssText = 'top:20px;right:20px;z-index:9999;min-width:300px;box-shadow:0 4px 12px rgba(0,0,0,0.15)';
  div.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

// ─────────────────────────────────────────────────────────────────────────────
// Section navigation
// ─────────────────────────────────────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));

  const section = document.getElementById(`${name}-section`);
  if (section) section.classList.add('active');

  document.querySelectorAll('.sidebar .nav-link').forEach(l => {
    if (l.getAttribute('onclick')?.includes(`'${name}'`)) l.classList.add('active');
  });

  if (name === 'profile')   loadProfile();
  if (name === 'rooms')     renderRooms();
  if (name === 'dashboard') loadDashboard();
  if (name === 'requests')  loadBookingRequests();
  if (name === 'history')   loadBookingHistory();
}

// ─────────────────────────────────────────────────────────────────────────────
// Booking Requests — load from /api/hoteldashboard/bookings/requests
// ─────────────────────────────────────────────────────────────────────────────
async function loadBookingRequests() {
  const tbody = document.getElementById('bookingRequestsTable');
  if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="text-center">Loading booking requests...</td></tr>';

  try {
    const data = await apiRequest(`${API}/hoteldashboard/bookings/requests`);
    const requests = data.requests || data.data || [];

    // Update badge count
    const badge = document.getElementById('requestsBadge');
    if (badge) badge.textContent = requests.length;

    if (!tbody) return;

    if (!requests.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">No pending booking requests.</td></tr>';
      return;
    }

    tbody.innerHTML = requests.map(r => `
      <tr>
        <td><strong>${r.bookingId || r._id || 'N/A'}</strong></td>
        <td>
          <strong>${r.customer?.name || 'Unknown'}</strong><br>
          <small class="text-muted">${r.customer?.email || ''}</small>
        </td>
        <td>${r.tourName || r.tripDetails?.places?.join(', ') || 'Tour Package'}</td>
        <td>${formatDate(r.tripDetails?.checkIn)}</td>
        <td>${formatDate(r.tripDetails?.checkOut)}</td>
        <td>${r.tripDetails?.travelers || 1}</td>
        <td><strong>₹${Number(r.payment?.totalAmount || r.financial?.totalAmount || 0).toLocaleString('en-IN')}</strong></td>
        <td><span class="badge bg-warning">${r.status || 'pending'}</span></td>
        <td>
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-success" title="Accept" onclick="handleBookingAction('${r.bookingId || r._id}', 'accept')">
              <i class="fas fa-check"></i>
            </button>
            <button class="btn btn-sm btn-danger" title="Reject" onclick="handleBookingAction('${r.bookingId || r._id}', 'reject')">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('loadBookingRequests error:', err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Failed to load: ${err.message}</td></tr>`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Booking History — load from /api/hoteldashboard/bookings/history
// ─────────────────────────────────────────────────────────────────────────────
async function loadBookingHistory() {
  const tbody = document.getElementById('bookingHistoryTable');
  if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="text-center">Loading booking history...</td></tr>';

  try {
    const data = await apiRequest(`${API}/hoteldashboard/bookings/history`);
    const history = data.history || data.data || [];

    if (!tbody) return;

    if (!history.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">No booking history available.</td></tr>';
      return;
    }

    tbody.innerHTML = history.map(b => `
      <tr>
        <td><strong>${b.bookingId || b._id || 'N/A'}</strong></td>
        <td>${b.customer?.name || b.customer || 'Unknown'}</td>
        <td>${b.tourName || 'Tour Package'}</td>
        <td>${formatDate(b.tripDetails?.checkIn || b.checkInDate)}</td>
        <td>${formatDate(b.tripDetails?.checkOut || b.checkOutDate)}</td>
        <td>${b.tripDetails?.travelers || b.travelers || 1}</td>
        <td><strong>₹${Number(b.payment?.totalAmount || b.amount || 0).toLocaleString('en-IN')}</strong></td>
        <td><span class="badge bg-${b.status === 'confirmed' ? 'success' : b.status === 'rejected' ? 'danger' : 'secondary'}">${b.status || 'confirmed'}</span></td>
        <td>${b.confirmedAt ? new Date(b.confirmedAt).toLocaleDateString('en-IN') : '—'}</td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('loadBookingHistory error:', err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Failed to load: ${err.message}</td></tr>`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Accept / Reject booking
// ─────────────────────────────────────────────────────────────────────────────
async function handleBookingAction(bookingId, action) {
  const label = action === 'accept' ? 'Accept' : 'Reject';
  if (!confirm(`${label} booking ${bookingId}?`)) return;

  try {
    await apiRequest(`${API}/hoteldashboard/bookings/${bookingId}/handle`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
    showAlert(`Booking ${action}ed successfully!`, 'success');
    loadBookingRequests();   // refresh table
    loadDashboardStats();    // refresh counts
  } catch (err) {
    showAlert(`Failed to ${action} booking: ${err.message}`, 'error');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Date formatter helper
// ─────────────────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleDateString('en-IN'); }
  catch { return dateStr; }
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT — runs on page load
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  hotelToken = getToken();

  if (!hotelToken) {
    showAlert('Please log in first.', 'error');
    setTimeout(() => window.location.href = 'sign in.html', 1500);
    return;
  }

  // Set welcome name from stored info
  const stored = getStoredHotel();
  if (stored) {
    setNavName(stored.hotelName || 'Hotel Manager');
  }

  // Load full hotel data from backend
  await loadHotelData();

  // ── Image upload listeners ────────────────────────────────────────────────
  // Main image — preview immediately, send on Save
  const mainUploadInput = document.getElementById('imageUpload');
  if (mainUploadInput) {
    mainUploadInput.addEventListener('change', function () {
      const file = this.files[0];
      if (!file) return;

      // Validate size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showAlert('Image too large. Please use an image under 2MB.', 'error');
        this.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const dataUrl  = e.target.result;                     // data:image/jpeg;base64,...
        const mimeType = file.type || 'image/jpeg';
        const base64   = dataUrl.split(',')[1];               // pure base64 only

        // Store for later (sent when Save is clicked)
        pendingMainImage = { base64, mimeType };

        // Show preview immediately
        const preview = document.getElementById('hotelImagePreview');
        if (preview) preview.src = dataUrl;

        showAlert('Image selected. Click "Save Changes" to upload it.', 'info');
      };
      reader.readAsDataURL(file);
    });
  }

  // Gallery images — preview immediately, send on Save
  const galleryUploadInput = document.getElementById('galleryUpload');
  if (galleryUploadInput) {
    galleryUploadInput.addEventListener('change', function () {
      const files = Array.from(this.files);
      if (!files.length) return;

      // Max 5 gallery images total
      const existingCount = (hotelData?.gallery || []).length + (pendingGallery || []).length;
      const allowedCount  = Math.max(0, 5 - existingCount);

      if (allowedCount === 0) {
        showAlert('Maximum 5 gallery images allowed. Remove some first.', 'error');
        this.value = '';
        return;
      }

      const toProcess = files.slice(0, allowedCount);
      if (files.length > allowedCount) {
        showAlert(`Only ${allowedCount} image(s) added (max 5 total).`, 'info');
      }

      pendingGallery = pendingGallery || [];
      let processed = 0;

      toProcess.forEach(file => {
        if (file.size > 2 * 1024 * 1024) {
          showAlert(`"${file.name}" is too large (max 2MB). Skipped.`, 'error');
          processed++;
          return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
          const dataUrl  = e.target.result;
          const mimeType = file.type || 'image/jpeg';
          const base64   = dataUrl.split(',')[1];
          const id       = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

          pendingGallery.push({ id, base64, mimeType, uploadedAt: new Date().toISOString() });
          processed++;

          // Re-render gallery preview after all files processed
          if (processed === toProcess.length) {
            renderGalleryPreview();
            showAlert(`${toProcess.length} gallery image(s) selected. Click "Save Changes" to upload.`, 'info');
          }
        };
        reader.readAsDataURL(file);
      });
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Load hotel data from /api/hotelauth/me
// ─────────────────────────────────────────────────────────────────────────────
async function loadHotelData() {
  try {
    const res = await apiRequest(`${API}/hotelauth/me`);
    if (res.success && res.data) {
      hotelData = res.data;
      setNavName(hotelData.hotel_details.hotel_name);
      loadDashboard();       // default section
      renderRooms();         // pre-load rooms count for badge
    }
  } catch (err) {
    console.error('loadHotelData error:', err);
    showAlert('Failed to load hotel data: ' + err.message, 'error');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard overview
// ─────────────────────────────────────────────────────────────────────────────
function loadDashboard() {
  if (!hotelData) return;

  // Helper: safely set textContent — won't crash if element doesn't exist in HTML
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  const hd    = hotelData.hotel_details;
  const rooms = hotelData.room_types || [];

  // ── Update stats cards (IDs that exist in hoteldashboard.html) ──────────
  // Booking stats are loaded separately by loadDashboardStats()
  // These are set to 0 as defaults; loadDashboardStats() will update them
  setText('totalBookings',     '0');
  setText('pendingRequests',   '0');
  setText('confirmedBookings', '0');
  setText('totalRevenue',      '0');

  // ── Optional dashboard detail elements (may or may not exist) ──────────
  setText('dashHotelName',       hd.hotel_name                || '—');
  setText('dashDistrict',        hd.location?.district        || '—');
  setText('dashRating',          hd.rating ? hd.rating + ' ★' : '—');
  setText('dashContact',         hd.contact                   || '—');
  setText('dashEmail',           hd.email                     || '—');
  setText('dashCheckIn',         hd.check_in_time             || '—');
  setText('dashCheckOut',        hd.check_out_time            || '—');
  setText('dashRoomCount',       rooms.length);
  setText('dashAmenitiesCount',  (hd.amenities || []).length);
  setText('dashAmenities',       (hd.amenities || []).length ? hd.amenities.join(', ') : '—');

  // Price range
  if (rooms.length) {
    const prices = rooms.map(r => parseInt(formatPrice(r.price_per_night)) || 0).filter(p => p > 0);
    if (prices.length) {
      const min = Math.min(...prices), max = Math.max(...prices);
      setText('dashPriceRange', min === max
        ? '₹' + min.toLocaleString('en-IN')
        : '₹' + min.toLocaleString('en-IN') + '+');
    }
  } else {
    setText('dashPriceRange', '—');
  }

  // Room summary list (optional element)
  const summary = document.getElementById('dashRoomSummary');
  if (summary) {
    summary.innerHTML = rooms.length
      ? rooms.map(r =>
          '<div class="d-flex justify-content-between py-1 border-bottom">' +
          '<span>' + esc(r.type) + '</span>' +
          '<strong>₹' + formatPrice(r.price_per_night) + '/night</strong>' +
          '</div>').join('')
      : '<span class="text-muted">No rooms configured yet.</span>';
  }

  // Main image (optional element)
  const img   = document.getElementById('dashHotelImage');
  const noImg = document.getElementById('dashNoImage');
  const src   = getBestImage(hotelData);
  if (img) {
    if (src) {
      img.src = src; img.style.display = 'block';
      if (noImg) noImg.style.display = 'none';
    } else {
      img.style.display = 'none';
      if (noImg) noImg.style.display = 'block';
    }
  }

  // Load actual booking stats from API
  loadDashboardStats();
}

// ─────────────────────────────────────────────────────────────────────────────
// Load booking stats from /api/hoteldashboard/stats
// ─────────────────────────────────────────────────────────────────────────────
async function loadDashboardStats() {
  try {
    const token = localStorage.getItem('hotelToken') || localStorage.getItem('authToken');
    if (!token) return;

    const res = await fetch(API + '/hoteldashboard/stats', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!res.ok) return; // silently fail — stats are non-critical

    const data = await res.json();
    const stats = data.stats || data;

    function setText(id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    }

    setText('totalBookings',     stats.totalBookings     || 0);
    setText('pendingRequests',   stats.pendingRequests   || 0);
    setText('confirmedBookings', stats.confirmedBookings || 0);
    setText('totalRevenue',      stats.totalRevenue
      ? Number(stats.totalRevenue).toLocaleString('en-IN') : '0');

    // Update booking requests badge in sidebar
    const badge = document.getElementById('requestsBadge');
    if (badge) badge.textContent = stats.pendingRequests || 0;

    // Load recent bookings for dashboard overview
    loadRecentBookingsPreview();

  } catch (err) {
    console.warn('Could not load dashboard stats:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent Bookings Preview on Dashboard
// ─────────────────────────────────────────────────────────────────────────────
async function loadRecentBookingsPreview() {
  const container = document.getElementById('recentBookings');
  if (!container) return;

  try {
    const token = localStorage.getItem('hotelToken') || localStorage.getItem('authToken');
    if (!token) return;

    const res = await fetch(API + '/hoteldashboard/bookings/requests', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!res.ok) {
      container.innerHTML = '<p class="text-muted text-center py-3">No recent bookings.</p>';
      return;
    }

    const data = await res.json();
    const requests = (data.requests || data.data || []).slice(0, 5);

    if (!requests.length) {
      container.innerHTML = '<p class="text-muted text-center py-3">No pending booking requests.</p>';
      return;
    }

    container.innerHTML = requests.map(r => `
      <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
        <div>
          <strong>${r.bookingId || 'N/A'}</strong>
          <span class="text-muted ms-2">${r.customer?.name || 'Customer'}</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <small class="text-muted">${r.tripDetails?.checkIn ? new Date(r.tripDetails.checkIn).toLocaleDateString('en-IN') : ''}</small>
          <span class="badge bg-warning">Pending</span>
        </div>
      </div>
    `).join('');

  } catch (err) {
    if (container) container.innerHTML = '<p class="text-muted text-center py-3">Could not load recent bookings.</p>';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hotel Profile — populate form
// ─────────────────────────────────────────────────────────────────────────────
function loadProfile() {
  if (!hotelData) { showAlert('Hotel data not loaded yet.', 'info'); return; }
  const hd = hotelData.hotel_details;

  document.getElementById('hotelName').value      = hd.hotel_name             || '';
  document.getElementById('contact').value        = hd.contact                || '';
  document.getElementById('district').value       = hd.location?.district     || '';
  document.getElementById('pincode').value        = hd.location?.pincode      || '';
  document.getElementById('checkInTime').value    = hd.check_in_time          || '14:00';
  document.getElementById('checkOutTime').value   = hd.check_out_time         || '11:00';
  document.getElementById('description').value    = hd.description            || '';
  document.getElementById('amenities').value      = (hd.amenities || []).join(', ');

  // show email read-only
  const emailEl = document.getElementById('managerEmail');
  if (emailEl) emailEl.value = hd.email || '';

  // Main image preview — HTML uses id="hotelImage" not "hotelImagePreview"
  const src = getBestImage(hotelData);
  const imgEl = document.getElementById('hotelImage') || document.getElementById('hotelImagePreview');
  if (imgEl) imgEl.src = src || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\'%3E%3Crect width=\'300\' height=\'200\' fill=\'%23e9ecef\'/%3E%3Ctext x=\'150\' y=\'100\' font-family=\'Arial\' font-size=\'14\' fill=\'%236c757d\' text-anchor=\'middle\'%3ENo Image%3C/text%3E%3C/svg%3E';

  // Update profileStatus badge
  const statusEl = document.getElementById('profileStatus');
  if (statusEl) {
    statusEl.textContent = src ? 'Loaded' : 'No Image';
    statusEl.className = src ? 'badge bg-success' : 'badge bg-secondary';
  }

  // Render gallery
  renderGalleryPreview();
}

// ─────────────────────────────────────────────────────────────────────────────
// Gallery preview render (shows saved + pending images)
// ─────────────────────────────────────────────────────────────────────────────
function renderGalleryPreview() {
  const container = document.getElementById('galleryPreview');
  if (!container) return;

  const savedGallery   = hotelData?.gallery   || [];
  const pendingImages  = pendingGallery        || [];
  const allImages      = [...savedGallery, ...pendingImages];

  if (!allImages.length) {
    container.innerHTML = '<p class="text-muted small">No gallery images yet.</p>';
    return;
  }

  container.innerHTML = allImages.map((img, i) => {
    const src      = img.base64
      ? `data:${img.mimeType || 'image/jpeg'};base64,${img.base64}`
      : (img.url || '');
    const isPending = i >= savedGallery.length;
    const label    = isPending
      ? '<span class="badge bg-warning text-dark" style="font-size:10px">Unsaved</span>'
      : '<span class="badge bg-success" style="font-size:10px">Saved</span>';

    return `
      <div class="col-4 col-md-3 mb-2 position-relative gallery-thumb">
        <img src="${src}" class="img-fluid rounded" style="height:80px;width:100%;object-fit:cover"
             alt="Gallery image ${i+1}">
        ${label}
        <button type="button"
          class="btn btn-danger btn-sm position-absolute"
          style="top:2px;right:6px;padding:1px 5px;font-size:11px;line-height:1.2"
          onclick="removeGalleryImage(${i}, ${isPending})">✕</button>
      </div>`;
  }).join('');
}

// Remove gallery image (saved or pending)
function removeGalleryImage(index, isPending) {
  if (isPending) {
    const savedCount = (hotelData?.gallery || []).length;
    const pendingIdx = index - savedCount;
    if (pendingGallery && pendingIdx >= 0) {
      pendingGallery.splice(pendingIdx, 1);
    }
    renderGalleryPreview();
  } else {
    // Immediately remove from saved gallery via API
    if (!hotelData?.gallery) return;
    const updated = hotelData.gallery.filter((_, i) => i !== index);
    saveGalleryToAPI(updated);
  }
}

async function saveGalleryToAPI(updatedGallery) {
  try {
    const res = await apiRequest(`${API}/hotelauth/update`, {
      method: 'PUT',
      body: JSON.stringify({ gallery: updatedGallery })
    });
    if (res.success) {
      hotelData.gallery = res.data.gallery || [];
      renderGalleryPreview();
      showAlert('Gallery updated.', 'success');
    }
  } catch (err) {
    showAlert('Failed to update gallery: ' + err.message, 'error');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Save profile
// ─────────────────────────────────────────────────────────────────────────────
async function saveProfile() {
  const btn = document.getElementById('saveProfileBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

  const payload = {
    hotel_details: {
      hotel_name:      document.getElementById('hotelName').value.trim(),
      contact:         document.getElementById('contact').value.trim(),
      description:     document.getElementById('description').value.trim(),
      check_in_time:   document.getElementById('checkInTime').value,
      check_out_time:  document.getElementById('checkOutTime').value,
      amenities:       document.getElementById('amenities').value
                         .split(',').map(a => a.trim()).filter(Boolean),
      location: {
        district: document.getElementById('district').value.trim(),
        pincode:  parseInt(document.getElementById('pincode').value) || 0
      }
    }
  };

  // Include main image if a new one was selected
  if (pendingMainImage) {
    payload.image = { base64: pendingMainImage.base64 };
  }

  // Merge saved gallery + any newly picked images
  if (pendingGallery && pendingGallery.length > 0) {
    const savedGallery  = hotelData?.gallery || [];
    payload.gallery = [
      ...savedGallery,
      ...pendingGallery.map(img => ({
        id:         img.id,
        base64:     img.base64,
        uploadedAt: img.uploadedAt || new Date().toISOString()
      }))
    ];
  }

  if (!payload.hotel_details.hotel_name || !payload.hotel_details.location.district) {
    showAlert('Hotel name and district are required.', 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save me-2"></i>Save Changes';
    return;
  }

  try {
    const res = await apiRequest(`${API}/hotelauth/update`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    if (res.success) {
      // Update local state
      hotelData.hotel_details = res.data.hotel_details;
      if (res.data.image)   hotelData.image   = res.data.image;
      if (res.data.gallery) hotelData.gallery = res.data.gallery;

      // Clear pending uploads — they are now saved
      pendingMainImage = null;
      pendingGallery   = null;

      // Refresh previews
      const src = getBestImage(hotelData);
      const imgEl = document.getElementById('hotelImagePreview');
      if (imgEl && src) imgEl.src = src;
      renderGalleryPreview();

      // Refresh dashboard image too
      const dashImg = document.getElementById('dashHotelImage');
      if (dashImg && src) { dashImg.src = src; dashImg.style.display = 'block'; }

      showAlert('Hotel profile and images saved successfully! ✓', 'success');
      setNavName(hotelData.hotel_details.hotel_name);
    }
  } catch (err) {
    showAlert('Failed to save: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save me-2"></i>Save Changes';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Room Management
// ─────────────────────────────────────────────────────────────────────────────
function renderRooms() {
  if (!hotelData) return;
  const rooms = hotelData.room_types || [];
  const container = document.getElementById('roomTypesContainer');
  const badge = document.getElementById('roomsCountBadge');
  if (badge) badge.textContent = rooms.length;

  if (!rooms.length) {
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-muted">
        <i class="fas fa-bed fa-3x mb-3 d-block opacity-25"></i>
        <p>No room types added yet. Click "Add Room Type" to get started.</p>
      </div>`;
    return;
  }

  container.innerHTML = rooms.map((room, i) => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card h-100">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0 fw-bold"><i class="fas fa-bed me-2"></i>${esc(room.type)}</h6>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary" onclick="openEditRoom(${i})" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteRoom(${i})" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="h4 text-primary fw-bold mb-1">
            ₹${formatPrice(room.price_per_night)}
            <small class="text-muted fs-6 fw-normal">/night</small>
          </div>
          <div class="mt-2">
            ${(room.features || []).map(f =>
              `<span class="badge bg-light text-dark border me-1 mb-1">${esc(f)}</span>`
            ).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function openAddRoom() {
  document.getElementById('roomModalTitle').textContent = 'Add Room Type';
  document.getElementById('roomForm').reset();
  document.getElementById('roomEditIndex').value = '-1';
  document.getElementById('saveRoomBtn').textContent = 'Add Room';
  new bootstrap.Modal(document.getElementById('roomModal')).show();
}

function openEditRoom(index) {
  const room = hotelData.room_types[index];
  if (!room) return;

  document.getElementById('roomModalTitle').textContent = 'Edit Room Type';
  document.getElementById('roomType').value       = room.type;
  document.getElementById('pricePerNight').value  = formatPrice(room.price_per_night);
  document.getElementById('roomFeatures').value   = (room.features || []).join(', ');
  document.getElementById('roomEditIndex').value  = index;
  document.getElementById('saveRoomBtn').textContent = 'Update Room';
  new bootstrap.Modal(document.getElementById('roomModal')).show();
}

async function saveRoom() {
  const type     = document.getElementById('roomType').value.trim();
  const price    = document.getElementById('pricePerNight').value.trim();
  const features = document.getElementById('roomFeatures').value
                     .split(',').map(f => f.trim()).filter(Boolean);
  const editIdx  = parseInt(document.getElementById('roomEditIndex').value);

  if (!type || !price) { showAlert('Room type and price are required.', 'error'); return; }

  const room = {
    type,
    price_per_night: `₹${price}`,
    features
  };

  const rooms = [...(hotelData.room_types || [])];
  if (editIdx >= 0) rooms[editIdx] = room;
  else rooms.push(room);

  await saveRoomTypes(rooms);
}

async function deleteRoom(index) {
  if (!confirm('Delete this room type?')) return;
  const rooms = hotelData.room_types.filter((_, i) => i !== index);
  await saveRoomTypes(rooms);
}

async function saveRoomTypes(rooms) {
  try {
    const res = await apiRequest(`${API}/hotelauth/update`, {
      method: 'PUT',
      body: JSON.stringify({ room_types: rooms })
    });

    if (res.success) {
      hotelData.room_types = res.data.room_types;
      renderRooms();
      showAlert('Rooms updated successfully! ✓', 'success');
      // close modal if open
      const modal = bootstrap.Modal.getInstance(document.getElementById('roomModal'));
      if (modal) modal.hide();
    }
  } catch (err) {
    showAlert('Failed to update rooms: ' + err.message, 'error');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getBestImage(data) {
  // Try image field first, then img_1..img_5
  const fields = ['image', 'img_1', 'img_2', 'img_3', 'img_4', 'img_5'];
  for (const f of fields) {
    const val = data[f];
    if (!val) continue;
    // Mongoose Binary / buffer object
    if (val._bsontype === 'Binary' && val.buffer)
      return `data:image/jpeg;base64,${val.buffer.toString('base64')}`;
    if (val.$binary?.base64)
      return `data:image/jpeg;base64,${val.$binary.base64}`;
    if (val.base64)
      return `data:image/jpeg;base64,${val.base64}`;
    if (typeof val === 'string' && val.startsWith('data:'))
      return val;
  }
  return null;
}

function formatPrice(raw) {
  if (!raw) return '0';
  return String(raw).replace(/[₹,\s]/g, '');
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setNavName(name) {
  const el = document.getElementById('userWelcome');
  if (el) el.textContent = name || 'Hotel Manager';
}

// ─── Expose to global (called from onclick in HTML) ──────────────────────────
window.showSection           = showSection;
window.loadBookingRequests  = loadBookingRequests;
window.loadBookingHistory   = loadBookingHistory;
window.handleBookingAction  = handleBookingAction;

// ── loadHotelProfile: called by Refresh button in profile section ─────────
window.loadHotelProfile = async function() {
  const statusEl = document.getElementById('profileStatus');
  if (statusEl) { statusEl.textContent = 'Refreshing...'; statusEl.className = 'badge bg-warning'; }
  await loadHotelData();
  loadProfile();
};
window.saveProfile        = saveProfile;
window.openAddRoom        = openAddRoom;
window.openEditRoom       = openEditRoom;
window.saveRoom           = saveRoom;
window.deleteRoom         = deleteRoom;
window.logout             = logout;
window.removeGalleryImage = removeGalleryImage;
window.renderGalleryPreview = renderGalleryPreview;