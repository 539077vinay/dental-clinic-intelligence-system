/**
 * Inventory Agent
 * Monitors inventory levels and creates purchase orders for low stock items
 */

const db = require('../db');

class InventoryAgent {
  constructor(clinicId) {
    this.clinicId = clinicId;
    this.name = 'Inventory Agent';
    this.type = 'inventory';
    this.lowStockThreshold = 5;
  }

  async run() {
    console.log(`[${this.name}] Running for clinic: ${this.clinicId}`);
    
    try {
      const inventory = db.getInventoryByClinic(this.clinicId);
      
      // Analyze stock levels
      const analysis = this.analyzeStock(inventory);
      
      // Create purchase orders for low stock
      const purchaseOrders = this.createPurchaseOrders(inventory);
      
      const result = {
        agent: this.name,
        timestamp: new Date().toISOString(),
        clinicId: this.clinicId,
        analysis: analysis,
        purchaseOrders: purchaseOrders,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      console.log(`[${this.name}] Analysis:`, analysis);
      console.log(`[${this.name}] Created ${purchaseOrders.length} purchase orders`);
      
      return result;
    } catch (error) {
      console.error(`[${this.name}] Error:`, error.message);
      throw error;
    }
  }

  analyzeStock(inventory) {
    const total = inventory.length;
    const lowStock = inventory.filter(i => i.qty < this.lowStockThreshold).length;
    const outOfStock = inventory.filter(i => i.qty === 0).length;
    const totalValue = inventory.reduce((sum, i) => sum + ((i.qty || 0) * (i.unitPrice || 0)), 0);

    return {
      totalItems: total,
      lowStockItems: lowStock,
      outOfStockItems: outOfStock,
      totalInventoryValue: totalValue.toFixed(2),
      lowStockThreshold: this.lowStockThreshold,
      recommendation: lowStock > 3 ? 'Critical: Multiple items low in stock' : 'Stock levels healthy',
      itemsNeedingReorder: inventory
        .filter(i => i.qty < this.lowStockThreshold)
        .map(i => ({
          sku: i.sku,
          name: i.name,
          currentQty: i.qty,
          suggestedQty: 100
        }))
    };
  }

  createPurchaseOrders(inventory) {
    const lowStockItems = inventory.filter(i => i.qty < this.lowStockThreshold);
    const orders = [];

    lowStockItems.forEach(item => {
      const poId = `po-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const reorderQty = 100; // Default reorder quantity
      
      try {
        db.addPurchaseOrder({
          id: poId,
          clinicId: this.clinicId,
          sku: item.sku,
          qty: reorderQty,
          status: 'created',
          createdAt: new Date().toISOString()
        });

        orders.push({
          poId,
          sku: item.sku,
          itemName: item.name,
          quantity: reorderQty,
          status: 'created'
        });

        console.log(`[${this.name}] Created PO ${poId} for ${item.sku} (qty: ${reorderQty})`);
      } catch (e) {
        console.error(`[${this.name}] Failed to create PO:`, e.message);
      }
    });

    return orders;
  }
}

module.exports = InventoryAgent;
