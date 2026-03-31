package com.carrental.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "insurances")
public class Insurance {

    @Id
    private String id;
    
    private String carId;
    
    private String ownerId;
    
    private String policyNumber;
    
    private String provider;
    
    private String coverageType; // Comprehensive, Third Party, Zero Depreciation
    
    private Date startDate;
    
    private Date endDate;
    
    private Double premium;
    
    private Double coverageAmount;
    
    private List<String> documents;
    
    private boolean isActive = true;
    
    private Date createdAt = new Date();
}
