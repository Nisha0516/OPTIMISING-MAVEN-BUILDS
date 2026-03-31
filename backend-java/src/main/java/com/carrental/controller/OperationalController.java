package com.carrental.controller;

import com.carrental.model.Favorite;
import com.carrental.model.Insurance;
import com.carrental.model.Maintenance;
import com.carrental.model.Message;
import com.carrental.service.OperationalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/operations")
@CrossOrigin(origins = "*")
public class OperationalController {

    @Autowired
    private OperationalService operationalService;

    // --- Favorites ---
    @PostMapping("/favorites")
    public ResponseEntity<Favorite> addFavorite(@RequestBody Favorite favorite) {
        return ResponseEntity.ok(operationalService.addFavorite(favorite));
    }
    @GetMapping("/favorites/customer/{customerId}")
    public ResponseEntity<List<Favorite>> getFavorites(@PathVariable String customerId) {
        return ResponseEntity.ok(operationalService.getCustomerFavorites(customerId));
    }

    // --- Insurance ---
    @PostMapping("/insurance")
    public ResponseEntity<Insurance> addInsurance(@RequestBody Insurance insurance) {
        return ResponseEntity.ok(operationalService.addInsurance(insurance));
    }

    // --- Maintenance ---
    @PostMapping("/maintenance")
    public ResponseEntity<Maintenance> addMaintenance(@RequestBody Maintenance maintenance) {
        return ResponseEntity.ok(operationalService.addMaintenanceLog(maintenance));
    }

    // --- Messages ---
    @PostMapping("/messages")
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        return ResponseEntity.ok(operationalService.sendMessage(message));
    }
    @GetMapping("/messages/inbox/{receiverId}")
    public ResponseEntity<List<Message>> getInbox(@PathVariable String receiverId) {
        return ResponseEntity.ok(operationalService.getInbox(receiverId));
    }
}
