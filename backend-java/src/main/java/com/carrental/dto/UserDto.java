package com.carrental.dto;

import lombok.Data;

@Data
public class UserDto {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String role;
    private String drivingLicense;
}
