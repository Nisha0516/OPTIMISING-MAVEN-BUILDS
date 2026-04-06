package com.carrental.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

public class LoginDtoTest {

    @Test
    public void testLoginDtoSettersAndGetters() {
        LoginDto loginDto = new LoginDto();
        
        // Assert initialized as null
        assertNull(loginDto.getEmail());
        assertNull(loginDto.getPassword());

        // Set test data
        loginDto.setEmail("admin@example.com");
        loginDto.setPassword("securePassword123");

        // Verify test data
        assertEquals("admin@example.com", loginDto.getEmail(), "Email getter/setter logic failed");
        assertEquals("securePassword123", loginDto.getPassword(), "Password getter/setter logic failed");
    }
}
