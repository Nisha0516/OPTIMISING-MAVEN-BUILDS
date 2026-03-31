package com.carrental.repository;

import com.carrental.model.CarDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CarDocumentRepository extends MongoRepository<CarDocument, String> {
    List<CarDocument> findByCarId(String carId);
    List<CarDocument> findByUserId(String userId);
}
