# 🚗 Car Rental Management System

A full-stack MERN application for managing car rentals with separate dashboards for Customers, Owners, and Admins.

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Detailed Setup](#-detailed-setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Default Test Accounts](#-default-test-accounts)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Customer Portal
- 🔍 Browse and search available cars
- 📅 Book cars with real-time availability
- 💳 Multiple payment methods (Credit Card, Debit Card, UPI, Net Banking)
- 📊 View booking history and status
- ⭐ Add cars to favorites
- 📝 Leave reviews and ratings

### Owner Dashboard
- 🚙 Add and manage car listings
- 📸 Upload car images
- 📈 Track bookings and earnings
- ✅ Approve/reject booking requests
- 📊 View analytics and reports

### Admin Panel
- 👥 Manage users (Customers, Owners)
- 🚗 Manage all car listings
- 📋 Monitor all bookings
- 💰 View revenue reports
- 📊 Generate PDF reports
- 📈 Dashboard with real-time statistics

---

## 🛠 Tech Stack

### Frontend
- **React** 19.2.0 (Create React App)
- **React Router** 7.9.4 - Routing
- **Material-UI** 7.3.4 - UI Components
- **Axios** 1.12.2 - HTTP Client
- **React Query** 5.90.5 - Data Fetching
- **Chart.js** - Analytics Charts
- **jsPDF** - PDF Generation
- **Bootstrap** 5.3.8 - Additional Styling

### Backend
- **Node.js** with **Express** 5.1.0
- **MongoDB** with **Mongoose** 8.19.2
- **JWT** - Authentication
- **bcrypt** - Password Hashing
- **Multer** - File Uploads
- **express-validator** - Input Validation
- **CORS** - Cross-Origin Resource Sharing

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas account)
- **npm** or **yarn**

### Installation in 3 Steps

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Create .env file from template
copy .env.example .env
# Edit .env and add your MongoDB URI

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Start Development Servers

```bash
# Terminal 1 - Backend (from backend folder)
npm run dev

# Terminal 2 - Frontend (from frontend folder)
npm start
```

**Access the app at:** http://localhost:3000

---

## 📝 Detailed Setup

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd CAR-RENTAL--master
```

### Step 2: Setup Backend

```bash
cd backend
npm install
```

**Create `.env` file in backend folder:**
```env
# Copy .env.example to .env
MONGODB_URI=mongodb://127.0.0.1:27017/car_rental
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**MongoDB Setup Options:**

**Option A: Local MongoDB**
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   ```
3. Use: `MONGODB_URI=mongodb://127.0.0.1:27017/car_rental`

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Go to "Network Access" → Add IP Address → Allow from Anywhere (0.0.0.0/0)
4. Go to "Database Access" → Add Database User
5. Get connection string from "Connect" → "Connect your application"
6. Use: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car_rental`

### Step 3: Setup Frontend

```bash
cd frontend
npm install
```

**Optional: Enable PDF Downloads**
The PDF generation libraries are already installed. To activate:
1. Open `src/pages/admin/Report.js`
2. The PDF functionality should work out of the box

### Step 4: Start Both Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Expected output:
# 🚀 Server running on port 5000
# ✅ MongoDB Connected: <your-host>
# 📊 Database: car_rental

# Terminal 2 - Frontend
cd frontend
npm start

# Opens browser at http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend `.env` Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/car_rental` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_random_secret_key` |
| `PORT` | Backend server port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `SESSION_SECRET` | Session secret (optional) | `your_session_secret` |
| `MAX_FILE_SIZE` | Max upload size in bytes (optional) | `10485760` |

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚀 Running the Application

### Development Mode
```bash
# Backend (with auto-reload)
cd backend
npm run dev

# Frontend (with hot reload)
cd frontend
npm start
```

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Serve frontend build with backend
cd backend
npm start
```

---

## 👤 Default Test Accounts

After starting the backend, create test accounts by visiting these URLs:

### Create Admin Account
**URL:** http://localhost:5000/api/create-admin

**Credentials:**
- Email: `admin@test.com`
- Password: `admin123`
- Login at: http://localhost:3000/admin/login

### Create Owner Account
**URL:** http://localhost:5000/api/create-owner

**Credentials:**
- Email: `owner@test.com`
- Password: `password123`
- Login at: http://localhost:3000/owner/login

### Customer Account
Create by signing up at: http://localhost:3000/signup

**Note:** Remove these test endpoints in production (comment out lines 48-107 in `server.js`)

---

## 📁 Project Structure

```
CAR-RENTAL--master/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/              # Route controllers
│   │   ├── authController.js
│   │   ├── carController.js
│   │   ├── bookingController.js
│   │   └── ...
│   ├── models/                   # MongoDB schemas
│   │   ├── User.js
│   │   ├── Car.js
│   │   ├── Booking.js
│   │   └── ...
│   ├── routes/                   # API routes
│   │   ├── auth.js
│   │   ├── cars.js
│   │   ├── bookings.js
│   │   └── ...
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   ├── .env.example              # Environment template
│   ├── server.js                 # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Page components
│   │   │   ├── customer/
│   │   │   ├── owner/
│   │   │   └── admin/
│   │   ├── services/             # API services
│   │   │   ├── api.js            # API client
│   │   │   └── authService.js    # Auth helpers
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── Documentation files (*.md)
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login
GET    /api/auth/verify          # Verify JWT token
```

### Car Endpoints
```
GET    /api/cars                 # Get all cars
GET    /api/cars/:id             # Get car by ID
POST   /api/cars                 # Create car (Owner)
PUT    /api/cars/:id             # Update car (Owner)
DELETE /api/cars/:id             # Delete car (Owner/Admin)
```

### Booking Endpoints
```
GET    /api/bookings             # Get user bookings
POST   /api/bookings             # Create booking
PUT    /api/bookings/:id         # Update booking status
DELETE /api/bookings/:id         # Cancel booking
```

### Admin Endpoints
```
GET    /api/admin/users          # Get all users
GET    /api/admin/stats          # Dashboard statistics
GET    /api/admin/reports        # Generate reports
```

**Full API documentation:** See `BACKEND_COMPLETE_GUIDE.md`

---

## 🐛 Troubleshooting

### Backend Won't Start

**Problem:** `nodemon: command not found`
```bash
# Solution: Install nodemon locally
npm install --save-dev nodemon

# Or use npx
npx nodemon server.js
```

**Problem:** `MongoDB Connection Error: uri is undefined`
```bash
# Solution: Create .env file in backend folder
cd backend
copy .env.example .env
# Edit .env and add your MONGODB_URI
```

**Problem:** `MongoDB Connection Error: authentication failed`
```bash
# Solution: Check credentials in connection string
# Atlas: Ensure user has read/write permissions
# Local: Check MongoDB is running
```

### Frontend Issues

**Problem:** `Port 3000 already in use`
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <process-id> /F

# Or use different port
set PORT=3001 && npm start
```

**Problem:** `Cannot find module 'jspdf'`
```bash
# This is normal - jspdf is already installed
# If issue persists:
cd frontend
npm install jspdf jspdf-autotable
```

**Problem:** API calls fail with CORS error
```bash
# Solution: Check backend .env
FRONTEND_URL=http://localhost:3000

# And restart backend server
```

### Database Issues

**Problem:** Empty database / No data showing
```bash
# Solution: Create test accounts first
# Visit: http://localhost:5000/api/create-admin
# Visit: http://localhost:5000/api/create-owner
```

**Problem:** MongoDB not connecting (local)
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
brew services start mongodb-community

# Check if running
mongo --eval "db.stats()"
```

---

## 📚 Additional Documentation

- `QUICK_START.md` - Fast UI testing guide
- `FRONTEND_BACKEND_CONNECTION.md` - API integration guide
- `BACKEND_COMPLETE_GUIDE.md` - Complete backend reference
- `COMPLETE_TESTING_GUIDE.md` - Testing procedures
- `CHANGES_SUMMARY.md` - Recent changes log

---

## 🔒 Security Notes

### Before Production:
1. ✅ Change `JWT_SECRET` to a strong random string
2. ✅ Remove test account creation endpoints (server.js lines 48-107)
3. ✅ Set `MONGODB_URI` with proper credentials
4. ✅ Enable MongoDB authentication
5. ✅ Configure CORS to allow only your frontend domain
6. ✅ Add rate limiting middleware
7. ✅ Enable HTTPS
8. ✅ Set secure cookie flags
9. ✅ Review and fix npm audit vulnerabilities

---

## 📞 Support

Having issues? Check these files:
1. This README
2. `TROUBLESHOOTING.md` (if exists)
3. Browser console for frontend errors
4. Backend terminal for API errors
5. MongoDB logs for database issues

---

## 📄 License

[Your License Here]

---

## 🎉 You're Ready!

Your car rental application is now set up. Happy coding! 🚗💨

**Need help?** Check the documentation files in the root directory.
