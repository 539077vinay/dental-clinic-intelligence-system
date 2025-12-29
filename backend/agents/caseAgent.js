/**
 * Case Agent
 * Creates and manages dental cases from completed appointments
 */

const db = require('../db');

class CaseAgent {
  constructor(clinicId) {
    this.clinicId = clinicId;
    this.name = 'Case Agent';
    this.type = 'case';
  }

  async run() {
    console.log(`[${this.name}] Running for clinic: ${this.clinicId}`);
    
    try {
      const appointments = db.getAppointmentsByClinic(this.clinicId);
      const existingCases = db.getCasesByClinic(this.clinicId);
      
      // Create cases for new appointments
      const newCases = this.createCasesFromAppointments(appointments, existingCases);
      
      // Verify treatment completeness
      const verification = this.verifyTreatments(existingCases);
      
      const result = {
        agent: this.name,
        timestamp: new Date().toISOString(),
        clinicId: this.clinicId,
        casesCreated: newCases,
        treatmentVerification: verification,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      console.log(`[${this.name}] Created ${newCases.length} new cases`);
      return result;
    } catch (error) {
      console.error(`[${this.name}] Error:`, error.message);
      throw error;
    }
  }

  createCasesFromAppointments(appointments, existingCases) {
    const existingApptIds = new Set(existingCases.map(c => c.appointmentId));
    const newCasesToCreate = appointments.filter(a => !existingApptIds.has(a.id));
    
    const created = [];
    newCasesToCreate.forEach(appt => {
      const caseId = `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      try {
        db.addCase({
          id: caseId,
          clinicId: this.clinicId,
          appointmentId: appt.id,
          patient: appt.patient,
          status: 'created',
          createdAt: new Date().toISOString()
        });
        
        created.push({
          caseId,
          appointmentId: appt.id,
          patient: appt.patient,
          status: 'created'
        });
        
        console.log(`[${this.name}] Created case ${caseId} for appointment ${appt.id}`);
      } catch (e) {
        console.error(`[${this.name}] Failed to create case:`, e.message);
      }
    });

    return created;
  }

  verifyTreatments(cases) {
    const verification = {
      totalCases: cases.length,
      completedTreatments: cases.filter(c => c.status === 'completed').length,
      pendingTreatments: cases.filter(c => c.status !== 'completed').length,
      treatmentStatus: cases.map(c => ({
        caseId: c.id,
        patient: c.patient,
        status: c.status
      }))
    };

    return verification;
  }
}

module.exports = CaseAgent;
