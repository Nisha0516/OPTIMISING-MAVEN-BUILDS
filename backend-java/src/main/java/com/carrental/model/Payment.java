package com.carrental.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.Map;

@Data
@NoArgsConstructor
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;
    
    private String bookingId; // Booking ObjectId
    
    private String customerId; // User ObjectId
    
    private Double amount;
    
    private String paymentMethod; // Card, UPI, Cash, Wallet, Razorpay
    
    private String transactionId;
    
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    
    private String status = "Pending"; // Pending, Completed, Failed, Refunded
    
    private Map<String, String> cardDetails; // E.g., { last4Digits: "1234", cardType: "Visa" }
    
    private String upiId;
    
    private Date paymentDate = new Date();
    
    private Double refundAmount = 0.0;
    
    private Date refundDate;
    
    private String notes;
    
    private Date createdAt = new Date();
}
