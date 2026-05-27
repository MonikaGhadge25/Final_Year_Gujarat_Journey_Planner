/**
 * transportdashboard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single shared transport manager dashboard.
 * Auth: localStorage token, role must be 'transport'.
 * Vehicle types: static (mirrors transport.html) — no MongoDB needed.
 * Bookings: fetched from /api/transportdashboard/bookings/*
 * ─────────────────────────────────────────────────────────────────────────────
 */

const API = 'http://localhost:8000/api/transportdashboard';

// Static vehicle catalogue — exact data from transport.html
const VEHICLE_TYPES = [
  { type:'3-Seater',  seats:3,  fuel:'CNG',    ac:false, pricePerKm:10, minFare:50,  category:'Budget',  extras:'Compact Ride',                   emoji:'🛺' },
  { type:'4-Seater',  seats:4,  fuel:'Petrol', ac:true,  pricePerKm:15, minFare:100, category:'Budget',  extras:'Music, GPS',                     emoji:'🚗' },
  { type:'5-Seater',  seats:5,  fuel:'Petrol', ac:true,  pricePerKm:18, minFare:120, category:'Standard',extras:'Luggage, GPS',                   emoji:'🚙' },
  { type:'6-Seater',  seats:6,  fuel:'Diesel', ac:true,  pricePerKm:20, minFare:150, category:'Premium', extras:'WiFi, Luggage Space',            emoji:'🚐' },
  { type:'7-Seater',  seats:7,  fuel:'Diesel', ac:true,  pricePerKm:25, minFare:200, category:'Premium', extras:'Family Friendly, Luggage Space',  emoji:'🚙' },
  { type:'Van',       seats:8,  fuel:'Diesel', ac:true,  pricePerKm:30, minFare:250, category:'Premium', extras:'Spacious, Family Group',          emoji:'🚌' },
  { type:'Ecco',      seats:5,  fuel:'Petrol', ac:false, pricePerKm:18, minFare:120, category:'Standard',extras:'Budget Family Ride',              emoji:'🚐' },
  { type:'Tempo',     seats:12, fuel:'Diesel', ac:true,  pricePerKm:35, minFare:300, category:'Premium', extras:'Tour Packages, Comfortable Seats', emoji:'🚌' },
];

let stagedBookingId = null;   // bookingId staged for modal accept/reject

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function getToken()      { return localStorage.getItem('authToken') || localStorage.getItem('token'); }
function getCurrentUser(){ try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } }

function logout() {
  ['authToken','token','user','userRole','userEmail','userId'].forEach(k => localStorage.removeItem(k));
  window.location.href = 'sign in.html';
}

// ─── API wrapper ──────────────────────────────────────────────────────────────
async function apiRequest(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${getToken()}`, ...(options.headers||{}) }
  });
  const data = await res.json();
  if (res.status === 401) { showAlert('Session expired. Please log in again.', 'error'); setTimeout(logout, 1500); throw new Error('Unauthorized'); }
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showAlert(msg, type = 'info') {
  const d = document.createElement('div');
  d.className = `alert alert-${type==='error'?'danger':type} alert-dismissible fade show position-fixed`;
  d.style.cssText = 'top:20px;right:20px;z-index:9999;min-width:300px;box-shadow:0 4px 12px rgba(0,0,0,.15)';
  d.innerHTML = `${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 5000);
}

// ─── Section navigation ───────────────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(`${name}-section`)?.classList.add('active');
  document.querySelectorAll('.sidebar .nav-link').forEach(l => {
    if (l.getAttribute('onclick')?.includes(`'${name}'`)) l.classList.add('active');
  });
  if (name === 'dashboard') loadDashboard();
  if (name === 'vehicles')  renderVehicleTypes();
  if (name === 'requests')  loadRequests();
  if (name === 'history')   loadHistory();
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken();
  if (!token) { showAlert('Please log in first.', 'error'); setTimeout(() => window.location.href = 'sign in.html', 1500); return; }

  const user = getCurrentUser();
  if (!user || user.role !== 'transport') {
    showAlert('Access denied. Transport accounts only.', 'error');
    setTimeout(logout, 2000);
    return;
  }

  document.getElementById('userWelcome').textContent = user.fullName || 'Transport Manager';
  await loadDashboard();

  // Modal buttons
  document.getElementById('modalAcceptBtn')?.addEventListener('click', () => { if (stagedBookingId) handleAction(stagedBookingId, 'accept'); });
  document.getElementById('modalRejectBtn')?.addEventListener('click', () => { if (stagedBookingId) handleAction(stagedBookingId, 'reject'); });
});

// ─── Dashboard overview ───────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const res = await apiRequest(`${API}/stats`);
    if (res.success) {
      const s = res.stats;
      setText('statVehicleTypes',  s.vehicleTypes    || VEHICLE_TYPES.length);
      setText('statPending',       s.pendingRequests || 0);
      setText('statConfirmed',     s.confirmedTrips  || 0);
      setText('statEarnings',      '₹' + (s.totalEarnings || 0).toLocaleString('en-IN'));
      const badge = document.getElementById('requestsBadge');
      if (badge) badge.textContent = s.pendingRequests || 0;
    }
  } catch (err) { console.error('Stats error:', err); }

  // Render first 4 vehicle cards in overview
  renderVehicleTypesPreview();

  // Load recent requests
  try {
    const res = await apiRequest(`${API}/bookings/requests`);
    renderRecentRequests((res.requests || []).slice(0, 5));
  } catch (err) { renderRecentRequests([]); }
}

// ─── Vehicle types ────────────────────────────────────────────────────────────
function renderVehicleTypes() {
  const grid = document.getElementById('vehicleTypesGrid');
  if (!grid) return;
  grid.innerHTML = VEHICLE_TYPES.map(v => vehicleCard(v, true)).join('');
}

function renderVehicleTypesPreview() {
  const grid = document.getElementById('vehicleTypesPreview');
  if (!grid) return;
  grid.innerHTML = VEHICLE_TYPES.slice(0, 4).map(v => vehicleCard(v, false)).join('');
}

function vehicleCard(v, full) {
  const catColor = { Budget:'success', Standard:'warning', Premium:'primary' }[v.category] || 'secondary';
  return `
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body p-3">
        <div class="d-flex align-items-center gap-2 mb-2">
          <span style="font-size:26px">${v.emoji}</span>
          <div>
            <h6 class="mb-0 fw-bold">${esc(v.type)}</h6>
            <small class="text-muted">${v.seats} seats · ${v.fuel}</small>
          </div>
          <span class="badge bg-${catColor} ms-auto">${v.category}</span>
        </div>
        <hr class="my-2">
        <div class="row g-1 small">
          <div class="col-6 text-muted">Price/km</div>   <div class="col-6 fw-semibold text-primary">₹${v.pricePerKm}/km</div>
          <div class="col-6 text-muted">Min fare</div>   <div class="col-6">₹${v.minFare}</div>
          <div class="col-6 text-muted">AC</div>         <div class="col-6">${v.ac ? '<span class="badge bg-info text-dark">AC</span>' : '<span class="badge bg-secondary">Non-AC</span>'}</div>
          ${full ? `<div class="col-12 text-muted mt-1">${esc(v.extras)}</div>` : ''}
        </div>
      </div>
    </div>`;
}

// ─── Recent requests on overview ─────────────────────────────────────────────
function renderRecentRequests(requests) {
  const el = document.getElementById('recentRequestsContainer');
  if (!el) return;
  if (!requests.length) { el.innerHTML = '<p class="text-muted small">No pending transport requests.</p>'; return; }
  el.innerHTML = requests.map(r => `
    <div class="border-bottom py-2 d-flex align-items-center gap-2">
      <div class="flex-grow-1">
        <strong class="small">${esc(r.bookingId)}</strong>
        <span class="text-muted small ms-2">${esc(r.customer?.name||'')}</span>
        <span class="badge bg-${vehicleColor(r.transport?.vehicleType)} ms-2 small">${esc(r.transport?.vehicleType||'—')}</span>
      </div>
      <div class="d-flex gap-1">
        <button class="btn btn-success btn-sm py-0 px-2" onclick="handleAction('${r.bookingId}','accept')">✓</button>
        <button class="btn btn-danger  btn-sm py-0 px-2" onclick="handleAction('${r.bookingId}','reject')">✕</button>
        <button class="btn btn-outline-secondary btn-sm py-0 px-2" onclick="viewDetail('${r.bookingId}')">👁</button>
      </div>
    </div>`).join('');
}

// ─── Requests table ───────────────────────────────────────────────────────────
async function loadRequests() {
  const tbody = document.getElementById('requestsTableBody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="text-center py-3"><span class="spinner-border spinner-border-sm"></span> Loading…</td></tr>';
  try {
    const res = await apiRequest(`${API}/bookings/requests`);
    renderRequestsTable(res.requests || []);
    const badge = document.getElementById('requestsBadge');
    if (badge) badge.textContent = (res.requests||[]).length;
  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Failed to load requests.</td></tr>';
  }
}

function renderRequestsTable(requests) {
  const tbody = document.getElementById('requestsTableBody');
  if (!tbody) return;
  if (!requests.length) { tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">No pending transport requests.</td></tr>'; return; }
  tbody.innerHTML = requests.map(r => `
    <tr>
      <td><strong class="small">${esc(r.bookingId)}</strong></td>
      <td><strong class="small">${esc(r.customer?.name||'—')}</strong><br><small class="text-muted">${esc(r.customer?.email||'')}</small></td>
      <td><span class="badge bg-${vehicleColor(r.transport?.vehicleType)}">${esc(r.transport?.vehicleType||'—')}</span></td>
      <td class="small">${(r.touristPlaces||[]).join(', ')||'—'}</td>
      <td class="small">${fmtDate(r.tripDetails?.startDate)}</td>
      <td class="small">${fmtDate(r.tripDetails?.endDate)}</td>
      <td class="small">${r.tripDetails?.travelers||1}</td>
      <td class="small"><strong>₹${(r.payment?.totalAmount||0).toLocaleString('en-IN')}</strong></td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" onclick="viewDetail('${r.bookingId}')" title="View"><i class="fas fa-eye"></i></button>
          <button class="btn btn-success"           onclick="handleAction('${r.bookingId}','accept')" title="Accept"><i class="fas fa-check"></i></button>
          <button class="btn btn-danger"            onclick="handleAction('${r.bookingId}','reject')" title="Reject"><i class="fas fa-times"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

// ─── History table ────────────────────────────────────────────────────────────
async function loadHistory() {
  const tbody = document.getElementById('historyTableBody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center py-3"><span class="spinner-border spinner-border-sm"></span> Loading…</td></tr>';
  try {
    const res = await apiRequest(`${API}/bookings/history`);
    renderHistoryTable(res.history || []);
  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Failed to load history.</td></tr>';
  }
}

function renderHistoryTable(history) {
  const tbody = document.getElementById('historyTableBody');
  if (!tbody) return;
  if (!history.length) { tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No booking history yet.</td></tr>'; return; }
  tbody.innerHTML = history.map(b => `
    <tr>
      <td><strong class="small">${esc(b.bookingId)}</strong></td>
      <td class="small">${esc(b.customer?.name||'—')}</td>
      <td><span class="badge bg-${vehicleColor(b.transport?.vehicleType)}">${esc(b.transport?.vehicleType||'—')}</span></td>
      <td class="small">${fmtDate(b.tripDetails?.startDate)}</td>
      <td class="small">${fmtDate(b.tripDetails?.endDate)}</td>
      <td class="small">${b.tripDetails?.travelers||1}</td>
      <td class="small"><strong>₹${(b.payment?.totalAmount||0).toLocaleString('en-IN')}</strong></td>
      <td><span class="badge bg-${statusColor(b.status)}">${b.status||'—'}</span></td>
      <td class="small">${fmtDateTime(b.confirmedAt)}</td>
    </tr>`).join('');
}

// ─── View booking detail modal ────────────────────────────────────────────────
async function viewDetail(bookingId) {
  const content = document.getElementById('bookingDetailContent');
  if (!content) return;
  content.innerHTML = '<p class="text-center py-4"><span class="spinner-border spinner-border-sm"></span> Loading…</p>';

  const modal = new bootstrap.Modal(document.getElementById('bookingDetailModal'));
  modal.show();
  stagedBookingId = bookingId;

  try {
    const res = await apiRequest(`${API}/bookings/${bookingId}`);
    const b = res.booking || res.data || res;
    const vehicleSpec = VEHICLE_TYPES.find(v => v.type === b.transport?.vehicleType);

    const isConfirmed = b.transportConfirmed;
    const isCancelled = b.status === 'cancelled';

    document.getElementById('modalAcceptBtn').style.display = (isConfirmed||isCancelled) ? 'none' : '';
    document.getElementById('modalRejectBtn').style.display = isCancelled ? 'none' : '';

    content.innerHTML = `
      <div class="row g-3">
        <div class="col-md-6">
          <h6 class="fw-bold border-bottom pb-1">Booking Info</h6>
          <table class="table table-sm table-borderless mb-0 small">
            <tr><td class="text-muted">Booking ID</td><td><strong>${esc(b.bookingId||b._id)}</strong></td></tr>
            <tr><td class="text-muted">Tour</td><td>${esc(b.tourName||'—')}</td></tr>
            <tr><td class="text-muted">Places</td><td>${(b.touristPlaces||[]).join(', ')||'—'}</td></tr>
            <tr><td class="text-muted">Status</td><td><span class="badge bg-${statusColor(b.status)}">${b.status}</span></td></tr>
            <tr><td class="text-muted">Amount</td><td><strong>₹${(b.payment?.totalAmount||0).toLocaleString('en-IN')}</strong></td></tr>
          </table>
        </div>
        <div class="col-md-6">
          <h6 class="fw-bold border-bottom pb-1">Customer</h6>
          <table class="table table-sm table-borderless mb-0 small">
            <tr><td class="text-muted">Name</td><td>${esc(b.user?.fullName||b.tourist?.name||'—')}</td></tr>
            <tr><td class="text-muted">Email</td><td>${esc(b.tourist?.email||'—')}</td></tr>
            <tr><td class="text-muted">Phone</td><td>${esc(b.tourist?.phone||'—')}</td></tr>
            <tr><td class="text-muted">Travelers</td><td>${b.tourist?.totalTravellers||1}</td></tr>
          </table>
        </div>
        <div class="col-md-6">
          <h6 class="fw-bold border-bottom pb-1">Transport Request</h6>
          <table class="table table-sm table-borderless mb-0 small">
            <tr><td class="text-muted">Vehicle Type</td><td><span class="badge bg-${vehicleColor(b.transport?.vehicleType)}">${esc(b.transport?.vehicleType||'—')}</span></td></tr>
            <tr><td class="text-muted">Seats</td><td>${vehicleSpec?.seats||'—'}</td></tr>
            <tr><td class="text-muted">Fuel</td><td>${vehicleSpec?.fuel||'—'}</td></tr>
            <tr><td class="text-muted">AC</td><td>${vehicleSpec ? (vehicleSpec.ac?'Yes':'No') : '—'}</td></tr>
            <tr><td class="text-muted">Price/km</td><td>${vehicleSpec ? '₹'+vehicleSpec.pricePerKm+'/km' : b.transport?.pricePerKm||'—'}</td></tr>
            <tr><td class="text-muted">Min Fare</td><td>${vehicleSpec ? '₹'+vehicleSpec.minFare : '—'}</td></tr>
            <tr><td class="text-muted">Pickup</td><td>${esc(b.transport?.pickupLocation||'—')}</td></tr>
          </table>
        </div>
        <div class="col-md-6">
          <h6 class="fw-bold border-bottom pb-1">Trip Dates</h6>
          <table class="table table-sm table-borderless mb-0 small">
            <tr><td class="text-muted">Check-in</td><td>${fmtDate(b.hotel?.fromDate)}</td></tr>
            <tr><td class="text-muted">Check-out</td><td>${fmtDate(b.hotel?.toDate)}</td></tr>
            <tr><td class="text-muted">Duration</td><td>${esc(b.tourDuration||'—')}</td></tr>
            <tr><td class="text-muted">Hotel</td><td>${esc(b.hotel?.name||'—')}</td></tr>
          </table>
        </div>
        ${b.specialRequests ? `<div class="col-12"><h6 class="fw-bold border-bottom pb-1">Notes</h6><p class="border rounded p-2 bg-light small mb-0">${esc(b.specialRequests)}</p></div>` : ''}
      </div>`;
  } catch (err) {
    content.innerHTML = `<p class="text-danger text-center py-4">Failed to load booking details: ${err.message}</p>`;
  }
}

// ─── Accept / Reject ──────────────────────────────────────────────────────────
async function handleAction(bookingId, action) {
  const msg = action === 'accept' ? 'Accept this transport booking request?' : 'Reject this transport booking request?';
  if (!confirm(msg)) return;

  const notes = prompt(action === 'accept' ? 'Add notes (optional):' : 'Reason for rejection (optional):', '') || '';

  try {
    const res = await apiRequest(`${API}/bookings/${bookingId}/handle`, {
      method: 'POST',
      body  : JSON.stringify({ action, notes })
    });
    if (res.success) {
      showAlert(res.message, 'success');
      const modal = bootstrap.Modal.getInstance(document.getElementById('bookingDetailModal'));
      if (modal) modal.hide();
      await loadRequests();
      await loadHistory();
      await loadDashboard();
    } else {
      showAlert(res.message || `Failed to ${action}`, 'error');
    }
  } catch (err) {
    showAlert(`Error: ${err.message}`, 'error');
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function esc(s) { return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function setText(id, val) { const el = document.getElementById(id); if(el) el.textContent = val??'—'; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'}) : 'N/A'; }
function fmtDateTime(d) { return d ? new Date(d).toLocaleString('en-IN',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : 'N/A'; }

function statusColor(s) {
  return { pending:'warning', transport_confirmed:'info', agent_confirmed:'secondary',
           hotel_confirmed:'primary', confirmed:'success', cancelled:'danger', payment_complete:'success' }[s] || 'secondary';
}
function vehicleColor(type) {
  const cat = VEHICLE_TYPES.find(v => v.type === type)?.category;
  return { Budget:'success', Standard:'warning', Premium:'primary' }[cat] || 'secondary';
}

// Expose to HTML onclick
window.showSection   = showSection;
window.viewDetail    = viewDetail;
window.handleAction  = handleAction;
window.loadRequests  = loadRequests;
window.loadHistory   = loadHistory;
window.logout        = logout;