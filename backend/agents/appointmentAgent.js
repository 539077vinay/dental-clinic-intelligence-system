/**
 * Appointment Agent
 * Monitors appointment slots and suggests optimal booking times
 */

const db = require('../db');

class AppointmentAgent {
  constructor(clinicId) {
    this.clinicId = clinicId;
    this.name = 'Appointment Agent';
    this.type = 'appointment';
  }

  async run() {
    console.log(`[${this.name}] Running for clinic: ${this.clinicId}`);
    
    try {
      const appointments = db.getAppointmentsByClinic(this.clinicId);
      const clinic = db.getClinic(this.clinicId);
      
      // Separate upcoming and completed appointments
      const now = new Date();
      const upcoming = [];
      const completed = [];
      
      appointments.forEach(apt => {
        try {
          const apptDate = new Date(apt.date);
          if (apptDate >= now) {
            upcoming.push(apt);
          } else {
            completed.push(apt);
          }
        } catch (e) {
          // If date parsing fails, treat as completed
          completed.push(apt);
        }
      });
      
      // Analyze slots
      const analysis = this.analyzeSlots(appointments);
      
      const result = {
        agent: this.name,
        timestamp: new Date().toISOString(),
        clinicId: this.clinicId,
        analysis: analysis,
        appointments: {
          total: appointments.length,
          upcoming: upcoming.length,
          completed: completed.length,
          data: appointments.map(apt => ({
            id: apt.id,
            patientName: apt.patientName,
            phone: apt.phone,
            email: apt.email,
            date: apt.date,
            time: apt.time,
            status: apt.status,
            patient: apt.patient,
            createdAt: apt.createdAt,
            type: new Date(apt.date) >= now ? 'upcoming' : 'completed'
          }))
        },
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      console.log(`[${this.name}] Analysis:`, analysis);
      return result;
    } catch (error) {
      console.error(`[${this.name}] Error:`, error.message);
      throw error;
    }
  }

  analyzeSlots(appointments) {
    const totalSlots = 40; // Assume 8 slots per day, 5 days
    const bookedSlots = appointments.length;
    const availableSlots = totalSlots - bookedSlots;
    const occupancyRate = ((bookedSlots / totalSlots) * 100).toFixed(2);

    return {
      totalSlots,
      bookedSlots,
      availableSlots,
      occupancyRate: `${occupancyRate}%`,
      recommendation: availableSlots > 10 ? 'Good availability' : 'Getting full, consider adding slots',
      peakTime: this.identifyPeakTime(appointments),
      action: 'Monitoring slots for optimal booking suggestions'
    };
  }

  identifyPeakTime(appointments) {
    if (appointments.length === 0) return 'No data';
    
    const timeMap = {};
    appointments.forEach(appt => {
      const hour = new Date(appt.scheduledFor).getHours();
      timeMap[hour] = (timeMap[hour] || 0) + 1;
    });
    
    const peak = Object.entries(timeMap).sort((a, b) => b[1] - a[1])[0];
    return peak ? `${peak[0]}:00 (${peak[1]} appointments)` : 'No data';
  }
}

module.exports = AppointmentAgent;
