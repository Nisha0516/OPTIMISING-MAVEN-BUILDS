package com.carrental.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@NoArgsConstructor
@Document(collection = "emergencies")
public class Emergency {

    @Id
    private String id;
    
    private String bookingId;
    
    private String carId;
    
    private String customerId;
    
    private String ownerId;
    
    private String type; // breakdown, accident, etc.
    
    private String description = "";
    
    // Simplification for Location object
    private Double latitude;
    private Double longitude;
    private Double accuracy;
    private Date locationTimestamp;
    private String address;
    private String locationError;
    
    private String status = "pending"; // pending, acknowledged, in_progress, resolved
    
    private String priority = "high"; // low, medium, high, critical
    
    private Date resolvedAt;
    
    private String resolvedById;
    
    private String notes;
    
    // Simplification for NotificationsSent object
    private boolean ownerNotified = false;
    private boolean adminNotified = false;
    private boolean customerNotified = false;
    
    private Date createdAt = new Date();
    private Date updatedAt = new Date();
}
