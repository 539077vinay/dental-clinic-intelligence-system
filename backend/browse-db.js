#!/usr/bin/env node

// SQLite Database Browser for Dental Clinic
// Usage: node browse-db.js <command>

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'clinic.db');
const db = new Database(dbPath);

const commands = {
  'tables': () => {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' ORDER BY name
    `).all();
    console.log('\n📊 Database Tables:');
    tables.forEach(t => {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get();
      console.log(`  - ${t.name} (${count.count} records)`);
    });
  },

  'patients': () => {
    const patients = db.prepare('SELECT * FROM patients ORDER BY createdAt DESC LIMIT 10').all();
    console.log('\n👥 Recent Patients:');
    if (patients.length === 0) {
      console.log('  (No patients yet)');
    } else {
      patients.forEach(p => {
        console.log(`  - ${p.name} (${p.phone}) - ${p.email}`);
      });
    }
  },

  'appointments': () => {
    const appts = db.prepare('SELECT * FROM appointments ORDER BY date DESC LIMIT 10').all();
    console.log('\n📅 Recent Appointments:');
    if (appts.length === 0) {
      console.log('  (No appointments yet)');
    } else {
      appts.forEach(a => {
        console.log(`  - ${a.patientName} on ${a.date} ${a.time} (${a.status})`);
      });
    }
  },

  'inventory': () => {
    const inv = db.prepare('SELECT * FROM inventory ORDER BY sku').all();
    console.log('\n📦 Inventory:');
    if (inv.length === 0) {
      console.log('  (No inventory items)');
    } else {
      inv.forEach(i => {
        console.log(`  - ${i.sku}: ${i.qty} units`);
      });
    }
  },

  'clinics': () => {
    const clinics = db.prepare('SELECT * FROM clinics').all();
    console.log('\n🏥 Clinics:');
    clinics.forEach(c => {
      console.log(`  - ${c.id}: ${c.ownerName} (${c.email})`);
    });
  },

  'users': () => {
    const users = db.prepare('SELECT id, clinicId, name, email, role FROM users').all();
    console.log('\n👨‍⚕️ Users:');
    users.forEach(u => {
      console.log(`  - ${u.name} (${u.email}) - ${u.role} @ ${u.clinicId}`);
    });
  },

  'stats': () => {
    const stats = {
      users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
      patients: db.prepare('SELECT COUNT(*) as count FROM patients').get().count,
      appointments: db.prepare('SELECT COUNT(*) as count FROM appointments').get().count,
      invoices: db.prepare('SELECT COUNT(*) as count FROM invoices').get().count,
      cases: db.prepare('SELECT COUNT(*) as count FROM cases').get().count,
    };
    
    console.log('\n📈 Database Statistics:');
    console.log(`  Users: ${stats.users}`);
    console.log(`  Patients: ${stats.patients}`);
    console.log(`  Appointments: ${stats.appointments}`);
    console.log(`  Cases: ${stats.cases}`);
    console.log(`  Invoices: ${stats.invoices}`);
  },

  'query': () => {
    if (process.argv.length < 4) {
      console.log('Usage: node browse-db.js query "SELECT * FROM patients"');
      return;
    }
    const sql = process.argv.slice(3).join(' ');
    try {
      const results = db.prepare(sql).all();
      console.log('\n📋 Query Results:');
      console.log(JSON.stringify(results, null, 2));
    } catch (e) {
      console.error('❌ Query Error:', e.message);
    }
  }
};

const cmd = process.argv[2] || 'stats';

if (commands[cmd]) {
  commands[cmd]();
} else {
  console.log('\n🗄️  SQLite Database Browser');
  console.log('Available commands:');
  console.log('  node browse-db.js tables          - Show all tables');
  console.log('  node browse-db.js patients        - Show recent patients');
  console.log('  node browse-db.js appointments    - Show recent appointments');
  console.log('  node browse-db.js inventory       - Show inventory');
  console.log('  node browse-db.js clinics         - Show clinics');
  console.log('  node browse-db.js users           - Show users');
  console.log('  node browse-db.js stats           - Show statistics');
  console.log('  node browse-db.js query "SQL"     - Run custom SQL query');
}
