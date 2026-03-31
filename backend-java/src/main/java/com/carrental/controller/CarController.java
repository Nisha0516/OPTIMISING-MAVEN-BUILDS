package com.carrental.controller;

import com.carrental.dto.CarDto;
import com.carrental.model.Car;
import com.carrental.repository.CarRepository;
import com.carrental.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cars")
@CrossOrigin(origins = "*") // Allow frontend to call the API
public class CarController {

    @Autowired
    private CarService carService;

    @Autowired
    private CarRepository carRepository;

    @PostMapping
    public ResponseEntity<?> addCar(@RequestBody CarDto carDto) {
        try {
            Car car = carService.createCar(carDto);
            return ResponseEntity.ok(car);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Public listing — only show admin-approved AND available cars to customers
    @GetMapping
    public ResponseEntity<?> getAllCars(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location) {

        List<Car> cars = carRepository.findByApprovedTrueAndAvailableTrue();

        if (type != null && !type.isBlank()) {
            cars = cars.stream().filter(c -> type.equalsIgnoreCase(c.getType())).collect(Collectors.toList());
        }
        if (location != null && !location.isBlank()) {
            cars = cars.stream().filter(c -> location.equalsIgnoreCase(c.getLocation())).collect(Collectors.toList());
        }

        return ResponseEntity.ok(Map.of("success", true, "cars", cars));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCarById(@PathVariable String id) {
        try {
            Car car = carService.getCarById(id);
            return ResponseEntity.ok(car);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCar(@PathVariable String id, @RequestBody Car updatedCar,
                                        @RequestHeader(value = "Authorization", required = false) String token) {
        return carRepository.findById(id).map(car -> {
            if (updatedCar.getName() != null) car.setName(updatedCar.getName());
            if (updatedCar.getPrice() != null) car.setPrice(updatedCar.getPrice());
            if (updatedCar.getLocation() != null) car.setLocation(updatedCar.getLocation());
            if (updatedCar.getDescription() != null) car.setDescription(updatedCar.getDescription());
            carRepository.save(car);
            return ResponseEntity.ok(car);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCar(@PathVariable String id,
                                        @RequestHeader(value = "Authorization", required = false) String token) {
        if (!carRepository.existsById(id)) return ResponseEntity.notFound().build();
        carRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Car deleted"));
    }
}
