package com.carrental.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@NoArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;
    
    private String customerId; // User ObjectId
    
    private String carId; // Car ObjectId
    
    private String ownerId; // User ObjectId

    private String customerName;
    private String customerPhone;
    private String customerEmail;
    
    private String carName;
    private String carNumber;
    
    private String ownerName;
    private String ownerEmail;

    private Date startDate;
    
    private Date endDate;
    
    private Double totalPrice;
    
    private String paymentMethod; // Card, UPI, Cash, Razorpay
    
    private String paymentStatus = "Pending"; // Pending, Completed, Failed
    
    private String status = "Pending"; // Pending, Confirmed, Completed, Cancelled, Rejected
    
    private String notes;
    
    private Date createdAt = new Date();
}
