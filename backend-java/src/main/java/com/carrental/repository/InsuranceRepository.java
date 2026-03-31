package com.carrental.repository;

import com.carrental.model.Insurance;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface InsuranceRepository extends MongoRepository<Insurance, String> {
    List<Insurance> findByCarId(String carId);
    List<Insurance> findByOwnerId(String ownerId);
}
