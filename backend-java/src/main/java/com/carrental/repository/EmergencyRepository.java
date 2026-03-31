package com.carrental.repository;

import com.carrental.model.Emergency;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface EmergencyRepository extends MongoRepository<Emergency, String> {
    List<Emergency> findByCustomerId(String customerId);
    List<Emergency> findByOwnerId(String ownerId);
    List<Emergency> findByCarId(String carId);
    List<Emergency> findByStatus(String status);
}
