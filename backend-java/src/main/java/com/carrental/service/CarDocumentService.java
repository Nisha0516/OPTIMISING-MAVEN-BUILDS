package com.carrental.service;

import com.carrental.model.CarDocument;
import com.carrental.repository.CarDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarDocumentService {

    @Autowired
    private CarDocumentRepository carDocumentRepository;

    public CarDocument saveDocument(CarDocument document) {
        return carDocumentRepository.save(document);
    }

    public List<CarDocument> getDocumentsByUserId(String userId) {
        return carDocumentRepository.findByUserId(userId);
    }
}
