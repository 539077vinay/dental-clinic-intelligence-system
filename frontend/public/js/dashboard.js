// Global state
let state = { token: null, clinicId: null };

// API helper
async function api(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (state.token) opts.headers['Authorization'] = `Bearer ${state.token}`;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data;
}

// Toast notifications
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type === 'error' ? 'error' : ''}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/pages/login.html';
});

// Panel switching
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const panelName = item.dataset.panel;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('visible'));
    item.classList.add('active');
    document.getElementById(panelName + 'Panel').classList.add('visible');
  });
});

// Check auth on load
window.addEventListener('load', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/pages/login.html';
    return;
  }
  state.token = token;
  const decoded = JSON.parse(atob(token.split('.')[1]));
  state.clinicId = decoded.clinicId;
  document.getElementById('clinicName').textContent = `Clinic: ${state.clinicId}`;
  
  // Hamburger menu toggle
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('toggleSidebarBtn');
  const navMenu = document.getElementById('navMenu');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      navMenu.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && (sidebar.classList.contains('open') || navMenu.classList.contains('open'))) {
        sidebar.classList.remove('open');
        navMenu.classList.remove('open');
      }
    });
  }
  
  // Update active menu link
  const currentPage = window.location.pathname.replace(/\/$/, '') || '/pages/dashboard.html';
  document.querySelectorAll('.nav-menu a').forEach(link => {
    if (link.getAttribute('href') === currentPage || (currentPage === '/' && link.getAttribute('href') === '/pages/dashboard.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  await loadDashboard();
});

// Load dashboard data
async function loadDashboard() {
  try {
    const data = await api(`/api/dashboard/${state.clinicId}`);
    const clinic = data.clinic || {};
    
    // Update stats
    document.getElementById('apptCount').textContent = (data.appointments || []).length;
    document.getElementById('caseCount').textContent = (data.cases || []).length;
    document.getElementById('invoiceCount').textContent = (data.invoices || []).length;
    const totalRevenue = (data.invoices || []).reduce((s, i) => s + (i.amount || 0), 0);
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toFixed(2);

    // Recent appointments
    const apptHtml = (data.appointments || []).slice(-5).map(a => `
      <div class="list-item">
        <strong>${a.patient?.name || 'Unknown'}</strong>
        <small>${new Date(a.time).toLocaleString()} - ${a.status}</small>
      </div>
    `).join('') || '<p class="empty">No appointments</p>';
    document.getElementById('appointmentsList').innerHTML = apptHtml;

    // Pending invoices
    const unpaid = (data.invoices || []).filter(i => !i.paid);
    const invHtml = unpaid.map(i => `
      <div class="list-item">
        <strong>Invoice ${i.id.slice(-6)}</strong>
        <small>$${i.amount?.toFixed(2) || '0'} - Unpaid <button class="btn small" onclick="payInvoice('${i.id}')">Pay</button></small>
      </div>
    `).join('') || '<p class="empty">No pending invoices</p>';
    document.getElementById('invoicesList').innerHTML = invHtml;

    // Setup form
    document.getElementById('setupClinicId').value = clinic.id || state.clinicId;
    document.getElementById('setupOwnerName').value = clinic.ownerName || '';
    document.getElementById('setupEmail').value = clinic.email || '';
    document.getElementById('setupWhatsapp').value = clinic.whatsapp || '';

    // Services dropdown
    document.getElementById('appointmentService').innerHTML = '<option value="">Select service</option>' + 
      (data.services || []).map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    // Cases dropdown
    const cases = (data.cases || []);
    document.getElementById('invoiceCaseId').innerHTML = '<option value="">Select case</option>' + 
      cases.map(c => `<option value="${c.id}">${c.id.slice(-6)}</option>`).join('');

    // All appointments
    const allApptsHtml = (data.appointments || []).map(a => `
      <div class="list-item">
        <strong>${a.patient?.name || 'Unknown'}</strong>
        <small>${new Date(a.time).toLocaleString()} - ${a.status}</small>
      </div>
    `).join('') || '<p class="empty">No appointments</p>';
    document.getElementById('allAppointmentsList').innerHTML = allApptsHtml;

    // All invoices
    const allInvsHtml = (data.invoices || []).map(i => `
      <div class="list-item">
        <strong>Invoice ${i.id.slice(-6)} - $${i.amount?.toFixed(2) || '0'}</strong>
        <small>${i.paid ? '✅ Paid' : '❌ Unpaid'} ${!i.paid ? `<button class="btn small" onclick="payInvoice('${i.id}')">Pay</button>` : ''}</small>
      </div>
    `).join('') || '<p class="empty">No invoices</p>';
    document.getElementById('allInvoicesList').innerHTML = allInvsHtml;

  } catch (e) {
    console.error(e);
    showToast('Failed to load dashboard', 'error');
  }
}

// CLINIC SETUP
async function setWhatsapp() {
  const number = document.getElementById('setupWhatsapp').value;
  if (!number) { showToast('Enter WhatsApp number', 'error'); return; }
  try {
    await api('/api/set-whatsapp', 'POST', { clinicId: state.clinicId, number });
    showToast('WhatsApp updated');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function setWorkingHours() {
  const hours = {
    mon: document.getElementById('hourMon').value,
    tue: document.getElementById('hourTue').value,
    wed: document.getElementById('hourWed').value,
    thu: document.getElementById('hourThu').value,
    fri: document.getElementById('hourFri').value,
    sat: document.getElementById('hourSat').value
  };
  try {
    await api('/api/set-hours', 'POST', { clinicId: state.clinicId, hours });
    showToast('Working hours saved');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function addDoctor() {
  const name = document.getElementById('doctorName').value;
  const specialty = document.getElementById('doctorSpecialty').value;
  if (!name) { showToast('Enter doctor name', 'error'); return; }
  try {
    const doctor = { id: `dr-${Date.now()}`, name, specialty };
    const res = await api('/api/add-doctor', 'POST', { clinicId: state.clinicId, doctor });
    document.getElementById('doctorName').value = '';
    document.getElementById('doctorSpecialty').value = '';
    const html = (res.doctors || []).map(d => `<div class="list-item"><strong>${d.name}</strong><small>${d.specialty || 'N/A'}</small></div>`).join('');
    document.getElementById('doctorsList').innerHTML = html;
    showToast('Doctor added');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function addService() {
  const name = document.getElementById('serviceName').value;
  const price = parseFloat(document.getElementById('servicePrice').value);
  if (!name || !price) { showToast('Enter service and price', 'error'); return; }
  try {
    const service = { id: `srv-${Date.now()}`, name, price };
    const res = await api('/api/add-service', 'POST', { clinicId: state.clinicId, service });
    document.getElementById('serviceName').value = '';
    document.getElementById('servicePrice').value = '';
    const html = (res.services || []).map(s => `<div class="list-item"><strong>${s.name}</strong><small>$${s.price?.toFixed(2) || '0'}</small></div>`).join('');
    document.getElementById('servicesList').innerHTML = html;
    showToast('Service added');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// APPOINTMENTS
async function bookAppointment() {
  const name = document.getElementById('patientName').value;
  const phone = document.getElementById('patientPhone').value;
  const email = document.getElementById('patientEmail').value;
  if (!name || !phone || !email) { showToast('Fill patient info', 'error'); return; }
  try {
    const patient = { id: `p-${Date.now()}`, name, phone, email };
    await api('/api/book', 'POST', { clinicId: state.clinicId, patient });
    document.getElementById('patientName').value = '';
    document.getElementById('patientPhone').value = '';
    document.getElementById('patientEmail').value = '';
    showToast('Appointment booked');
    await loadDashboard();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// INVENTORY
async function addInventoryItem() {
  const sku = document.getElementById('inventorySku').value;
  const qty = parseInt(document.getElementById('inventoryQty').value);
  if (!sku || !qty) { showToast('Enter SKU and quantity', 'error'); return; }
  try {
    await api('/api/add-inventory', 'POST', { clinicId: state.clinicId, item: { sku, qty } });
    document.getElementById('inventorySku').value = '';
    document.getElementById('inventoryQty').value = '0';
    showToast('Item added');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// AGENTS
async function runAgent(type) {
  try {
    await api('/api/agents/run', 'POST', { clinicId: state.clinicId });
    const names = { appointment: 'Appointment', revenue: 'Revenue', case: 'Case', inventory: 'Inventory' };
    showToast(`${names[type]} Agent executed`);
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function executeCommand() {
  const cmd = document.getElementById('aiCommand').value;
  if (!cmd) { showToast('Enter a command', 'error'); return; }
  const log = document.getElementById('commandLog');
  log.innerHTML = '<p>Agents discussing: ' + cmd + '</p><p>Execution plan:</p>';
  try {
    await api('/api/agents/run', 'POST', { clinicId: state.clinicId });
    log.innerHTML += '<p>✅ Agents executed command</p>';
    document.getElementById('aiCommand').value = '';
  } catch (e) {
    log.innerHTML += `<p>❌ Error: ${e.message}</p>`;
  }
}

// BILLING
async function createInvoice() {
  const caseId = document.getElementById('invoiceCaseId').value;
  const amount = parseFloat(document.getElementById('invoiceAmount').value);
  if (!caseId || !amount) { showToast('Select case and amount', 'error'); return; }
  try {
    await api('/api/invoice', 'POST', { clinicId: state.clinicId, caseId, amount });
    document.getElementById('invoiceAmount').value = '';
    showToast('Invoice created');
    await loadDashboard();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function payInvoice(id) {
  try {
    await api('/api/pay', 'POST', { invoiceId: id });
    showToast('Invoice paid');
    await loadDashboard();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function generateMonthlyReport() {
  try {
    const res = await api(`/api/reports/monthly/${state.clinicId}`);
    const html = `<h4>Monthly Report</h4><p>Revenue: <strong>$${res.revenue?.toFixed(2) || '0'}</strong></p><p>Invoices: <strong>${res.invoicesCount}</strong></p>`;
    document.getElementById('monthlyReport').innerHTML = html;
    showToast('Report generated');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

function upgradePlan() {
  showToast('Stripe integration coming soon', 'error');
}
