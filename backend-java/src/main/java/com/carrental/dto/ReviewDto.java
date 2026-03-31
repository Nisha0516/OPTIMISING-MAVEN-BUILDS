package com.carrental.dto;

import lombok.Data;
import java.util.List;

@Data
public class ReviewDto {
    private String carId;
    private String customerId;
    private String bookingId;
    private Integer rating;
    private String comment;
    private Integer cleanliness;
    private Integer comfort;
    private Integer performance;
    private List<String> images;
}
