# Dental Clinic Project Structure

This project is organized into **Backend** and **Frontend** folders for better separation of concerns and scalability.

## 📁 Directory Layout

```
Dental clinic/
├── backend/                 # Backend server and business logic
│   ├── server.js           # Express.js main server file
│   ├── db.js               # Database initialization and models
│   ├── browse-db.js        # Database utility/browser
│   ├── package.json        # Backend dependencies
│   ├── .env                # Environment variables
│   ├── clinic.db           # SQLite database
│   ├── clinic.json         # Clinic data
│   ├── routes/             # API route handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Data models
│   └── config/             # Configuration files
│
├── frontend/               # Frontend web application
│   └── public/
│       ├── index.html      # Home page
│       ├── pages/          # HTML pages
│       │   ├── dashboard.html
│       │   ├── agents.html
│       │   ├── appointments.html
│       │   ├── patients.html
│       │   ├── inventory.html
│       │   ├── billing.html
│       │   ├── setup.html
│       │   └── login.html
│       ├── js/             # JavaScript files
│       │   ├── app.js
│       │   ├── dashboard.js
│       │   ├── auth.js
│       │   └── [other scripts]
│       └── css/            # Stylesheets
│           └── styles.css
│
├── webapp/                 # (Original folder - can be deleted after migration)
└── PROJECT_STRUCTURE.md    # This file
```

## 🚀 Running the Application

### Backend Setup
```bash
cd backend
npm install
npm start
```
The backend server runs on `http://localhost:3000`

### Frontend
Frontend files are served by the Express server from `../frontend/public` directory. Simply access the backend URL to view the frontend.

## 📝 Important Notes

- **Backend Dependencies**: All npm packages (express, cors, jwt, sqlite3, etc.) are managed in `backend/package.json`
- **Frontend**: Uses vanilla JavaScript with no build step
- **Static Files**: The backend server (`server.js`) is configured to serve static files from the `frontend/public` directory
- **API Endpoints**: All API routes are handled by the backend Express server

## 🔄 Migration from Old Structure

Files have been organized as follows:
- Backend files (server.js, db.js, package.json) → `backend/`
- Frontend files (HTML, JS, CSS) → `frontend/public/`
  - HTML pages → `frontend/public/pages/`
  - JavaScript → `frontend/public/js/`
  - CSS → `frontend/public/css/`

## 📌 Future Improvements

Consider organizing routes into separate files:
- `backend/routes/auth.js` - Authentication endpoints
- `backend/routes/appointments.js` - Appointment endpoints
- `backend/routes/patients.js` - Patient endpoints
- etc.

This will make the codebase more scalable and maintainable.
