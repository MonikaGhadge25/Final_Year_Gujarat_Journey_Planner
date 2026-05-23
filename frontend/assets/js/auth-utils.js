/**
 * Authentication Utility Functions
 * Handles dynamic header updates and login validation
 */

class AuthUtils {
    /**
     * Check if user is currently logged in
     * @returns {boolean} - true if logged in, false otherwise
     */
    static isLoggedIn() {
        const authToken = localStorage.getItem('authToken');
        const regularToken = localStorage.getItem('token');
        const token = authToken || regularToken;
        
        return !!token && token !== 'null' && token !== 'undefined';
    }

    /**
     * Get current user information from localStorage
     * @returns {object|null} - user info object or null if not found
     */
    static getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    /**
     * Update header navigation based on authentication status
     */
    static updateHeaderNavigation() {
        const isAuthenticated = this.isLoggedIn();
        const user = this.getCurrentUser();
        
        let navLink = document.querySelector('nav a[href="sign in.html"]') || 
                     document.querySelector('nav a[href="profile.html"]');
        
        if (!navLink) {
            console.warn('Navigation link not found');
            return;
        }

        this.removeLogoutOption();

        if (isAuthenticated) {
            const userName = user?.fullName || user?.name || 'User';
            navLink.textContent = `Profile`;
            navLink.href = 'profile.html';
            navLink.title = `View profile for ${userName}`;
            this.addLogoutButton(navLink);
        } else {
            navLink.textContent = 'Sign In';
            navLink.href = 'sign in.html';
            navLink.title = 'Sign in to your account';
        }
    }

    /**
     * Add a small logout button next to profile link
     */
    static addLogoutButton(profileLink) {
        if (document.querySelector('[data-auth-logout]')) return;

        const navMenu = document.querySelector('#navmenu ul');
        if (!navMenu) return;
        
        const logoutItem = document.createElement('li');
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.textContent = 'Logout';
        logoutLink.setAttribute('data-auth-logout', 'true');
        logoutLink.style.color = '#dc3545';
        logoutLink.style.fontSize = '14px';
        logoutLink.title = 'Logout from your account';
        
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                this.logout();
            }
        });
        
        logoutItem.appendChild(logoutLink);
        const profileItem = profileLink.parentElement;
        profileItem.parentNode.insertBefore(logoutItem, profileItem.nextSibling);
    }

    /**
     * Remove logout option from navigation
     */
    static removeLogoutOption() {
        const logoutLink = document.querySelector('nav a[data-auth-logout]');
        if (logoutLink) {
            logoutLink.parentElement.remove();
        }
    }

    /**
     * Clear all auth keys from localStorage
     */
    static clearAllAuth() {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('hotelToken');
        localStorage.removeItem('hotelInfo');
        localStorage.removeItem('paymentBookingId');
    }

    /**
     * Logout user and redirect to home page
     */
    static logout() {
        this.clearAllAuth();
        console.log('User logged out successfully');
        window.location.href = 'home.html';
    }

    /**
     * Check if login is required for current page and redirect if needed
     */
    static requireLogin(requiredPages = [], currentPage = '') {
        if (!currentPage) {
            currentPage = window.location.pathname.split('/').pop() || 'home.html';
        }

        const requiresLogin = requiredPages.some(page => 
            currentPage.includes(page) || currentPage === page
        );

        if (requiresLogin && !this.isLoggedIn()) {
            localStorage.setItem('redirectAfterLogin', window.location.href);
            console.log('Authentication required - redirecting to login page');
            window.location.href = 'sign in.html';
            return false;
        }

        return true;
    }

    /**
     * Initialize authentication system on page load
     */
    static init(options = {}) {
        const {
            requireLogin = false,
            bookingPages = [
                'book.html', 
                'booking-form.html', 
                'bookingplace.html',
                'bookinghotels.html',
                'bookingagent.html',
                'book_hotel_form.html',
                'book_agent_form.html',
                'book-transport-form.html',
                'payment.html',
                'payment-gateway.html'
            ]
        } = options;

        this.updateHeaderNavigation();

        if (requireLogin || bookingPages.some(page => window.location.pathname.includes(page))) {
            this.requireLogin(bookingPages);
        }
    }

    /**
     * Handle redirect after successful login
     */
    static handlePostLoginRedirect() {
        const redirectUrl = localStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
            localStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectUrl;
        } else {
            window.location.href = 'profile.html';
        }
    }

    /**
     * Add authentication event listeners
     */
    static addEventListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'authToken' || e.key === 'token' || e.key === 'user') {
                this.updateHeaderNavigation();
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateHeaderNavigation();
            }
        });
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Detect if we are on the sign in page
    const currentPage = window.location.pathname.split('/').pop();
    const isSignInPage = currentPage === 'sign in.html' || 
                         currentPage === 'sign%20in.html' ||
                         decodeURIComponent(currentPage) === 'sign in.html';

    if (isSignInPage) {
        // ✅ Do NOT call clearAllAuth() here — it wipes hotelToken/authToken
        // immediately after login before the redirect to dashboard completes.
        AuthUtils.addEventListeners();
        return;
    }

    AuthUtils.init();
    AuthUtils.addEventListeners();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthUtils;
}