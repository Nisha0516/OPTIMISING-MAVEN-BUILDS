package com.carrental.repository;

import com.carrental.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByCarId(String carId);
    List<Review> findByCustomerId(String customerId);
}
