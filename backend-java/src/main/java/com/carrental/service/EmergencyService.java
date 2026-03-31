package com.carrental.service;

import com.carrental.model.Emergency;
import com.carrental.repository.EmergencyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
        return emergencyRepository.save(emergency);
    }

    public List<Emergency> getActiveEmergencies() {
        return emergencyRepository.findByStatus("pending");
    }
}
