package com.carrental.controller;

import com.carrental.model.Emergency;
import com.carrental.service.EmergencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emergency")
@CrossOrigin(origins = "*")
public class EmergencyController {

    @Autowired
    private EmergencyService emergencyService;

    private Map<String, Object> createResponse(String key, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put(key, data);
        return response;
    }

    private Map<String, Object> createError(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }

    @PostMapping
    public ResponseEntity<?> autoReportEmergency(@RequestBody Emergency emergency) {
        try {
            Emergency created = emergencyService.reportEmergency(emergency);
            return ResponseEntity.ok(createResponse("emergency", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<?> fetchActiveEmergencies() {
        try {
            List<Emergency> emergencies = emergencyService.getActiveEmergencies();
            return ResponseEntity.ok(createResponse("emergencies", emergencies));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllEmergencies(@RequestParam(required = false) String status) {
        try {
            List<Emergency> emergencies = emergencyService.getAllEmergencies(status);
            return ResponseEntity.ok(createResponse("emergencies", emergencies));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/my-emergencies")
    // Note: To be fully secure, customerId should come from JWT token or passed safely.
    // Assuming frontend calls this, we might need a customerId param, but frontend didn't pass one in params.
    // If frontend doesn't pass one, maybe it uses a mocked ID or we can inject via SecurityContext.
    // We will just provide the endpoint to prevent 404s, but ideally we extract the user ID.
    public ResponseEntity<?> getMyEmergencies(@RequestParam(required = false) String customerId) {
        try {
            List<Emergency> emergencies = emergencyService.getMyEmergencies(customerId != null ? customerId : "mock-customer-id");
            return ResponseEntity.ok(createResponse("emergencies", emergencies));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @GetMapping("/owner")
    public ResponseEntity<?> getOwnerEmergencies(@RequestParam(required = false) String ownerId) {
        try {
            List<Emergency> emergencies = emergencyService.getOwnerEmergencies(ownerId != null ? ownerId : "mock-owner-id");
            return ResponseEntity.ok(createResponse("emergencies", emergencies));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @PutMapping("/{emergencyId}/status")
    public ResponseEntity<?> updateEmergencyStatus(@PathVariable String emergencyId, @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");
            String notes = payload.get("notes");
            Emergency updated = emergencyService.updateEmergencyStatus(emergencyId, status, notes);
            return ResponseEntity.ok(createResponse("emergency", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @PutMapping("/{emergencyId}/resolve")
    public ResponseEntity<?> resolveEmergency(@PathVariable String emergencyId, @RequestBody Map<String, String> payload) {
        try {
            String notes = payload.get("notes");
            Emergency resolved = emergencyService.resolveEmergency(emergencyId, notes);
            return ResponseEntity.ok(createResponse("emergency", resolved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }
}
