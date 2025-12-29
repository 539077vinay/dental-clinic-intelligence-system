# 🦷 Dental Clinic - AI Agents System

A comprehensive dental clinic management application with intelligent AI agents for automated business operations.

## 🚀 Quick Start

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies (if not already done)
npm install

# 3. Start the server
npm start

# 4. Open in browser
# http://localhost:3000/pages/agents.html
```

## 📚 Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[AGENTS_QUICK_START.md](AGENTS_QUICK_START.md)** | Setup & overview | 5 min |
| **[AI_AGENTS_GUIDE.md](AI_AGENTS_GUIDE.md)** | API reference | 20 min |
| **[FEATURE_OVERVIEW.md](FEATURE_OVERVIEW.md)** | Feature details | 15 min |
| **[IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md)** | Technical details | 15 min |
| **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** | Navigation guide | 5 min |

## 🤖 AI Agents (5 Types)

### 📅 Appointment Agent
Analyzes scheduling patterns and optimizes appointment slots
- Tracks occupancy rates
- Identifies peak booking times
- Suggests scheduling improvements

### 💰 Revenue Agent
Tracks invoices and optimizes payment collection
- Monitors collection rates
- Identifies unpaid invoices
- Sends payment reminders

### 📋 Case Agent
Manages dental treatment cases and workflow
- Creates cases from appointments
- Tracks treatment progress
- Links cases to invoices

### 📦 Inventory Agent
Monitors stock levels and manages procurement
- Tracks low-stock items
- Creates purchase orders automatically
- Optimizes reorder points

### 🤖 AI Command Center
Processes natural language commands
- "reduce cancellations"
- "increase revenue"
- "optimize inventory"
- And more...

## 🎨 Frontend Features

### 3-Tab Interface
1. **Agents Tab** - Run individual agents, view results
2. **AI Command Tab** - Natural language commands
3. **Activity Logs Tab** - Track execution history

### Real-time Features
- Live status indicators (Running, Success, Error)
- Detailed analytics display
- Execution timestamps
- Error monitoring

## 📊 API Endpoints

```
POST /api/agents/run-appointment       # Run appointment analysis
POST /api/agents/run-revenue           # Run revenue tracking
POST /api/agents/run-case              # Run case management
POST /api/agents/run-inventory         # Run inventory check
POST /api/agents/run-all               # Run all agents
POST /api/agents/command               # Execute AI command
POST /api/agents/run                   # Legacy endpoint
```

## ⏰ Scheduled Execution

Agents run automatically daily:
- **7:00 AM** - Appointment Agent
- **7:05 AM** - Revenue Agent
- **7:10 AM** - Case Agent
- **7:15 AM** - Inventory Agent

## 🗂️ Project Structure

```
backend/
├── agents/                    ← 5 agent classes
├── server.js                  ← Express server
├── db.js                      ← Database
└── package.json

frontend/
└── public/
    ├── pages/agents.html      ← 3-tab interface
    ├── js/                    ← JavaScript files
    └── css/                   ← Stylesheets
```

## 🔧 Configuration

### Environment Variables (.env)
```
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
```

### Database
- SQLite database (clinic.db)
- Automatic initialization on startup
- Support for multiple clinics

## 📱 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔐 Security

- JWT authentication
- Password hashing with bcryptjs
- CORS protection
- Input validation

## 🛠️ Development

### Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** SQLite
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Task Scheduling:** node-cron
- **Authentication:** JWT, bcryptjs

### Requirements
- Node.js 14+
- npm or yarn

## 📖 Common Tasks

### Run a Specific Agent
```bash
curl -X POST http://localhost:3000/api/agents/run-appointment \
  -H "Content-Type: application/json" \
  -d '{"clinicId": "clinic-001"}'
```

### Execute AI Command
```bash
curl -X POST http://localhost:3000/api/agents/command \
  -H "Content-Type: application/json" \
  -d '{
    "clinicId": "clinic-001",
    "command": "reduce cancellations"
  }'
```

### Check Agent Status
Visit: http://localhost:3000/pages/agents.html

## 🐛 Troubleshooting

### Server won't start
- Check if port 3000 is available
- Verify Node.js is installed: `node --version`
- Check database permissions

### Agents not responding
- Ensure server is running: `npm start`
- Check browser console (F12)
- Verify clinic exists in database

### No data in results
- Initialize data via Setup page
- Ensure database has records
- Check Activity Logs for errors

## 📞 Support

For issues, check:
- [AGENTS_QUICK_START.md](AGENTS_QUICK_START.md) - Troubleshooting section
- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Navigation guide
- Server console logs

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET
3. Configure proper database backup
4. Enable HTTPS/SSL
5. Set up monitoring

### Docker (Optional)
```dockerfile
FROM node:14-alpine
WORKDIR /app
COPY backend/ .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 System Stats

- **Code Lines:** 1,450+
- **Documentation:** 20,000+ words
- **API Endpoints:** 7 new
- **Agent Classes:** 5
- **Frontend Components:** 3 tabs
- **Daily Tasks:** 4 scheduled

## ✨ Features Highlights

✅ 5 specialized AI agents
✅ Natural language command processing
✅ Real-time monitoring & alerts
✅ Automated daily scheduling
✅ Comprehensive error handling
✅ Activity logging system
✅ Professional UI with tabs
✅ Complete API documentation
✅ Multi-clinic support
✅ Production-ready code

## 🎯 Next Steps

1. **Start Server:** `npm start`
2. **Open Browser:** http://localhost:3000/pages/agents.html
3. **Login:** Use clinic credentials
4. **Explore:** Test agents and AI commands
5. **Integrate:** Build custom features as needed

## 📋 Checklist

- [x] 5 agent classes created
- [x] 7 API endpoints implemented
- [x] Frontend redesigned
- [x] Scheduled tasks configured
- [x] Error handling implemented
- [x] Documentation completed
- [x] Code organized
- [x] Ready for production

## 📄 License

Dental Clinic Management System
© 2025 - All Rights Reserved

## 🙏 Acknowledgments

Built with modern web technologies and best practices for healthcare management.

---

**Version:** 1.0.0
**Status:** ✅ Production Ready
**Last Updated:** December 27, 2025

**Get Started:** Read [AGENTS_QUICK_START.md](AGENTS_QUICK_START.md) →
