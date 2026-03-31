# Razorpay Payment Integration - Setup Guide

## ✅ Implementation Complete!

Razorpay real-time payment integration has been successfully implemented in both frontend and backend.

---

## 📋 Setup Instructions

### 1. **Get Razorpay API Keys**

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. Generate **Test Keys** (for development) or **Live Keys** (for production)
4. Copy your **Key ID** and **Key Secret**

### 2. **Backend Configuration**

Add to your `.env` file in the `backend` folder:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

**Update the default values in:**
- `backend/controllers/paymentController.js` (lines 8-9)

### 3. **Frontend Configuration**

Add to your `.env` file in the `frontend` folder (or create one):

```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

**Update the default value in:**
- `frontend/src/components/RazorpayPayment.js` (line 48)

### 4. **Install Dependencies**

#### Backend:
```bash
cd CAR-RENTAL--master/backend
npm install razorpay
```

#### Frontend:
```bash
cd CAR-RENTAL--master/frontend
npm install razorpay
```

---

## 🚀 How It Works

### Payment Flow:

1. **Customer creates booking** → Booking status: "Pending"
2. **Owner approves booking** → Booking status: "Confirmed", Payment status: "Pending"
3. **Customer clicks "Pay Now"** → Opens Razorpay payment modal
4. **Backend creates Razorpay order** → Returns order ID
5. **Razorpay checkout opens** → Customer completes payment
6. **Payment verification** → Backend verifies signature
7. **Payment saved** → Payment status: "Completed", Booking payment status: "Completed"

---

## 📍 Where Payment Appears

### For Customers:
- **My Bookings Page** (`/customer/my-bookings`)
- **"Pay Now" button** appears for confirmed bookings with pending payment
- **Payment modal** opens when clicked
- **Payment status badge** shows after successful payment

---

## 🔧 API Endpoints

### Backend Endpoints:

1. **Create Razorpay Order**
   - `POST /api/payments/create-order`
   - Body: `{ bookingId: "..." }`
   - Returns: `{ success: true, order: {...}, paymentId: "..." }`

2. **Verify Payment**
   - `POST /api/payments/verify`
   - Body: `{ razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId }`
   - Returns: `{ success: true, payment: {...} }`

---

## 🧪 Testing

### Test Cards (Razorpay Test Mode):

- **Card Number:** `4111 1111 1111 1111`
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Name:** Any name

### Test UPI IDs:
- `success@razorpay`
- `failure@razorpay`

---

## 📝 Payment Model Updates

The Payment model now includes:
- `razorpayOrderId` - Razorpay order ID
- `razorpayPaymentId` - Razorpay payment ID
- `razorpaySignature` - Payment signature for verification
- `paymentMethod: 'Razorpay'` - Payment method type

---

## 🔒 Security Notes

1. **Never expose your Key Secret** in frontend code
2. **Always verify payment signature** on backend
3. **Use environment variables** for API keys
4. **Enable webhook verification** in production (optional but recommended)

---

## 🎯 Features Implemented

✅ Real-time Razorpay payment integration  
✅ Secure payment verification  
✅ Payment status tracking  
✅ Automatic booking status update  
✅ Payment modal with professional UI  
✅ Success/failure handling  
✅ Payment history tracking  

---

## 📞 Support

If you encounter issues:
1. Check Razorpay Dashboard for payment logs
2. Verify API keys are correct
3. Check browser console for errors
4. Ensure backend server is running

---

**Status:** ✅ Ready for Testing  
**Last Updated:** Just Now

