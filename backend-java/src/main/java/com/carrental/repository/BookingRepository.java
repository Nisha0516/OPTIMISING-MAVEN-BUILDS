package com.carrental.repository;

import com.carrental.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByCustomerId(String customerId);
    List<Booking> findByOwnerId(String ownerId);
    List<Booking> findByCarId(String carId);
}
