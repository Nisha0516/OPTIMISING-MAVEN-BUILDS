package com.carrental.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "reviews")
public class Review {

    @Id
    private String id;
    
    private String carId; // Car ObjectId
    
    private String customerId; // User ObjectId
    
    private String bookingId; // Booking ObjectId
    
    private Integer rating; // 1 to 5
    
    private String comment;
    
    private Integer cleanliness; // 1 to 5
    
    private Integer comfort; // 1 to 5
    
    private Integer performance; // 1 to 5
    
    private List<String> images;
    
    private List<String> helpfulUserIds; // Array of User ObjectIds indicating helpfulness
    
    private boolean reported = false;
    
    private Date createdAt = new Date();
}
