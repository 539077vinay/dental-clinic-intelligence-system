# Quick Start Guide - AI Agents Integration

## What's New

Your Dental Clinic application now has a fully functional AI Agents system with 4 specialized agents and an AI Command Center.

## Architecture Overview

### Backend (`backend/`)
- **server.js** - Express server with agent endpoints
- **agents/** - Agent implementation files:
  - `appointmentAgent.js` - Scheduling & slot analysis
  - `revenueAgent.js` - Payment tracking & collection
  - `caseAgent.js` - Treatment case management
  - `inventoryAgent.js` - Stock & procurement management
  - `aiCommandCenter.js` - Natural language command processor

### Frontend (`frontend/public/`)
- **pages/agents.html** - Enhanced agents interface with tabs:
  - Agents Tab - Run and monitor individual agents
  - AI Command Tab - Send natural language commands
  - Activity Logs Tab - Track all executions
- **js/** - JavaScript files
- **css/** - Stylesheets

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start Server
```bash
npm start
```
Server runs on http://localhost:3000

### 3. Access Agents Page
- Navigate to http://localhost:3000/pages/agents.html
- Login with your clinic credentials
- You'll see the new enhanced agents interface

## Key Features

### ✅ Agents Tab
- **Run Individual Agents** - Click "Run Now" on any agent card
- **Agent Status** - Real-time status indicators (⏳ Running, ✅ Success, ❌ Error)
- **Detailed Analysis** - View metrics and recommendations for each agent
- **Run All Agents** - Execute all agents in sequence with comprehensive report

### ✅ AI Command Tab
- **Natural Language** - Type commands like "reduce cancellations"
- **Quick Suggestions** - Click pre-built command buttons
- **Smart Processing** - AI understands intent and executes appropriate actions
- **Detailed Responses** - Get specific recommendations and action plans

### ✅ Activity Logs Tab
- **Execution Tracking** - See all agent runs with timestamps
- **Error Monitoring** - Track any issues that occur
- **Performance History** - Monitor agent execution patterns
- **Clear Logs** - Reset log history when needed

## API Endpoints

### Individual Agents
```
POST /api/agents/run-appointment    # Analyze appointment scheduling
POST /api/agents/run-revenue        # Track payment collection
POST /api/agents/run-case           # Manage treatment cases
POST /api/agents/run-inventory      # Monitor stock levels
```

### Batch Operations
```
POST /api/agents/run-all            # Run all agents
POST /api/agents/run                # Legacy endpoint (all agents)
```

### AI Command Center
```
POST /api/agents/command
Body: { "clinicId": "...", "command": "your command" }
```

## Available AI Commands

| Command | What It Does |
|---------|-------------|
| "reduce cancellations" | Implements no-show prevention strategies |
| "increase revenue" | Optimizes billing and case management |
| "optimize inventory" | Reviews stock and creates purchase orders |
| "improve appointments" | Analyzes scheduling and suggests improvements |
| "boost collection" | Accelerates payment collection efforts |
| "check status" | Provides complete clinic overview |
| "run all agents" | Executes all agents |

## Daily Schedule

Agents run automatically at these times:
- **7:00 AM** - Appointment Agent
- **7:05 AM** - Revenue Agent
- **7:10 AM** - Case Agent
- **7:15 AM** - Inventory Agent

## File Structure

```
Dental clinic/
├── backend/
│   ├── agents/
│   │   ├── appointmentAgent.js
│   │   ├── revenueAgent.js
│   │   ├── caseAgent.js
│   │   ├── inventoryAgent.js
│   │   └── aiCommandCenter.js
│   ├── server.js (Updated with agent imports and endpoints)
│   ├── db.js
│   ├── package.json
│   └── ...
│
├── frontend/
│   └── public/
│       ├── pages/
│       │   └── agents.html (Enhanced with new UI)
│       ├── js/
│       ├── css/
│       └── ...
│
├── AI_AGENTS_GUIDE.md (Detailed documentation)
└── PROJECT_STRUCTURE.md
```

## Testing the System

### Test 1: Run Individual Agent
1. Go to Agents page
2. Click "Run Now" on Appointment Agent
3. Wait for status to show ✅ Success
4. View the analysis results

### Test 2: Use AI Commands
1. Go to AI Command tab
2. Click "Reduce Cancellations" button
3. See recommendations displayed
4. Check Activity Logs

### Test 3: Run All Agents
1. Click "Execute All Agents" button
2. Watch real-time execution progress
3. Review combined results

## Important Notes

✅ **Already Done:**
- Separated frontend and backend folders
- Created 4 specialized agent classes
- Implemented AI Command Center
- Updated server with all new endpoints
- Enhanced agents.html with professional UI
- Added scheduled execution (cron jobs)
- Created comprehensive documentation

✅ **What Works:**
- All agent APIs functional
- AI commands with natural language processing
- Real-time status updates in frontend
- Activity logging and monitoring
- Error handling and reporting

⚠️ **Next Steps (Optional):**
- Add email notifications for agent actions
- Implement WebSocket for real-time updates
- Add database persistence for agent logs
- Create admin dashboard for agent configuration
- Integrate with external services (Slack, WhatsApp, etc.)

## Troubleshooting

**Issue: Agents not responding**
- Check if server is running: `npm start` in backend folder
- Check browser console for errors (F12)
- Verify clinic exists in database

**Issue: Commands not recognized**
- Use exact command names from the available list
- Commands are case-insensitive
- Check Activity Logs for error messages

**Issue: No data in results**
- Ensure clinic has appointments, invoices, or cases
- Run Setup page first to initialize data
- Check database is populated

## Support

For detailed information:
- See **AI_AGENTS_GUIDE.md** for comprehensive documentation
- Check **PROJECT_STRUCTURE.md** for folder organization
- Review agent files for implementation details

---

**Status:** ✅ All Systems Operational
**Version:** 1.0.0
**Last Updated:** December 27, 2025
