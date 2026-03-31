package com.carrental.dto;

import lombok.Data;
import java.util.Date;

@Data
public class BookingDto {
    private String customerId;
    private String carId;
    private String ownerId;

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
    private String paymentMethod;
    private String notes;
}
