const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

// Import agents
const AppointmentAgent = require('./agents/appointmentAgent');
const RevenueAgent = require('./agents/revenueAgent');
const CaseAgent = require('./agents/caseAgent');
const InventoryAgent = require('./agents/inventoryAgent');
const AICommandCenter = require('./agents/aiCommandCenter');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Immediately-invoked function to initialize DB and start server
(() => {
  try {
    db.init();

    const transporter = nodemailer.createTransport({ jsonTransport: true });

    function now() { return new Date().toISOString(); }

    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
    const PORT = process.env.PORT || 3000;

    // Auth endpoints with error handling
    app.post('/api/auth/signup', (req, res) => {
      try {
        const { id, name, email, password, clinicId } = req.body;
        if (!email || !password || !clinicId) {
          return res.status(400).json({ error: 'email, password, clinicId required' });
        }
        const hashed = bcrypt.hashSync(password, 10);
        const uid = id || `user-${Date.now()}`;
        db.addUser({ id: uid, clinicId, name: name || '', email, password: hashed, role: 'owner', createdAt: now() });
        const token = jwt.sign({ id: uid, clinicId }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ ok: true, token });
      } catch (e) {
        console.error('❌ signup error:', e.message);
        res.status(400).json({ error: e.message });
      }
    });

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = db.getUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'user not found' });
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ id: user.id, clinicId: user.clinicId }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ ok: true, token });
});

// Onboarding and clinic endpoints
app.post('/api/start-trial', (req, res) => {
  const { clinicId, ownerName, email, ownerUserId } = req.body;
  if (!clinicId || !email) return res.status(400).json({ error: 'clinicId and email required' });
  db.upsertClinic({ id: clinicId, ownerUserId: ownerUserId || null, ownerName: ownerName || null, email, active: 1, createdAt: now() });
  res.json({ ok: true, clinic: { id: clinicId, ownerName, email, active: 1 } });
});

app.post('/api/add-doctor', (req, res) => {
  const { clinicId, doctor } = req.body;
  if (!clinicId || !doctor || !doctor.id) return res.status(400).json({ error: 'clinicId and doctor with id required' });
  db.addDoctor({ id: doctor.id, clinicId, name: doctor.name || '', meta: doctor.meta || {} });
  const rows = db.getDoctorsByClinic(clinicId);
  res.json({ ok: true, doctors: rows });
});

app.post('/api/add-service', (req, res) => {
  const { clinicId, service } = req.body;
  if (!clinicId || !service || !service.id) return res.status(400).json({ error: 'clinicId and service with id required' });
  db.addService({ id: service.id, clinicId, name: service.name || '', price: service.price || 0 });
  const rows = db.getServicesByClinic(clinicId);
  res.json({ ok: true, services: rows });
});

// Patient endpoints
app.post('/api/add-patient', (req, res) => {
  const { clinicId, patient } = req.body;
  if (!clinicId || !patient || !patient.name || !patient.phone) return res.status(400).json({ error: 'clinicId, patient name and phone required' });
  const id = `pat-${Date.now()}`;
  db.addPatient({ id, clinicId, name: patient.name, phone: patient.phone, email: patient.email || '', createdAt: now() });
  const rows = db.getPatientsByClinic(clinicId);
  res.json({ ok: true, patients: rows });
});

app.get('/api/patients/:clinicId', (req, res) => {
  const clinicId = req.params.clinicId;
  const patients = db.getPatientsByClinic(clinicId);
  res.json({ ok: true, patients });
});

// Appointment endpoints
app.post('/api/book-appointment', (req, res) => {
  const { clinicId, appointment } = req.body;
  if (!clinicId || !appointment || !appointment.patientName || !appointment.phone || !appointment.date) return res.status(400).json({ error: 'clinicId, patient name, phone and date required' });
  const id = `appt-${Date.now()}`;
  db.addAppointment({ id, clinicId, patientName: appointment.patientName, phone: appointment.phone, email: appointment.email || '', date: appointment.date, time: appointment.time || '', status: 'booked', createdAt: now() });
  const rows = db.getAppointmentsByClinic(clinicId);
  res.json({ ok: true, appointments: rows });
});

app.get('/api/appointments/:clinicId', (req, res) => {
  const clinicId = req.params.clinicId;
  const appointments = db.getAppointmentsByClinic(clinicId);
  res.json({ ok: true, appointments });
});

app.post('/api/cancel-appointment', (req, res) => {
  const { clinicId, appointmentId } = req.body;
  if (!clinicId || !appointmentId) return res.status(400).json({ error: 'clinicId and appointmentId required' });
  try {
    db.db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run('cancelled', appointmentId);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Inventory endpoints
app.post('/api/add-inventory-item', (req, res) => {
  const { clinicId, item } = req.body;
  if (!clinicId || !item || !item.sku) return res.status(400).json({ error: 'clinicId and item sku required' });
  db.addInventory({ clinicId, sku: item.sku, qty: item.qty || 0 });
  const rows = db.getInventoryByClinic(clinicId);
  res.json({ ok: true, inventory: rows });
});

app.get('/api/inventory/:clinicId', (req, res) => {
  const clinicId = req.params.clinicId;
  const inventory = db.getInventoryByClinic(clinicId);
  res.json({ ok: true, inventory });
});

app.post('/api/decrement-inventory', (req, res) => {
  const { clinicId, sku, amount } = req.body;
  if (!clinicId || !sku) return res.status(400).json({ error: 'clinicId and sku required' });
  const ok = db.decrementInventory(clinicId, sku, amount || 1);
  if (!ok) return res.status(404).json({ error: 'item not found' });
  res.json({ ok: true });
});

app.post('/api/set-hours', (req, res) => {
  const { clinicId, hours } = req.body;
  if (!clinicId || !hours) return res.status(400).json({ error: 'clinicId and hours required' });
  db.upsertClinic({ id: clinicId, workingHours: JSON.stringify(hours) });
  res.json({ ok: true });
});

app.post('/api/add-inventory', (req, res) => {
  const { clinicId, item } = req.body;
  if (!clinicId || !item || !item.sku) return res.status(400).json({ error: 'clinicId and item with sku required' });
  db.addInventory({ clinicId, sku: item.sku, qty: item.qty || 0 });
  res.json({ ok: true });
});

app.post('/api/set-whatsapp', (req, res) => {
  const { clinicId, number } = req.body;
  if (!clinicId || !number) return res.status(400).json({ error: 'clinicId and number required' });
  db.upsertClinic({ id: clinicId, whatsapp: number });
  res.json({ ok: true, whatsapp: number });
});

// Booking endpoint
app.post('/api/book', (req, res) => {
  const { clinicId, patient } = req.body;
  if (!clinicId || !patient) return res.status(400).json({ error: 'clinicId and patient required' });
  const apptId = `appt-${Date.now()}`;
  db.addAppointment({ id: apptId, clinicId, patient: patient, time: now(), status: 'booked' });

  // Agents chain
  appointmentAgent(clinicId);
  const appt = { id: apptId, clinicId, patient };
  caseAgent(clinicId, appt);
  inventoryAgent(clinicId, appt);
  revenueAgent(clinicId, appt);

  const clinic = db.getClinic(clinicId);
  if (clinic && clinic.whatsapp) console.log(`WhatsApp to ${clinic.whatsapp}: Appointment confirmed for ${patient.name}`);

  res.json({ ok: true, appt: { id: apptId } });
});

app.get('/api/dashboard/:clinicId', (req, res) => {
  const clinicId = req.params.clinicId;
  const clinic = db.getClinic(clinicId) || {};
  const appointments = db.getAppointmentsByClinic(clinicId).map(a => ({ ...a, patient: a.patient }));
  const cases = db.getCasesByClinic(clinicId);
  const invoices = db.getInvoicesByClinic(clinicId);
  res.json({ clinic, appointments, cases, invoices });
});

app.get('/api/reports/monthly/:clinicId', (req, res) => {
  const clinicId = req.params.clinicId;
  const invoices = db.getInvoicesByClinic(clinicId);
  const total = invoices.reduce((s, i) => s + (i.amount || 0), 0);
  res.json({ month: new Date().toISOString(), revenue: total, invoicesCount: invoices.length });
});

// Agents
async function appointmentAgent(clinicId) {
  try {
    const agent = new AppointmentAgent(clinicId);
    return await agent.run();
  } catch (e) {
    console.error('❌ AppointmentAgent error:', e.message);
    return { agent: 'AppointmentAgent', status: 'error', error: e.message };
  }
}

async function revenueAgent(clinicId, context = {}) {
  try {
    const agent = new RevenueAgent(clinicId);
    return await agent.run();
  } catch (e) {
    console.error('❌ RevenueAgent error:', e.message);
    return { agent: 'RevenueAgent', status: 'error', error: e.message };
  }
}

async function caseAgent(clinicId, appt = null) {
  try {
    const agent = new CaseAgent(clinicId);
    return await agent.run();
  } catch (e) {
    console.error('❌ CaseAgent error:', e.message);
    return { agent: 'CaseAgent', status: 'error', error: e.message };
  }
}

async function inventoryAgent(clinicId, appt = null) {
  try {
    const agent = new InventoryAgent(clinicId);
    return await agent.run();
  } catch (e) {
    console.error('❌ InventoryAgent error:', e.message);
    return { agent: 'InventoryAgent', status: 'error', error: e.message };
  }
}

// Scheduled tasks
cron.schedule('0 7 * * *', async () => { 
  console.log('📅 Scheduled: 7:00 AppointmentAgent'); 
  const rows = db.getAllClinics(); 
  for (const clinic of rows) {
    await appointmentAgent(clinic.id);
  }
});

cron.schedule('5 7 * * *', async () => { 
  console.log('💰 Scheduled: 7:05 RevenueAgent'); 
  const rows = db.getAllClinics(); 
  for (const clinic of rows) {
    await revenueAgent(clinic.id);
  }
});

cron.schedule('10 7 * * *', async () => { 
  console.log('📋 Scheduled: 7:10 CaseAgent'); 
  const rows = db.getAllClinics(); 
  for (const clinic of rows) {
    await caseAgent(clinic.id);
  }
});

cron.schedule('15 7 * * *', async () => { 
  console.log('📦 Scheduled: 7:15 InventoryAgent'); 
  const rows = db.getAllClinics(); 
  for (const clinic of rows) {
    await inventoryAgent(clinic.id);
  }
});

// API Endpoints for Agents

// Run specific agent
app.post('/api/agents/run-appointment', async (req, res) => {
  try {
    const { clinicId } = req.body;
    if (!clinicId) return res.status(400).json({ error: 'clinicId required' });
    const result = await appointmentAgent(clinicId);
    res.json({ ok: true, data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/agents/run-revenue', async (req, res) => {
  try {
    const { clinicId } = req.body;
    if (!clinicId) return res.status(400).json({ error: 'clinicId required' });
    const result = await revenueAgent(clinicId);
    res.json({ ok: true, data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/agents/run-case', async (req, res) => {
  try {
    const { clinicId } = req.body;
    if (!clinicId) return res.status(400).json({ error: 'clinicId required' });
    const result = await caseAgent(clinicId);
    res.json({ ok: true, data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/agents/run-inventory', async (req, res) => {
  try {
    const { clinicId } = req.body;
    if (!clinicId) return res.status(400).json({ error: 'clinicId required' });
    const result = await inventoryAgent(clinicId);
    res.json({ ok: true, data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Run all agents
app.post('/api/agents/run-all', async (req, res) => {
  try {
    const { clinicId } = req.body;
    if (!clinicId) return res.status(400).json({ error: 'clinicId required' });
    
    const results = {
      appointment: await appointmentAgent(clinicId),
      revenue: await revenueAgent(clinicId),
      case: await caseAgent(clinicId),
      inventory: await inventoryAgent(clinicId)
    };
    
    res.json({ ok: true, data: results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// AI Command Center
app.post('/api/agents/command', async (req, res) => {
  try {
    const { clinicId, command } = req.body;
    if (!clinicId || !command) return res.status(400).json({ error: 'clinicId and command required' });
    
    const commandCenter = new AICommandCenter(clinicId);
    const result = await commandCenter.execute(command);
    
    res.json({ ok: true, data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Legacy endpoint - runs all agents
app.post('/api/agents/run', async (req, res) => {
  try {
    const { clinicId } = req.body;
    if (!clinicId) return res.status(400).json({ error: 'clinicId required' });
    
    const results = {
      appointment: await appointmentAgent(clinicId),
      revenue: await revenueAgent(clinicId),
      case: await caseAgent(clinicId),
      inventory: await inventoryAgent(clinicId)
    };
    
    res.json({ ok: true, data: results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Invoice endpoints
app.post('/api/invoice', (req, res) => {
  const { clinicId, caseId, amount } = req.body;
  if (!clinicId || !caseId || !amount) return res.status(400).json({ error: 'clinicId, caseId, amount required' });
  const id = `inv-${Date.now()}`;
  db.addInvoice({ id, clinicId, caseId, amount, paid: 0 });
  res.json({ ok: true, invoice: { id, clinicId, caseId, amount, paid: 0 } });
});

app.post('/api/pay', (req, res) => {
  const { invoiceId } = req.body;
  const inv = db.getInvoiceById(invoiceId);
  if (!inv) return res.status(404).json({ error: 'invoice not found' });
  db.setInvoicePaid(invoiceId);
  res.json({ ok: true, invoice: { ...inv, paid: 1 } });
});

// Root route - redirect to login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/pages/index.html'));
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
})();
