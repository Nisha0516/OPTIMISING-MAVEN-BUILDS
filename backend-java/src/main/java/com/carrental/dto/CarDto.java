package com.carrental.dto;

import lombok.Data;
import java.util.List;

@Data
public class CarDto {
    private String ownerId;
    private String name;
    private String plateNumber;
    private String type;
    private String transmission;
    private String fuel;
    private Integer seats;
    private Double price;
    private String location;
    private String description;
    private List<String> features;
    private List<String> images;
}
