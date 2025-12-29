/**
 * Revenue Agent
 * Tracks unpaid invoices and manages outstanding payments
 */

const db = require('../db');

class RevenueAgent {
  constructor(clinicId) {
    this.clinicId = clinicId;
    this.name = 'Revenue Agent';
    this.type = 'revenue';
  }

  async run() {
    console.log(`[${this.name}] Running for clinic: ${this.clinicId}`);
    
    try {
      const invoices = db.getInvoicesByClinic(this.clinicId);
      const clinic = db.getClinic(this.clinicId);
      
      // Analyze revenue
      const analysis = this.analyzeRevenue(invoices);
      
      // Send notifications for unpaid invoices
      const notified = this.notifyUnpaid(invoices, clinic);
      
      const result = {
        agent: this.name,
        timestamp: new Date().toISOString(),
        clinicId: this.clinicId,
        analysis: analysis,
        notified: notified,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      console.log(`[${this.name}] Analysis:`, analysis);
      console.log(`[${this.name}] Notified ${notified.length} patients`);
      
      return result;
    } catch (error) {
      console.error(`[${this.name}] Error:`, error.message);
      throw error;
    }
  }

  analyzeRevenue(invoices) {
    const paid = invoices.filter(i => i.paid).length;
    const unpaid = invoices.filter(i => !i.paid).length;
    const totalAmount = invoices.reduce((sum, i) => sum + (i.amount || 0), 0);
    const paidAmount = invoices.filter(i => i.paid).reduce((sum, i) => sum + (i.amount || 0), 0);
    const unpaidAmount = totalAmount - paidAmount;
    const collectionRate = totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(2) : '0.00';

    return {
      totalInvoices: invoices.length,
      paidInvoices: paid,
      unpaidInvoices: unpaid,
      totalAmount: totalAmount.toFixed(2),
      paidAmount: paidAmount.toFixed(2),
      unpaidAmount: unpaidAmount.toFixed(2),
      collectionRate: `${collectionRate}%`,
      recommendation: unpaid > 5 ? 'High number of unpaid invoices - escalate follow-up' : 'Collection on track',
      action: `Sending reminders to ${unpaid} patients with unpaid invoices`
    };
  }

  notifyUnpaid(invoices, clinic) {
    const unpaid = invoices.filter(i => !i.paid);
    const notifications = [];

    unpaid.forEach(invoice => {
      const notification = {
        invoiceId: invoice.id,
        amount: invoice.amount,
        daysOverdue: this.calculateDaysOverdue(invoice.createdAt),
        status: 'notification_sent'
      };
      
      // Log notification (in real system, would send SMS/WhatsApp)
      if (clinic && clinic.whatsapp) {
        console.log(`[${this.name}] WhatsApp to ${clinic.whatsapp}: Invoice ${invoice.id} for $${invoice.amount} is pending. Please pay.`);
      }
      
      notifications.push(notification);
    });

    return notifications;
  }

  calculateDaysOverdue(createdAt) {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return days;
  }
}

module.exports = RevenueAgent;
