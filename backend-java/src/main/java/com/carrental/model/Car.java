package com.carrental.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "cars")
public class Car {

    @Id
    private String id;
    
    private String ownerId; // Represents the User ObjectId

    private String name;

    @Indexed(unique = true)
    private String plateNumber;

    private String type; // Sedan, SUV, Hatchback, Luxury, Sports
    
    private String transmission; // Automatic, Manual
    
    private String fuel; // Petrol, Diesel, Electric, Hybrid
    
    private Integer seats;
    
    private Double price;
    
    private String location;
    
    private boolean available = true;
    
    private List<String> features;
    
    private String description;
    
    private List<String> images;
    
    private Double rating = 0.0;
    
    private boolean approved = false;
    
    private Date createdAt = new Date();
}
