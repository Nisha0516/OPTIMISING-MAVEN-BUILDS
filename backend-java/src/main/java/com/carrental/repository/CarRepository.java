package com.carrental.repository;

import com.carrental.model.Car;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface CarRepository extends MongoRepository<Car, String> {
    Optional<Car> findByPlateNumber(String plateNumber);
    List<Car> findByType(String type); 
    List<Car> findByOwnerId(String ownerId);
    List<Car> findByApprovedTrueAndAvailableTrue();
    List<Car> findByApprovedTrue();
}
