package com.carrental.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@NoArgsConstructor
@Document(collection = "documents")
public class CarDocument { // Named CarDocument to avoid confusion with Spring's @Document

    @Id
    private String id;
    
    private String userId; // User ObjectId
    
    private String carId; // Car ObjectId
    
    private String type; // driving_license, car_registration, insurance_policy, etc.
    
    private String documentNumber;
    
    private String fileName;
    
    private String fileUrl;
    
    private boolean verified = false;
    
    private String verifiedById; // User ObjectId
    
    private Date verifiedAt;
    
    private Date expiryDate;
    
    private String notes;
    
    private Date createdAt = new Date();
}
