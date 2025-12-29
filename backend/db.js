const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, process.env.DATABASE_PATH || './clinic.db');

// Initialize database with error handling
let db;
try {
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  console.log(`✅ Database connected: ${dbPath}`);
} catch (error) {
  console.error(`❌ Database connection failed: ${error.message}`);
  process.exit(1);
}

function now() { return new Date().toISOString(); }

function init() {
  try {
    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        clinicId TEXT NOT NULL,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'owner',
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS clinics (
        id TEXT PRIMARY KEY,
        ownerUserId TEXT,
        ownerName TEXT,
        email TEXT,
        active INTEGER DEFAULT 1,
        whatsapp TEXT,
        workingHours TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS doctors (
        id TEXT PRIMARY KEY,
        clinicId TEXT NOT NULL,
        name TEXT,
        meta TEXT,
        FOREIGN KEY (clinicId) REFERENCES clinics(id)
      );

      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        clinicId TEXT NOT NULL,
        name TEXT,
        price REAL DEFAULT 0,
        FOREIGN KEY (clinicId) REFERENCES clinics(id)
      );

      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        clinicId TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        createdAt TEXT,
        FOREIGN KEY (clinicId) REFERENCES clinics(id)
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clinicId TEXT NOT NULL,
        sku TEXT NOT NULL,
        qty INTEGER DEFAULT 0,
        UNIQUE(clinicId, sku),
        FOREIGN KEY (clinicId) REFERENCES clinics(id)
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        clinicId TEXT NOT NULL,
        patientName TEXT,
        phone TEXT,
        email TEXT,
        date TEXT,
        time TEXT,
        status TEXT DEFAULT 'booked',
        patient TEXT,
        createdAt TEXT,
        FOREIGN KEY (clinicId) REFERENCES clinics(id)
      );

      CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        clinicId TEXT NOT NULL,
        appointmentId TEXT,
        patient TEXT,
        status TEXT DEFAULT 'ready',
        createdAt TEXT,
        FOREIGN KEY (clinicId) REFERENCES clinics(id)
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        clinicId TEXT NOT NULL,
        caseId TEXT,
        amount REAL DEFAULT 0,
        paid INTEGER DEFAULT 0,
        createdAt TEXT,
        FOREIGN KEY (clinicId) REFERENCES clinics(id)
      );

      CREATE TABLE IF NOT EXISTS purchase_orders (
        id TEXT PRIMARY KEY,
        clinicId TEXT NOT NULL,
        sku TEXT,
        qty INTEGER DEFAULT 0,
        status TEXT DEFAULT 'created',
        createdAt TEXT,
        FOREIGN KEY (clinicId) REFERENCES clinics(id)
      );

      CREATE TABLE IF NOT EXISTS vendors (
        id TEXT PRIMARY KEY,
        email TEXT
      );
    `);

    // Insert default vendor if not exists
    const vendorCount = db.prepare('SELECT COUNT(*) as count FROM vendors').get();
    if (vendorCount.count === 0) {
      db.prepare('INSERT INTO vendors (id, email) VALUES (?, ?)').run('vendor-1', 'vendor@example.com');
    }
    
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error(`❌ Database initialization failed: ${error.message}`);
    throw error;
  }
}

// Clinics
function upsertClinic(clinic) {
  try {
    const existing = db.prepare('SELECT id FROM clinics WHERE id = ?').get(clinic.id);
    if (existing) {
      db.prepare(`
        UPDATE clinics SET 
        ownerUserId = ?, ownerName = ?, email = ?, active = ?, 
        whatsapp = ?, workingHours = ?, createdAt = ?
        WHERE id = ?
      `).run(clinic.ownerUserId, clinic.ownerName, clinic.email, clinic.active, 
             clinic.whatsapp, clinic.workingHours, clinic.createdAt, clinic.id);
    } else {
      db.prepare(`
        INSERT INTO clinics (id, ownerUserId, ownerName, email, active, whatsapp, workingHours, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(clinic.id, clinic.ownerUserId, clinic.ownerName, clinic.email, 
             clinic.active || 1, clinic.whatsapp, clinic.workingHours, clinic.createdAt);
    }
    return { success: true };
  } catch (error) {
    console.error('❌ upsertClinic error:', error.message);
    throw error;
  }
}

function getClinic(id) {
  try {
    return db.prepare('SELECT * FROM clinics WHERE id = ?').get(id);
  } catch (error) {
    console.error('❌ getClinic error:', error.message);
    throw error;
  }
}

function getAllClinics() {
  try {
    return db.prepare('SELECT * FROM clinics').all();
  } catch (error) {
    console.error('❌ getAllClinics error:', error.message);
    throw error;
  }
}

// Users
function addUser(user) {
  try {
    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(user.id);
    if (existing) {
      db.prepare(`
        UPDATE users SET clinicId = ?, name = ?, email = ?, password = ?, role = ?, createdAt = ?
        WHERE id = ?
      `).run(user.clinicId, user.name, user.email, user.password, user.role, user.createdAt, user.id);
    } else {
      db.prepare(`
        INSERT INTO users (id, clinicId, name, email, password, role, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(user.id, user.clinicId, user.name, user.email, user.password, user.role, user.createdAt);
    }
    return { success: true };
  } catch (error) {
    console.error('❌ addUser error:', error.message);
    throw error;
  }
}

function getUserByEmail(email) {
  try {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  } catch (error) {
    console.error('❌ getUserByEmail error:', error.message);
    throw error;
  }
}

// Doctors
function addDoctor(doctor) {
  const existing = db.prepare('SELECT id FROM doctors WHERE id = ?').get(doctor.id);
  if (existing) {
    db.prepare('UPDATE doctors SET clinicId = ?, name = ?, meta = ? WHERE id = ?')
      .run(doctor.clinicId, doctor.name, doctor.meta, doctor.id);
  } else {
    db.prepare('INSERT INTO doctors (id, clinicId, name, meta) VALUES (?, ?, ?, ?)')
      .run(doctor.id, doctor.clinicId, doctor.name, doctor.meta);
  }
}

function getDoctorsByClinic(clinicId) {
  return db.prepare('SELECT * FROM doctors WHERE clinicId = ?').all(clinicId);
}

// Services
function addService(service) {
  const existing = db.prepare('SELECT id FROM services WHERE id = ?').get(service.id);
  if (existing) {
    db.prepare('UPDATE services SET clinicId = ?, name = ?, price = ? WHERE id = ?')
      .run(service.clinicId, service.name, service.price, service.id);
  } else {
    db.prepare('INSERT INTO services (id, clinicId, name, price) VALUES (?, ?, ?, ?)')
      .run(service.id, service.clinicId, service.name, service.price);
  }
}

function getServicesByClinic(clinicId) {
  return db.prepare('SELECT * FROM services WHERE clinicId = ?').all(clinicId);
}

// Patients
function addPatient(patient) {
  try {
    const existing = db.prepare('SELECT id FROM patients WHERE id = ?').get(patient.id);
    if (existing) {
      db.prepare('UPDATE patients SET clinicId = ?, name = ?, phone = ?, email = ?, createdAt = ? WHERE id = ?')
        .run(patient.clinicId, patient.name, patient.phone, patient.email, patient.createdAt, patient.id);
    } else {
      db.prepare('INSERT INTO patients (id, clinicId, name, phone, email, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
        .run(patient.id, patient.clinicId, patient.name, patient.phone, patient.email, patient.createdAt);
    }
    return { success: true };
  } catch (error) {
    console.error('❌ addPatient error:', error.message);
    throw error;
  }
}

function getPatientsByClinic(clinicId) {
  try {
    return db.prepare('SELECT * FROM patients WHERE clinicId = ? ORDER BY createdAt DESC').all(clinicId);
  } catch (error) {
    console.error('❌ getPatientsByClinic error:', error.message);
    throw error;
  }
}

function getPatientById(id) {
  try {
    return db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  } catch (error) {
    console.error('❌ getPatientById error:', error.message);
    throw error;
  }
}

// Inventory
function addInventory(item) {
  const existing = db.prepare('SELECT id FROM inventory WHERE clinicId = ? AND sku = ?').get(item.clinicId, item.sku);
  if (existing) {
    db.prepare('UPDATE inventory SET qty = qty + ? WHERE clinicId = ? AND sku = ?')
      .run(item.qty || 0, item.clinicId, item.sku);
  } else {
    db.prepare('INSERT INTO inventory (clinicId, sku, qty) VALUES (?, ?, ?)')
      .run(item.clinicId, item.sku, item.qty || 0);
  }
}

function getInventoryByClinic(clinicId) {
  return db.prepare('SELECT * FROM inventory WHERE clinicId = ? ORDER BY sku').all(clinicId);
}

function decrementInventory(clinicId, sku, amount = 1) {
  const row = db.prepare('SELECT qty FROM inventory WHERE clinicId = ? AND sku = ?').get(clinicId, sku);
  if (!row) return false;
  db.prepare('UPDATE inventory SET qty = MAX(0, qty - ?) WHERE clinicId = ? AND sku = ?')
    .run(amount, clinicId, sku);
  return true;
}

// Appointments
function addAppointment(appt) {
  db.prepare(`
    INSERT INTO appointments (id, clinicId, patientName, phone, email, date, time, status, patient, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(appt.id, appt.clinicId, appt.patientName, appt.phone, appt.email, appt.date, appt.time, 
         appt.status || 'booked', appt.patient, appt.createdAt);
}

function getAppointmentsByClinic(clinicId) {
  return db.prepare('SELECT * FROM appointments WHERE clinicId = ? ORDER BY date DESC, time DESC').all(clinicId);
}

// Cases
function addCase(c) {
  db.prepare('INSERT INTO cases (id, clinicId, appointmentId, patient, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
    .run(c.id, c.clinicId, c.appointmentId, c.patient, c.status || 'ready', c.createdAt || now());
}

function getCasesByClinic(clinicId) {
  return db.prepare('SELECT * FROM cases WHERE clinicId = ? ORDER BY createdAt DESC').all(clinicId);
}

// Invoices
function addInvoice(inv) {
  db.prepare(`
    INSERT INTO invoices (id, clinicId, caseId, amount, paid, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(inv.id, inv.clinicId, inv.caseId, inv.amount, inv.paid || 0, inv.createdAt || now());
}

function getInvoicesByClinic(clinicId) {
  return db.prepare('SELECT * FROM invoices WHERE clinicId = ? ORDER BY createdAt DESC').all(clinicId);
}

function getInvoiceById(id) {
  return db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
}

function setInvoicePaid(id) {
  const result = db.prepare('UPDATE invoices SET paid = 1 WHERE id = ?').run(id);
  return result.changes > 0;
}

// Purchase Orders
function addPurchaseOrder(po) {
  db.prepare('INSERT INTO purchase_orders (id, clinicId, sku, qty, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
    .run(po.id, po.clinicId, po.sku, po.qty, po.status || 'created', po.createdAt || now());
}

// Vendors
function getVendors() {
  return db.prepare('SELECT * FROM vendors').all();
}

module.exports = {
  init,
  upsertClinic,
  getClinic,
  getAllClinics,
  addUser,
  getUserByEmail,
  addDoctor,
  getDoctorsByClinic,
  addService,
  getServicesByClinic,
  addPatient,
  getPatientsByClinic,
  getPatientById,
  addInventory,
  getInventoryByClinic,
  decrementInventory,
  addAppointment,
  getAppointmentsByClinic,
  addCase,
  getCasesByClinic,
  addInvoice,
  getInvoicesByClinic,
  getInvoiceById,
  setInvoicePaid,
  addPurchaseOrder,
  getVendors,
  db
};

