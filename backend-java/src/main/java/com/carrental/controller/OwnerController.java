package com.carrental.controller;

import com.carrental.dto.CarDto;
import com.carrental.model.Booking;
import com.carrental.model.Car;
import com.carrental.model.User;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.UserRepository;
import com.carrental.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/owner")
@CrossOrigin(origins = "*") 
public class OwnerController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CarService carService;

    private String getUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return token.replace("Bearer ", "");
        }
        return null; // Mock token parsing
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getOwnerDashboard(@RequestHeader("Authorization") String token) {
        String ownerId = getUserIdFromToken(token);
        if (ownerId == null) return ResponseEntity.status(401).build();

        List<Car> myCars = carRepository.findByOwnerId(ownerId);
        List<Booking> myBookings = bookingRepository.findByOwnerId(ownerId);

        // Calculate stats
        int totalRentals = myBookings.size();
        int activeCars = myCars.size();
        int pendingBookings = (int) myBookings.stream().filter(b -> "pending".equalsIgnoreCase(b.getStatus())).count();
        double totalEarnings = myBookings.stream()
                .filter(b -> "completed".equalsIgnoreCase(b.getStatus()) || "paid".equalsIgnoreCase(b.getStatus()) || "confirmed".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEarnings", totalEarnings);
        stats.put("totalRentals", totalRentals);
        stats.put("activeCars", activeCars);
        stats.put("pendingBookings", pendingBookings);

        Map<String, Object> response = new HashMap<>();
        response.put("stats", stats);
        response.put("recentBookings", myBookings); // Realistically you'd limit this or sort
        response.put("activeCars", myCars); // Same

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getOwnerProfile(@RequestHeader("Authorization") String token) {
        String ownerId = getUserIdFromToken(token);
        if (ownerId == null) return ResponseEntity.status(401).build();
        
        return userRepository.findById(ownerId)
                .map(user -> ResponseEntity.ok(Map.of("success", true, "user", user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateOwnerProfile(@RequestHeader("Authorization") String token, @RequestBody User updatedUser) {
        String ownerId = getUserIdFromToken(token);
        if (ownerId == null) return ResponseEntity.status(401).build();

        return userRepository.findById(ownerId).map(user -> {
            user.setName(updatedUser.getName());
            user.setPhone(updatedUser.getPhone());
            // other fields to update safely...
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("success", true, "user", user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cars")
    public ResponseEntity<?> getOwnerCars(@RequestHeader("Authorization") String token, @RequestParam(required=false) String status) {
        String ownerId = getUserIdFromToken(token);
        if (ownerId == null) return ResponseEntity.status(401).build();

        List<Car> cars = carRepository.findByOwnerId(ownerId);
        return ResponseEntity.ok(Map.of("success", true, "cars", cars, "pagination", Map.of("total", cars.size(), "pages", 1)));
    }

    @PostMapping("/cars")
    public ResponseEntity<?> addOwnerCar(@RequestHeader("Authorization") String token, @RequestBody CarDto carDto) {
        String ownerId = getUserIdFromToken(token);
        if (ownerId == null) return ResponseEntity.status(401).build();

        try {
            carDto.setOwnerId(ownerId); // Ensure the owner is the token holder
            Car newCar = carService.createCar(carDto);
            return ResponseEntity.ok(Map.of("success", true, "car", newCar));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/cars/{id}")
    public ResponseEntity<?> updateOwnerCar(@RequestHeader("Authorization") String token, @PathVariable String id, @RequestBody Car updatedCar) {
        String ownerId = getUserIdFromToken(token);
        if (ownerId == null) return ResponseEntity.status(401).build();

        return carRepository.findById(id).map(car -> {
            if (!car.getOwnerId().equals(ownerId)) return ResponseEntity.status(403).build();

            // Perform partial updates safely
            Optional.ofNullable(updatedCar.getName()).ifPresent(car::setName);
            Optional.ofNullable(updatedCar.getPlateNumber()).ifPresent(car::setPlateNumber);
            Optional.ofNullable(updatedCar.getPrice()).ifPresent(car::setPrice);
            Optional.ofNullable(updatedCar.getLocation()).ifPresent(car::setLocation);
            Optional.ofNullable(updatedCar.getDescription()).ifPresent(car::setDescription);

            Car savedCar = carRepository.save(car);
            return ResponseEntity.ok(Map.of("success", true, "car", savedCar));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/cars/{id}")
    public ResponseEntity<?> deleteOwnerCar(@RequestHeader("Authorization") String token, @PathVariable String id) {
        String ownerId = getUserIdFromToken(token);
        if (ownerId == null) return ResponseEntity.status(401).build();

        return carRepository.findById(id).map(car -> {
            if (!car.getOwnerId().equals(ownerId)) return ResponseEntity.status(403).build();
            carRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Car successfully deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/cars/{id}/availability")
    public ResponseEntity<?> updateCarAvailability(@RequestHeader("Authorization") String token, @PathVariable String id, @RequestBody Map<String, Boolean> body) {
        String ownerId = getUserIdFromToken(token);
        if (ownerId == null) return ResponseEntity.status(401).build();

        return carRepository.findById(id).map(car -> {
            if (!car.getOwnerId().equals(ownerId)) return ResponseEntity.status(403).build();
            car.setAvailable(body.get("available"));
            Car savedCar = carRepository.save(car);
            return ResponseEntity.ok(Map.of("success", true, "car", savedCar));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getOwnerBookings(@RequestHeader("Authorization") String token) {
        String ownerId = getUserIdFromToken(token);
        if (ownerId == null) return ResponseEntity.status(401).build();

        List<Booking> bookings = bookingRepository.findByOwnerId(ownerId);
        return ResponseEntity.ok(Map.of("success", true, "bookings", bookings, "pagination", Map.of("total", bookings.size(), "pages", 1)));
    }

    @PutMapping("/bookings/{id}/complete")
    public ResponseEntity<?> completeOwnerBooking(@RequestHeader("Authorization") String token, @PathVariable String id) {
        String ownerId = getUserIdFromToken(token);
        if (ownerId == null) return ResponseEntity.status(401).build();

        return bookingRepository.findById(id).map(booking -> {
            if (!booking.getOwnerId().equals(ownerId)) return ResponseEntity.status(403).build();
            booking.setStatus("Completed");
            Booking savedBooking = bookingRepository.save(booking);
            return ResponseEntity.ok(Map.of("success", true, "booking", savedBooking));
        }).orElse(ResponseEntity.notFound().build());
    }
}
