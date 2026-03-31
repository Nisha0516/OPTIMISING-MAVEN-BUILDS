package com.carrental.repository;

import com.carrental.model.Favorite;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FavoriteRepository extends MongoRepository<Favorite, String> {
    List<Favorite> findByCustomerId(String customerId);
    List<Favorite> findByCarId(String carId);
}
