/**
 * Booking Utility Functions
 * Handles authenticated API calls for booking operations
 */

class BookingUtils {
    /**
     * Get authentication token from localStorage
     * @returns {string|null} - authentication token or null if not found
     */
    static getAuthToken() {
        const authToken = localStorage.getItem('authToken');
        const regularToken = localStorage.getItem('token');
        return authToken || regularToken || null;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} - true if authenticated, false otherwise
     */
    static isAuthenticated() {
        const token = this.getAuthToken();
        return !!token && token !== 'null' && token !== 'undefined';
    }

    /**
     * Make authenticated API call
     * @param {string} url - API endpoint URL
     * @param {object} options - Fetch options (method, body, etc.)
     * @returns {Promise<Response>} - Fetch response promise
     */
    static async authenticatedFetch(url, options = {}) {
        // Check authentication first
        if (!this.isAuthenticated()) {
            throw new Error('Authentication required. Please sign in first.');
        }

        const token = this.getAuthToken();
        
        // Merge headers with authorization
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...(options.headers || {})
        };

        // Make the API call
        const response = await fetch(url, {
            ...options,
            headers
        });

        // Handle authentication errors
        if (response.status === 401) {
            // Clear invalid tokens
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            throw new Error('Authentication expired. Please sign in again.');
        }

        return response;
    }

    /**
     * Submit booking form data to API
     * @param {string} endpoint - API endpoint (e.g., '/api/bookingformsdata')
     * @param {object} bookingData - Booking form data
     * @returns {Promise<object>} - API response data
     */
    static async submitBooking(endpoint, bookingData) {
        try {
            console.log('Submitting booking to:', endpoint);
            console.log('Booking data:', bookingData);

            const response = await this.authenticatedFetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Booking submission result:', result);
            
            return result;
        } catch (error) {
            console.error('Booking submission error:', error);
            
            // Handle different error types
            if (error.message.includes('Authentication')) {
                console.log('Session expired - redirecting to login');
                window.location.href = 'sign in.html';
            } else {
                console.error('Failed to submit booking:', error.message);
            }
            
            throw error;
        }
    }

    /**
     * Cancel a booking
     * @param {string} bookingId - ID of booking to cancel
     * @returns {Promise<object>} - API response data
     */
    static async cancelBooking(bookingId) {
        try {
            const response = await this.authenticatedFetch(`http://localhost:8000/api/bookingformsdata/${bookingId}/cancel`, {
                method: 'PUT'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to cancel booking');
            }

            return await response.json();
        } catch (error) {
            console.error('Booking cancellation error:', error);
            throw error;
        }
    }

    /**
     * Redirect to login page if not authenticated
     * @param {string} redirectUrl - URL to redirect back to after login
     */
    static requireAuthentication(redirectUrl = null) {
        if (!this.isAuthenticated()) {
            if (redirectUrl) {
                localStorage.setItem('redirectAfterLogin', redirectUrl);
            }
            console.log('Authentication required - redirecting to login');
            window.location.href = 'sign in.html';
            return false;
        }
        return true;
    }

    /**
     * Initialize booking page with authentication requirement
     */
    static init() {
        document.addEventListener('DOMContentLoaded', () => {
            // Check if this is a booking page
            const isBookingPage = window.location.pathname.includes('book') || 
                                  window.location.pathname.includes('payment');
            
            if (isBookingPage) {
                this.requireAuthentication();
            }
        });
    }
}

// Auto-initialize
BookingUtils.init();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookingUtils;
}
