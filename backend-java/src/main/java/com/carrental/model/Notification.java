package com.carrental.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@NoArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    
    private String userId;
    
    private String type; // booking_created, etc.
    
    private String title;
    
    private String message;
    
    private String relatedBookingId;
    private String relatedCarId;
    private String relatedEmergencyId;
    
    private Integer extraDays;
    
    private Date newEndDate;
    
    private String extensionStatus = "pending";
    
    private boolean read = false;
    
    private Date readAt;
    
    private Date createdAt = new Date();
}
