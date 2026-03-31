package com.carrental.controller;

import com.carrental.model.Notification;
import com.carrental.repository.NotificationRepository;
import com.carrental.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    // Generic GET used by frontend with ?limit= and ?read= params
    // Decodes user from token (mock: token = userId)
    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(required = false) Boolean read,
            @RequestParam(defaultValue = "20") int limit) {

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String userId = token.replace("Bearer ", "");
        List<Notification> notifications = notificationService.getUserNotifications(userId);

        if (read != null) {
            boolean readVal = read;
            notifications = notifications.stream()
                    .filter(n -> n.isRead() == readVal)
                    .collect(Collectors.toList());
        }

        // Apply limit
        if (notifications.size() > limit) {
            notifications = notifications.subList(0, limit);
        }

        return ResponseEntity.ok(Map.of("success", true, "notifications", notifications));
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        return ResponseEntity.ok(notificationService.createNotification(notification));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsReadPut(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        String userId = token.replace("Bearer ", "");
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok(Map.of("success", true, "message", "All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        notificationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}

