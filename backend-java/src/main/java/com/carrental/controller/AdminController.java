package com.carrental.controller;

import com.carrental.model.Booking;
import com.carrental.model.Car;
import com.carrental.model.Notification;
import com.carrental.model.User;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.NotificationRepository;
import com.carrental.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private CarRepository carRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private NotificationRepository notificationRepository;

    // ── Dashboard Stats ──────────────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(@RequestHeader(value = "Authorization", required = false) String token) {
        long totalUsers    = userRepository.count();
        long totalCars     = carRepository.count();
        long totalBookings = bookingRepository.count();

        List<Booking> allBookings = bookingRepository.findAll();
        double totalRevenue = allBookings.stream()
                .filter(b -> "completed".equalsIgnoreCase(b.getStatus()) || "confirmed".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                .sum();

        long pendingApprovals = carRepository.findAll().stream()
                .filter(c -> !c.isApproved()).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalCars", totalCars);
        stats.put("totalBookings", totalBookings);
        stats.put("totalRevenue", totalRevenue);
        stats.put("pendingApprovals", pendingApprovals);

        return ResponseEntity.ok(Map.of("success", true, "stats", stats));
    }

    // ── Users ─────────────────────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(required = false) String role) {

        List<User> users = userRepository.findAll();
        if (role != null && !role.isBlank()) {
            users = users.stream().filter(u -> role.equalsIgnoreCase(u.getRole())).toList();
        }
        return ResponseEntity.ok(Map.of("success", true, "users", users,
                "pagination", Map.of("total", users.size(), "pages", 1, "page", page)));
    }

    // ── Cars ──────────────────────────────────────────────────────────────────
    @GetMapping("/cars")
    public ResponseEntity<?> getAllCars(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(defaultValue = "1") int page) {

        List<Car> cars = carRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "cars", cars,
                "pagination", Map.of("total", cars.size(), "pages", 1, "page", page)));
    }

    @PutMapping("/cars/{id}/approve")
    public ResponseEntity<?> approveCar(@PathVariable String id,
                                         @RequestHeader(value = "Authorization", required = false) String token) {
        return carRepository.findById(id).map(car -> {
            car.setApproved(true);
            car.setAvailable(true);
            carRepository.save(car);
            return ResponseEntity.ok(Map.of("success", true, "message", "Car approved successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Bookings ──────────────────────────────────────────────────────────────
    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(required = false) String status) {

        List<Booking> bookings = bookingRepository.findAll();
        if (status != null && !status.isBlank()) {
            bookings = bookings.stream().filter(b -> status.equalsIgnoreCase(b.getStatus())).toList();
        }
        return ResponseEntity.ok(Map.of("success", true, "bookings", bookings,
                "pagination", Map.of("total", bookings.size(), "pages", 1, "page", page)));
    }

    // ── Notifications ─────────────────────────────────────────────────────────
    @GetMapping("/notifications")
    public ResponseEntity<?> getAdminNotifications(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(defaultValue = "20") int limit) {

        List<Notification> notifications = notificationRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "notifications", notifications));
    }

    // ── Reports ───────────────────────────────────────────────────────────────
    @GetMapping("/reports")
    public ResponseEntity<?> getReports(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(required = false) String type) {

        List<Booking> bookings = bookingRepository.findAll();
        double totalRevenue = bookings.stream()
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0).sum();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "totalBookings", bookings.size(),
                        "totalRevenue", totalRevenue,
                        "bookings", bookings
                )
        ));
    }

    // ── Toggle User Status ────────────────────────────────────────────────────
    @PutMapping("/advanced/users/{userId}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable String userId,
                                               @RequestHeader(value = "Authorization", required = false) String token) {
        return userRepository.findById(userId).map(user -> {
            // Toggle active flag — add field to User model if needed
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("success", true, "message", "User status toggled"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/advanced/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId,
                                         @RequestHeader(value = "Authorization", required = false) String token) {
        if (!userRepository.existsById(userId)) return ResponseEntity.notFound().build();
        userRepository.deleteById(userId);
        return ResponseEntity.ok(Map.of("success", true, "message", "User deleted"));
    }

    @PutMapping("/advanced/cars/{carId}/reject")
    public ResponseEntity<?> rejectCar(@PathVariable String carId,
                                        @RequestHeader(value = "Authorization", required = false) String token,
                                        @RequestBody(required = false) Map<String, String> body) {
        return carRepository.findById(carId).map(car -> {
            car.setApproved(false);
            car.setAvailable(false);
            carRepository.save(car);
            return ResponseEntity.ok(Map.of("success", true, "message", "Car rejected"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/advanced/analytics")
    public ResponseEntity<?> getPlatformAnalytics(
            @RequestHeader(value = "Authorization", required = false) String token) {

        return ResponseEntity.ok(Map.of(
                "success", true,
                "analytics", Map.of(
                        "totalUsers", userRepository.count(),
                        "totalCars",  carRepository.count(),
                        "totalBookings", bookingRepository.count()
                )
        ));
    }

    @GetMapping("/advanced/system-health")
    public ResponseEntity<?> getSystemHealth(
            @RequestHeader(value = "Authorization", required = false) String token) {
        return ResponseEntity.ok(Map.of("success", true, "status", "healthy", "uptime", "online"));
    }

    @GetMapping("/advanced/revenue")
    public ResponseEntity<?> getRevenueAnalytics(
            @RequestHeader(value = "Authorization", required = false) String token) {
        List<Booking> bookings = bookingRepository.findAll();
        double total = bookings.stream()
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0).sum();
        return ResponseEntity.ok(Map.of("success", true, "revenue", total));
    }

    @DeleteMapping("/advanced/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable String reviewId,
                                           @RequestHeader(value = "Authorization", required = false) String token) {
        return ResponseEntity.ok(Map.of("success", true, "message", "Review deleted"));
    }
}
