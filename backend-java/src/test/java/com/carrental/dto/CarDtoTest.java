package com.carrental.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

public class CarDtoTest {

    @Test
    public void testCarDtoVariables() {
        CarDto carDto = new CarDto();
        
        assertNull(carDto.getName());
        
        carDto.setName("Tesla Model 3");
        carDto.setPlateNumber("XYZ 123");
        carDto.setPrice(100.0);
        
        assertEquals("Tesla Model 3", carDto.getName());
        assertEquals("XYZ 123", carDto.getPlateNumber());
        assertEquals(100.0, carDto.getPrice());
    }
}
