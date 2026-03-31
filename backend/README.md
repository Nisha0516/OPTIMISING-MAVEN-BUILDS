# Car Rental Backend API

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup MongoDB

You have two options:

#### Option A: Local MongoDB (Recommended for Development)

**Windows:**
```bash
# 1. Download MongoDB Community Server
# Visit: https://www.mongodb.com/try/download/community

# 2. Install MongoDB
# Use default settings during installation

# 3. Start MongoDB service
net start MongoDB

# 4. Verify it's running
mongo --eval "db.stats()"
```

**Mac:**
```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify
mongo --eval "db.stats()"
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongo --eval "db.stats()"
```

**Local Connection String:**
```
MONGODB_URI=mongodb://127.0.0.1:27017/car_rental
```

---

#### Option B: MongoDB Atlas (Cloud - Free Tier Available)

**Step-by-step setup:**

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Click "Try Free" and create account

2. **Create Cluster**
   - Choose FREE tier (M0)
   - Select closest region
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Setup Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Create username and password (remember these!)
   - Set user privileges: "Atlas admin" or "Read and write to any database"

4. **Setup Network Access**
   - Go to "Network Access" → "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IPs only

5. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Format:
     ```
     mongodb+srv://username:password@cluster.mongodb.net/car_rental?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your actual credentials
   - Replace `<database>` with `car_rental`

**Atlas Connection String Example:**
```env
MONGODB_URI=mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/car_rental?retryWrites=true&w=majority
```

**Important Notes:**
- Don't include `<` `>` brackets in your actual string
- URL-encode special characters in password (e.g., `@` becomes `%40`)
- Ensure cluster is not paused

---

### 3. Configure Environment Variables

**Create `.env` file from template:**
```bash
# Copy the example file
copy .env.example .env   # Windows
cp .env.example .env     # Mac/Linux
```

**Edit `.env` file and configure:**
```env
# MongoDB Connection
# Use ONE of these based on your choice:
# Local: 
MONGODB_URI=mongodb://127.0.0.1:27017/car_rental
# Or Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car_rental

# JWT Secret - CHANGE THIS!
# Generate secure key:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Optional
SESSION_SECRET=your_session_secret
MAX_FILE_SIZE=10485760
```

**Generate Secure JWT Secret:**
```bash
# Run this command to generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output to JWT_SECRET in .env
```

### 4. Start Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

Server will run at: `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Cars
- `GET /api/cars` - Get all cars (Public)
- `GET /api/cars/:id` - Get single car (Public)
- `POST /api/cars` - Create car (Owner/Admin)
- `PUT /api/cars/:id` - Update car (Owner/Admin)
- `DELETE /api/cars/:id` - Delete car (Owner/Admin)

### Bookings
- `GET /api/bookings` - Get user's bookings (Protected)
- `GET /api/bookings/:id` - Get single booking (Protected)
- `POST /api/bookings` - Create booking (Customer)
- `PUT /api/bookings/:id` - Update booking (Protected)
- `DELETE /api/bookings/:id` - Cancel booking (Protected)
- `PUT /api/bookings/:id/approve` - Approve booking (Owner/Admin)
- `PUT /api/bookings/:id/reject` - Reject booking (Owner/Admin)

### Admin
- `GET /api/admin/stats` - Dashboard statistics (Admin)
- `GET /api/admin/bookings` - All bookings (Admin)
- `GET /api/admin/users` - All users (Admin)
- `GET /api/admin/cars` - All cars (Admin)
- `PUT /api/admin/cars/:id/approve` - Approve car (Admin)
- `GET /api/admin/reports` - Generate reports (Admin)

---

## 🧪 Testing with Postman/Thunder Client

### 1. Register User
```http
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "role": "customer",
  "drivingLicense": "DL123456"
}
```

### 2. Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response includes `token` - use this for protected routes

### 3. Get Cars (Public)
```http
GET http://localhost:5000/api/cars
```

### 4. Create Car (Protected - Owner)
```http
POST http://localhost:5000/api/cars
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Toyota Camry 2023",
  "type": "Sedan",
  "transmission": "Automatic",
  "fuel": "Petrol",
  "seats": 5,
  "price": 50,
  "location": "Downtown",
  "features": ["AC", "GPS", "Bluetooth"],
  "description": "Comfortable sedan for city driving"
}
```

### 5. Create Booking (Protected - Customer)
```http
POST http://localhost:5000/api/bookings
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "carId": "CAR_ID_HERE",
  "startDate": "2025-01-01",
  "endDate": "2025-01-05",
  "paymentMethod": "Card",
  "notes": "Need GPS"
}
```

---

## 📦 Project Structure

```
backend/
├── config/
│   └── db.js              # Database configuration
├── models/
│   ├── User.js            # User model
│   ├── Car.js             # Car model
│   └── Booking.js         # Booking model
├── routes/
│   ├── auth.js            # Auth routes
│   ├── cars.js            # Car routes
│   ├── bookings.js        # Booking routes
│   └── admin.js           # Admin routes
├── controllers/
│   ├── authController.js      # Auth logic
│   ├── carController.js       # Car logic
│   ├── bookingController.js   # Booking logic
│   └── adminController.js     # Admin logic
├── middleware/
│   └── auth.js            # JWT authentication
├── .env                   # Environment variables
├── .gitignore            # Git ignore file
├── server.js             # Entry point
└── package.json          # Dependencies

```

---

## 🔒 Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## ✅ Backend Complete!

Your backend is now ready with:
- ✅ User authentication (JWT)
- ✅ Role-based access (Customer, Owner, Admin)
- ✅ Car management
- ✅ Booking system
- ✅ Admin dashboard
- ✅ MongoDB integration

**Next Step:** Install dependencies and start the server!
```bash
npm install
npm run dev
```
