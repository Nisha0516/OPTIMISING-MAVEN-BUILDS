package com.carrental.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "maintenances")
public class Maintenance {

    @Id
    private String id;
    
    private String carId;
    
    private String ownerId;
    
    private String type; // Service, Repair, Inspection, Cleaning, Tire Change, etc.
    
    private String description;
    
    private Double cost;
    
    private String serviceProvider;
    
    private Date date;
    
    private Date nextServiceDate;
    
    private Integer mileage;
    
    private List<String> receipts;
    
    private String notes;
    
    private Date createdAt = new Date();
}
