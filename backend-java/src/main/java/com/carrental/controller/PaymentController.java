package com.carrental.controller;

import com.carrental.dto.PaymentDto;
import com.carrental.model.Payment;
import com.carrental.model.Booking;
import com.carrental.repository.BookingRepository;
import com.carrental.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*") // Allow frontend to call the API
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private BookingRepository bookingRepository;

    @PostMapping
    public ResponseEntity<?> processPayment(@RequestBody PaymentDto paymentDto) {
        try {
            Payment payment = paymentService.processPayment(paymentDto);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            String bookingId = data.get("bookingId") != null ? data.get("bookingId").toString() : "";
            double amount = 5000.0; // default 5000 INR

            if (!bookingId.isEmpty()) {
                Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
                if (bookingOpt.isPresent() && bookingOpt.get().getTotalPrice() != null) {
                    amount = bookingOpt.get().getTotalPrice();
                }
            }

            Map<String, Object> order = new HashMap<>();
            order.put("id", "order_mock_" + System.currentTimeMillis());
            order.put("amount", (long) (amount * 100)); // Razorpay amount is in paise
            order.put("currency", "INR");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("order", order);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to create payment order: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> paymentData) {
        try {
            String bookingId = paymentData.get("bookingId") != null ? paymentData.get("bookingId").toString() : null;
            
            // If booking exists, update status
            if (bookingId != null) {
                Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
                if (bookingOpt.isPresent()) {
                    Booking booking = bookingOpt.get();
                    booking.setPaymentStatus("Completed");
                    booking.setStatus("Confirmed"); // Assuming successful payment confirms the booking
                    bookingRepository.save(booking);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            
            Payment mockPayment = new Payment();
            mockPayment.setBookingId(bookingId);
            mockPayment.setRazorpayOrderId((String)paymentData.get("orderId"));
            mockPayment.setRazorpayPaymentId((String)paymentData.get("paymentId"));
            mockPayment.setRazorpaySignature((String)paymentData.get("signature"));
            mockPayment.setStatus("Completed");
            mockPayment.setPaymentMethod("RAZORPAY");
            mockPayment.setTransactionId("TXN" + System.currentTimeMillis());
            
            response.put("payment", mockPayment);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Payment verification failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Payment>> getCustomerPayments(@PathVariable String customerId) {
        return ResponseEntity.ok(paymentService.getCustomerPayments(customerId));
    }
}
