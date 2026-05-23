/**
 * agentdashboard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mirrors hoteldashboard.js exactly:
 *   • Auth via localStorage ('authToken' / 'token'), role must be 'agent'
 *   • On load → GET /api/agentdashboard/me  (returns Agent record)
 *   • Dashboard overview, profile editing, booking requests, booking history
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Config ──────────────────────────────────────────────────────────────────
const API       = 'http://localhost:8000/api';
const AGENT_API = `${API}/agentdashboard`;

// ─── State ───────────────────────────────────────────────────────────────────
let agentData              = null;   // full Agent document from DB
let currentBookingForAction = null;  // bookingId staged for modal accept/reject

// ─────────────────────────────────────────────────────────────────────────────
// Auth helpers  (same as hotel dashboard)
// ─────────────────────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); }
  catch { return null; }
}

function logout() {
  ['authToken', 'token', 'user', 'userRole', 'userEmail', 'userId', 'agentId'].forEach(k => localStorage.removeItem(k));
  window.location.href = 'sign in.html';
}

// ─────────────────────────────────────────────────────────────────────────────
// API wrapper
// ─────────────────────────────────────────────────────────────────────────────
async function apiRequest(url, options = {}) {
  const token = getToken();
  const res   = await fetch(url, {
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
// Toast
// ─────────────────────────────────────────────────────────────────────────────
function showAlert(message, type = 'info') {
  const div = document.createElement('div');
  div.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
  div.style.cssText = 'top:20px;right:20px;z-index:9999;min-width:300px;box-shadow:0 4px 12px rgba(0,0,0,.15)';
  div.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 5000);
}

// ─────────────────────────────────────────────────────────────────────────────
// Section navigation
// ─────────────────────────────────────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));

  const sec = document.getElementById(`${name}-section`);
  if (sec) sec.classList.add('active');

  document.querySelectorAll('.sidebar .nav-link').forEach(l => {
    if (l.getAttribute('onclick')?.includes(`'${name}'`)) l.classList.add('active');
  });

  if (name === 'dashboard') loadDashboard();
  if (name === 'profile')   loadProfile();
  if (name === 'requests')  loadBookingRequests();
  if (name === 'history')   loadBookingHistory();
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken();
  if (!token) {
    showAlert('Please log in first.', 'error');
    setTimeout(() => window.location.href = 'sign in.html', 1500);
    return;
  }

  const user = getCurrentUser();
  if (!user || (user.role !== 'agent' && user.role !== 'guide')) {
    showAlert('Access denied. This dashboard is for agents only.', 'error');
    setTimeout(logout, 2000);
    return;
  }

  // Show name immediately from stored user
  setNavName(user.fullName || 'Agent');

  // Load full agent profile from backend
  await loadAgentData();
});

// ─────────────────────────────────────────────────────────────────────────────
// Load agent data  GET /api/agentdashboard/me
// ─────────────────────────────────────────────────────────────────────────────
async function loadAgentData() {
  try {
    const res = await apiRequest(`${AGENT_API}/me`);
    if (res.success && res.data) {
      agentData = res.data;
      setNavName(agentData.name);
      loadDashboard();   // default section
    }
  } catch (err) {
    console.error('loadAgentData error:', err);
    showAlert('Failed to load agent data: ' + err.message, 'error');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard overview
// ─────────────────────────────────────────────────────────────────────────────
async function loadDashboard() {
  if (!agentData) return;

  // Populate profile cards
  setText('dashAgentName',    agentData.name);
  setText('dashDistrict',     agentData.district);
  setText('dashExperience',   agentData.experience + ' yrs');
  setText('dashFees',         agentData.fees || '—');
  setText('dashRating',       agentData.rating ? agentData.rating + ' ★' : '—');
  setText('dashMobile',       agentData.mobile_no || '—');
  setText('dashGender',       agentData.gender || '—');
  setText('dashLanguages',    (agentData.language || []).join(', ') || '—');

  // Load stats
  try {
    const statsRes = await apiRequest(`${AGENT_API}/stats`);
    if (statsRes.success) {
      const s = statsRes.stats;
      setText('statTotal',     s.totalBookings    || 0);
      setText('statPending',   s.pendingRequests  || 0);
      setText('statConfirmed', s.confirmedBookings|| 0);
      setText('statEarnings',  '₹' + (s.totalEarnings || 0).toLocaleString('en-IN'));
      // Update requests badge in nav
      const badge = document.getElementById('requestsCount');
      if (badge) badge.textContent = s.pendingRequests || 0;
    }
  } catch (err) {
    console.error('Stats error:', err);
  }

  // Load recent requests preview
  try {
    const reqRes = await apiRequest(`${AGENT_API}/bookings/requests`);
    if (reqRes.success) {
      displayRecentBookings((reqRes.requests || []).slice(0, 5));
    }
  } catch (err) {
    console.error('Recent bookings error:', err);
    displayRecentBookings([]);
  }
}

function displayRecentBookings(bookings) {
  const container = document.getElementById('recentBookings');
  if (!container) return;

  if (!bookings.length) {
    container.innerHTML = '<p class="text-muted">No pending booking requests.</p>';
    return;
  }

  container.innerHTML = bookings.map(b => `
    <div class="border-bottom py-3">
      <div class="row align-items-center">
        <div class="col-md-3">
          <strong>${esc(b.bookingId || b._id || 'N/A')}</strong>
          <br><small class="text-muted">${esc(b.customer?.name || 'Unknown')}</small>
        </div>
        <div class="col-md-3">
          <span class="badge bg-${statusColor(b.status)}">${b.status || 'pending'}</span>
          <br><small class="text-muted">${fmtDate(b.requestedAt)}</small>
        </div>
        <div class="col-md-3">
          <strong>₹${(b.payment?.totalAmount || 0).toLocaleString('en-IN')}</strong>
          <br><small class="text-muted">${b.tripDetails?.travelers || 1} traveler(s)</small>
        </div>
        <div class="col-md-3 text-end">
          <button class="btn btn-sm btn-outline-primary" onclick="viewBookingDetails('${b.bookingId || b._id}')">
            <i class="fas fa-eye me-1"></i>View
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile — populate form
// ─────────────────────────────────────────────────────────────────────────────
function loadProfile() {
  if (!agentData) { showAlert('Agent data not loaded yet.', 'info'); return; }

  setVal('profileName',       agentData.name);
  setVal('profileDistrict',   agentData.district);
  setVal('profileExperience', agentData.experience);
  setVal('profileAge',        agentData.age);
  setVal('profileFees',       (agentData.fees || '').replace('₹',''));
  setVal('profileMobile',     agentData.mobile_no);
  setVal('profileGender',     agentData.gender);
  setVal('profileLanguages',  (agentData.language || []).join(', '));
  setVal('profileEmail',      agentData.email || '');
}

async function saveProfile() {
  const btn = document.getElementById('saveProfileBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

  const languages = (getVal('profileLanguages') || '')
    .split(',').map(l => l.trim()).filter(Boolean);

  const payload = {
    name       : getVal('profileName'),
    district   : getVal('profileDistrict'),
    experience : parseInt(getVal('profileExperience')) || 0,
    age        : parseInt(getVal('profileAge'))        || 0,
    fees       : '₹' + (getVal('profileFees') || '0').replace('₹',''),
    mobile_no  : getVal('profileMobile'),
    gender     : getVal('profileGender'),
    language   : languages
  };

  if (!payload.name || !payload.district) {
    showAlert('Name and District are required.', 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save me-2"></i>Save Changes';
    return;
  }

  const userId = getCurrentUser()?.id || getCurrentUser()?._id || localStorage.getItem('userId');

  try {
    const res = await apiRequest(`${AGENT_API}/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    if (res.success) {
      agentData = res.data;
      setNavName(agentData.name);
      showAlert('Profile saved successfully! ✓', 'success');
    }
  } catch (err) {
    showAlert('Failed to save: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save me-2"></i>Save Changes';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Booking Requests
// ─────────────────────────────────────────────────────────────────────────────
async function loadBookingRequests() {
  const tbody = document.getElementById('bookingRequestsTable');
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center"><span class="spinner-border spinner-border-sm"></span> Loading...</td></tr>';

  try {
    const res = await apiRequest(`${AGENT_API}/bookings/requests`);
    displayBookingRequests(res.requests || []);

    const badge = document.getElementById('requestsCount');
    if (badge) badge.textContent = (res.requests || []).length;

  } catch (err) {
    console.error('loadBookingRequests error:', err);
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Failed to load requests.</td></tr>';
  }
}

function displayBookingRequests(requests) {
  const tbody = document.getElementById('bookingRequestsTable');
  if (!tbody) return;

  if (!requests.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No pending booking requests.</td></tr>';
    return;
  }

  tbody.innerHTML = requests.map(r => `
    <tr>
      <td><strong>${esc(r.bookingId || r._id || 'N/A')}</strong></td>
      <td>
        <strong>${esc(r.customer?.name || 'Unknown')}</strong><br>
        <small class="text-muted">${esc(r.customer?.email || '')}</small>
      </td>
      <td>${esc(r.tourName || 'Tour Package')}</td>
      <td>${fmtDate(r.tripDetails?.startDate)}</td>
      <td>${fmtDate(r.tripDetails?.endDate)}</td>
      <td>${r.tripDetails?.travelers || 1}</td>
      <td><strong>₹${(r.payment?.totalAmount || 0).toLocaleString('en-IN')}</strong></td>
      <td>
        <div class="btn-group" role="group">
          <button class="btn btn-sm btn-outline-info" onclick="viewBookingDetails('${r.bookingId || r._id}')" title="View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-success" onclick="handleBookingAction('${r.bookingId || r._id}', 'accept')" title="Accept">
            <i class="fas fa-check"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="handleBookingAction('${r.bookingId || r._id}', 'reject')" title="Reject">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// Booking History
// ─────────────────────────────────────────────────────────────────────────────
async function loadBookingHistory() {
  const tbody = document.getElementById('bookingHistoryTable');
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center"><span class="spinner-border spinner-border-sm"></span> Loading...</td></tr>';

  try {
    const res = await apiRequest(`${AGENT_API}/bookings/history`);
    displayBookingHistory(res.history || []);
  } catch (err) {
    console.error('loadBookingHistory error:', err);
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Failed to load history.</td></tr>';
  }
}

function displayBookingHistory(history) {
  const tbody = document.getElementById('bookingHistoryTable');
  if (!tbody) return;

  if (!history.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No booking history yet.</td></tr>';
    return;
  }

  tbody.innerHTML = history.map(b => `
    <tr>
      <td><strong>${esc(b.bookingId)}</strong></td>
      <td>${esc(b.customer)}</td>
      <td>${esc(b.tourName || '—')}</td>
      <td>${fmtDate(b.tripDates?.start)}</td>
      <td>${fmtDate(b.tripDates?.end)}</td>
      <td>${b.travelers || 1}</td>
      <td><strong>₹${(b.amount || 0).toLocaleString('en-IN')}</strong></td>
      <td><span class="badge bg-${statusColor(b.status)}">${b.status || '—'}</span></td>
      <td>${fmtDateTime(b.confirmedAt)}</td>
    </tr>
  `).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// View booking details modal
// ─────────────────────────────────────────────────────────────────────────────
async function viewBookingDetails(bookingId) {
  try {
    const res = await apiRequest(`${API}/bookingformsdata/${bookingId}`);
    const b   = res.success ? res.data : res;

    const content = document.getElementById('bookingDetailsContent');
    if (!content) return;

    content.innerHTML = `
      <div class="row g-3">
        <div class="col-md-6">
          <h6 class="fw-bold border-bottom pb-1">Booking Info</h6>
          <table class="table table-sm table-borderless mb-0">
            <tr><td class="text-muted">Booking ID</td><td><strong>${esc(b.bookingId || b._id)}</strong></td></tr>
            <tr><td class="text-muted">Tour</td><td>${esc(b.tourName || '—')}</td></tr>
            <tr><td class="text-muted">Status</td><td><span class="badge bg-${statusColor(b.status)}">${b.status}</span></td></tr>
            <tr><td class="text-muted">Amount</td><td><strong>₹${(b.payment?.totalAmount || 0).toLocaleString('en-IN')}</strong></td></tr>
          </table>
        </div>
        <div class="col-md-6">
          <h6 class="fw-bold border-bottom pb-1">Customer</h6>
          <table class="table table-sm table-borderless mb-0">
            <tr><td class="text-muted">Name</td><td>${esc(b.user?.fullName || b.tourist?.name || '—')}</td></tr>
            <tr><td class="text-muted">Email</td><td>${esc(b.tourist?.email || '—')}</td></tr>
            <tr><td class="text-muted">Phone</td><td>${esc(b.tourist?.phone || '—')}</td></tr>
          </table>
        </div>
        <div class="col-md-6">
          <h6 class="fw-bold border-bottom pb-1">Trip Details</h6>
          <table class="table table-sm table-borderless mb-0">
            <tr><td class="text-muted">Travelers</td><td>${b.tourist?.totalTravellers || 1}</td></tr>
            <tr><td class="text-muted">Check-in</td><td>${fmtDate(b.hotel?.fromDate)}</td></tr>
            <tr><td class="text-muted">Check-out</td><td>${fmtDate(b.hotel?.toDate)}</td></tr>
            <tr><td class="text-muted">Places</td><td>${(b.touristPlaces || []).join(', ') || '—'}</td></tr>
          </table>
        </div>
        <div class="col-md-6">
          <h6 class="fw-bold border-bottom pb-1">Hotel</h6>
          <table class="table table-sm table-borderless mb-0">
            <tr><td class="text-muted">Name</td><td>${esc(b.hotel?.name || '—')}</td></tr>
            <tr><td class="text-muted">Address</td><td>${esc(b.hotel?.address || '—')}</td></tr>
          </table>
        </div>
        ${b.specialRequests ? `
        <div class="col-12">
          <h6 class="fw-bold border-bottom pb-1">Special Requests</h6>
          <p class="border rounded p-2 bg-light">${esc(b.specialRequests)}</p>
        </div>` : ''}
      </div>
    `;

    currentBookingForAction = b.bookingId || b._id;

    const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
    modal.show();

  } catch (err) {
    showAlert('Failed to load booking details: ' + err.message, 'error');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Accept / Reject booking
// ─────────────────────────────────────────────────────────────────────────────
async function handleBookingAction(bookingId, action) {
  const confirmMsg = action === 'accept'
    ? 'Accept this booking request?'
    : 'Reject this booking request?';

  if (!confirm(confirmMsg)) return;

  const notes = prompt(
    action === 'accept' ? 'Add notes for the customer (optional):' : 'Reason for rejection (optional):',
    ''
  );

  try {
    const res = await apiRequest(`${AGENT_API}/bookings/${bookingId}/handle`, {
      method: 'POST',
      body: JSON.stringify({ action, notes: notes || '' })
    });

    if (res.success) {
      showAlert(res.message, 'success');

      // Close modal if open
      const modal = bootstrap.Modal.getInstance(document.getElementById('bookingDetailsModal'));
      if (modal) modal.hide();

      // Refresh current section
      await loadBookingRequests();
      await loadBookingHistory();

      // Refresh dashboard stats
      await loadDashboard();
    } else {
      showAlert(res.message || `Failed to ${action} booking`, 'error');
    }
  } catch (err) {
    showAlert(`Failed to ${action} booking: ` + err.message, 'error');
  }
}

// Modal accept/reject buttons
document.addEventListener('DOMContentLoaded', () => {
  const acceptBtn = document.getElementById('acceptBookingBtn');
  const rejectBtn = document.getElementById('rejectBookingBtn');
  if (acceptBtn) acceptBtn.addEventListener('click', () => { if (currentBookingForAction) handleBookingAction(currentBookingForAction, 'accept'); });
  if (rejectBtn) rejectBtn.addEventListener('click', () => { if (currentBookingForAction) handleBookingAction(currentBookingForAction, 'reject'); });
});

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────
function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? '—';
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val ?? '';
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setNavName(name) {
  const el = document.getElementById('userWelcome');
  if (el) el.textContent = name || 'Agent';
}

function fmtDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' });
}

function fmtDateTime(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleString('en-IN', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

function statusColor(s) {
  return { pending:'warning', agent_confirmed:'info', hotel_confirmed:'primary', confirmed:'success', cancelled:'danger', payment_complete:'success' }[s] || 'secondary';
}

// ─── Expose to global (HTML onclick) ─────────────────────────────────────────
window.showSection         = showSection;
window.saveProfile         = saveProfile;
window.loadBookingRequests = loadBookingRequests;
window.loadBookingHistory  = loadBookingHistory;
window.viewBookingDetails  = viewBookingDetails;
window.handleBookingAction = handleBookingAction;
window.logout              = logout;