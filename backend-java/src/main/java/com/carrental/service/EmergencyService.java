package com.carrental.service;

import com.carrental.model.Emergency;
import com.carrental.repository.EmergencyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class EmergencyService {

    @Autowired
    private EmergencyRepository emergencyRepository;

    public Emergency reportEmergency(Emergency emergency) {
        // Priority logic mapped from Node.js pre-save hook
        if ("accident".equals(emergency.getType()) || "medical".equals(emergency.getType())) {
            emergency.setPriority("critical");
        } else if ("breakdown".equals(emergency.getType()) || "puncture".equals(emergency.getType()) || "key_lost".equals(emergency.getType())) {
            emergency.setPriority("high");
        } else {
            emergency.setPriority("medium");
        }
        emergency.setStatus("pending");
        emergency.setCreatedAt(new Date());
        emergency.setUpdatedAt(new Date());
        return emergencyRepository.save(emergency);
    }

    public List<Emergency> getActiveEmergencies() {
        return emergencyRepository.findByStatus("pending");
    }

    public List<Emergency> getAllEmergencies(String status) {
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("all")) {
            return emergencyRepository.findByStatus(status);
        }
        return emergencyRepository.findAll();
    }

    public List<Emergency> getMyEmergencies(String customerId) {
        return emergencyRepository.findByCustomerId(customerId);
    }

    public List<Emergency> getOwnerEmergencies(String ownerId) {
        return emergencyRepository.findByOwnerId(ownerId);
    }

    public Emergency updateEmergencyStatus(String emergencyId, String status, String notes) {
        Optional<Emergency> opt = emergencyRepository.findById(emergencyId);
        if (opt.isPresent()) {
            Emergency emergency = opt.get();
            emergency.setStatus(status);
            if (notes != null && !notes.isEmpty()) {
                emergency.setNotes(notes);
            }
            emergency.setUpdatedAt(new Date());
            return emergencyRepository.save(emergency);
        }
        throw new RuntimeException("Emergency not found");
    }

    public Emergency resolveEmergency(String emergencyId, String notes) {
        Optional<Emergency> opt = emergencyRepository.findById(emergencyId);
        if (opt.isPresent()) {
            Emergency emergency = opt.get();
            emergency.setStatus("resolved");
            if (notes != null && !notes.isEmpty()) {
                emergency.setNotes(notes);
            }
            emergency.setResolvedAt(new Date());
            emergency.setUpdatedAt(new Date());
            return emergencyRepository.save(emergency);
        }
        throw new RuntimeException("Emergency not found");
    }
}
