package com.carrental.controller;

import com.carrental.dto.ReviewDto;
import com.carrental.model.Review;
import com.carrental.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*") // Allow frontend to call the API
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody ReviewDto reviewDto) {
        try {
            Review review = reviewService.addReview(reviewDto);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/car/{carId}")
    public ResponseEntity<List<Review>> getCarReviews(@PathVariable String carId) {
        return ResponseEntity.ok(reviewService.getCarReviews(carId));
    }
}
