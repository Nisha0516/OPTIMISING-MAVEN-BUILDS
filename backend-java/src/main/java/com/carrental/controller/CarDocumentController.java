package com.carrental.controller;

import com.carrental.model.CarDocument;
import com.carrental.service.CarDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class CarDocumentController {

    @Autowired
    private CarDocumentService carDocumentService;

    @PostMapping
    public ResponseEntity<CarDocument> uploadDocument(@RequestBody CarDocument document) {
        return ResponseEntity.ok(carDocumentService.saveDocument(document));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CarDocument>> getUserDocuments(@PathVariable String userId) {
        return ResponseEntity.ok(carDocumentService.getDocumentsByUserId(userId));
    }
}
