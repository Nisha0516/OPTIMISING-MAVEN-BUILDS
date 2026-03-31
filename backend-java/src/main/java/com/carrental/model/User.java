package com.carrental.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@NoArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;
    
    private String phone;
    
    private String role = "customer"; // customer, owner, admin
    
    private String drivingLicense;
    
    private boolean isActive = true;
    
    private String address;
    private String companyName;
    private String aadharNumber;
    private String licenseNumber;
    private String bankAccount;
    private String ifscCode;
    private String profilePictureUrl;
    
    private Date createdAt = new Date();
}
