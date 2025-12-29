# AI Agents System - Dental Clinic

## Overview

The Dental Clinic application includes a comprehensive AI Agents system that automates key business processes and provides intelligent insights. The system includes 4 specialized agents and an AI Command Center for natural language interaction.

## Agent Architecture

### 1. **Appointment Agent** 📅
**Purpose:** Monitor appointment scheduling and optimize slot utilization

**Features:**
- Analyzes appointment patterns and occupancy rates
- Identifies peak booking times
- Provides recommendations for slot optimization
- Suggests optimal times for new bookings
- Tracks daily and weekly appointment trends

**API Endpoint:** `POST /api/agents/run-appointment`

**Scheduled:** Daily at 7:00 AM

**Example Response:**
```json
{
  "agent": "Appointment Agent",
  "analysis": {
    "totalSlots": 40,
    "bookedSlots": 28,
    "availableSlots": 12,
    "occupancyRate": "70.00%",
    "recommendation": "Good availability",
    "peakTime": "10:00 (8 appointments)"
  }
}
```

---

### 2. **Revenue Agent** 💰
**Purpose:** Track invoices and optimize payment collection

**Features:**
- Monitors unpaid invoices and outstanding payments
- Calculates collection rates and revenue metrics
- Sends automated payment reminders to patients
- Identifies overdue accounts
- Provides revenue forecasting

**API Endpoint:** `POST /api/agents/run-revenue`

**Scheduled:** Daily at 7:05 AM

**Example Response:**
```json
{
  "agent": "Revenue Agent",
  "analysis": {
    "totalInvoices": 25,
    "paidInvoices": 20,
    "unpaidInvoices": 5,
    "totalAmount": "5000.00",
    "collectionRate": "80.00%",
    "recommendation": "Collection on track",
    "notified": 5
  }
}
```

---

### 3. **Case Agent** 📋
**Purpose:** Manage dental cases and treatment workflows

**Features:**
- Creates cases from completed appointments
- Tracks treatment progress and status
- Manages case-to-invoice mapping
- Ensures treatment completeness
- Organizes cases by patient and status

**API Endpoint:** `POST /api/agents/run-case`

**Scheduled:** Daily at 7:10 AM

**Example Response:**
```json
{
  "agent": "Case Agent",
  "casesCreated": [
    {
      "caseId": "case-1234567890",
      "appointmentId": "apt-123",
      "patient": "John Doe",
      "status": "created"
    }
  ],
  "treatmentVerification": {
    "totalCases": 45,
    "completedTreatments": 38,
    "pendingTreatments": 7
  }
}
```

---

### 4. **Inventory Agent** 📦
**Purpose:** Monitor stock levels and manage procurement

**Features:**
- Tracks inventory items and stock levels
- Identifies low-stock items (threshold: 5 units)
- Automatically creates purchase orders
- Provides inventory value analysis
- Suggests reorder quantities based on usage

**API Endpoint:** `POST /api/agents/run-inventory`

**Scheduled:** Daily at 7:15 AM

**Example Response:**
```json
{
  "agent": "Inventory Agent",
  "analysis": {
    "totalItems": 50,
    "lowStockItems": 3,
    "outOfStockItems": 0,
    "totalInventoryValue": "15000.00",
    "recommendation": "Stock levels healthy"
  },
  "purchaseOrders": [
    {
      "poId": "po-1234567890",
      "sku": "TOOL-001",
      "quantity": 100,
      "status": "created"
    }
  ]
}
```

---

## AI Command Center 🤖

The AI Command Center allows natural language commands to trigger complex workflows.

### Available Commands

| Command | Description | Impact |
|---------|-------------|--------|
| **Reduce Cancellations** | Implement strategies to reduce no-shows | Sends reminders, identifies at-risk appointments |
| **Increase Revenue** | Optimize billing and case creation | Accelerates case-to-invoice conversion |
| **Optimize Inventory** | Manage stock and create POs | Reviews reorder points and consolidates orders |
| **Improve Appointments** | Optimize scheduling | Analyzes peak times and suggests slot changes |
| **Boost Collection** | Accelerate payment collection | Sends payment reminders and plans follow-ups |
| **Check Status** | Get clinic overview | Returns comprehensive clinic metrics |
| **Run All Agents** | Execute all agents sequentially | Full system analysis and actions |

### API Endpoint
```
POST /api/agents/command
Body: {
  "clinicId": "clinic-001",
  "command": "reduce cancellations"
}
```

---

## API Reference

### Run Individual Agent
```bash
POST /api/agents/run-appointment
POST /api/agents/run-revenue
POST /api/agents/run-case
POST /api/agents/run-inventory

Body: {
  "clinicId": "clinic-001"
}
```

### Run All Agents
```bash
POST /api/agents/run-all

Body: {
  "clinicId": "clinic-001"
}
```

### Execute AI Command
```bash
POST /api/agents/command

Body: {
  "clinicId": "clinic-001",
  "command": "your command here"
}
```

### Legacy Endpoint (All Agents)
```bash
POST /api/agents/run

Body: {
  "clinicId": "clinic-001"
}
```

---

## Frontend Integration

### Agents Page
Located at: [frontend/public/pages/agents.html](frontend/public/pages/agents.html)

**Features:**
- **Agents Tab:** Run individual or all agents with real-time status
- **AI Command Tab:** Send natural language commands with pre-built suggestions
- **Activity Logs Tab:** Track all agent executions and commands

**Usage:**
1. Click "Run Now" on any agent card to execute immediately
2. Use AI Command Center to send natural language instructions
3. View detailed results and logs for each execution
4. Click quick command buttons to populate the command input

---

## Backend Implementation

### Agent Files
```
backend/agents/
├── appointmentAgent.js
├── revenueAgent.js
├── caseAgent.js
├── inventoryAgent.js
└── aiCommandCenter.js
```

### Server Integration
- Agents are imported and initialized in `backend/server.js`
- Scheduled via node-cron at specific times
- Each agent returns structured analysis data
- Results are sent to frontend as JSON responses

---

## Scheduled Execution

Agents run automatically on a daily schedule:

| Agent | Time | Frequency |
|-------|------|-----------|
| Appointment Agent | 7:00 AM | Daily |
| Revenue Agent | 7:05 AM | Daily |
| Case Agent | 7:10 AM | Daily |
| Inventory Agent | 7:15 AM | Daily |

---

## Example Workflows

### Workflow 1: Daily Clinic Check-up
```
1. Open Agents page
2. Click "Execute All Agents"
3. Review results in Activity Logs
4. Check metrics from each agent
```

### Workflow 2: Boost Revenue Collection
```
1. Go to AI Command tab
2. Click "Boost Collection"
3. View recommendations and actions
4. Monitor payment status updates
```

### Workflow 3: Manage Inventory
```
1. Run Inventory Agent
2. Review low-stock items and suggested reorders
3. Approve automatic purchase orders
4. Track PO status
```

---

## Data Flow

```
Frontend (Agents Page)
    ↓
Backend API Endpoints (/api/agents/*)
    ↓
Agent Classes (appointmentAgent, revenueAgent, etc.)
    ↓
Database Operations (db.js)
    ↓
Analysis & Actions
    ↓
Response with Results & Recommendations
    ↓
Frontend Display & Notifications
```

---

## Error Handling

All agents include error handling with:
- Try-catch blocks for graceful failure
- Error logging to console
- Error responses with detailed messages
- Fallback responses with status indicators

Example error response:
```json
{
  "agent": "AppointmentAgent",
  "status": "error",
  "error": "Database connection failed"
}
```

---

## Future Enhancements

1. **Real-time Updates:** WebSocket integration for live agent status
2. **Custom Schedules:** Allow clinics to configure agent run times
3. **Advanced Analytics:** ML-based predictions and recommendations
4. **Email Integration:** Send agent reports directly to clinic email
5. **Mobile Notifications:** Push notifications for important agent actions
6. **Agent History:** Archive past agent runs for trend analysis
7. **Custom Commands:** Allow clinics to create custom AI commands
8. **Integration APIs:** Connect with external systems (Slack, Teams, etc.)

---

## Troubleshooting

### Agent Not Running
1. Check if Node.js server is running: `npm start`
2. Verify clinic exists in database
3. Check server logs for errors
4. Ensure database is accessible

### Command Not Recognized
1. Use one of the available commands from the list
2. Commands are case-insensitive
3. Common keywords: "reduce", "increase", "optimize", "check", "run"

### No Data in Results
1. Ensure clinic has associated data (appointments, invoices, etc.)
2. Check database is populated with test data
3. Run Setup page to initialize clinic data

---

## Support

For issues or feature requests, check:
- Server logs: Look for `[AgentName]` prefixed messages
- Frontend console: Browser Developer Tools > Console
- Database: Use browse-db.js to verify data

