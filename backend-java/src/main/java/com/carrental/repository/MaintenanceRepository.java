package com.carrental.repository;

import com.carrental.model.Maintenance;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MaintenanceRepository extends MongoRepository<Maintenance, String> {
    List<Maintenance> findByCarId(String carId);
    List<Maintenance> findByOwnerId(String ownerId);
}
