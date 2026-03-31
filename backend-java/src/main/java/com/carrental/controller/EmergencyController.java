package com.carrental.controller;

import com.carrental.model.Emergency;
import com.carrental.service.EmergencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergencies")
@CrossOrigin(origins = "*")
public class EmergencyController {

    @Autowired
    private EmergencyService emergencyService;

    @PostMapping
    public ResponseEntity<Emergency> autoReportEmergency(@RequestBody Emergency emergency) {
        return ResponseEntity.ok(emergencyService.reportEmergency(emergency));
    }

    @GetMapping("/active")
    public ResponseEntity<List<Emergency>> fetchActiveEmergencies() {
        return ResponseEntity.ok(emergencyService.getActiveEmergencies());
    }
}
