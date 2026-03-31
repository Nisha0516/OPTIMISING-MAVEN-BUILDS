package com.carrental.service;

import com.carrental.dto.ReviewDto;
import com.carrental.model.Car;
import com.carrental.model.Review;
import com.carrental.repository.CarRepository;
import com.carrental.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private CarRepository carRepository;

    public Review addReview(ReviewDto reviewDto) {
        Review review = new Review();
        review.setCarId(reviewDto.getCarId());
        review.setCustomerId(reviewDto.getCustomerId());
        review.setBookingId(reviewDto.getBookingId());
        review.setRating(reviewDto.getRating());
        review.setComment(reviewDto.getComment());
        review.setCleanliness(reviewDto.getCleanliness());
        review.setComfort(reviewDto.getComfort());
        review.setPerformance(reviewDto.getPerformance());
        review.setImages(reviewDto.getImages());

        Review savedReview = reviewRepository.save(review);
        updateCarAverageRating(reviewDto.getCarId());
        
        return savedReview;
    }

    public List<Review> getCarReviews(String carId) {
        return reviewRepository.findByCarId(carId);
    }
    
    // Equivalent tracking logic to Node.js Mongoose post-save hook
    private void updateCarAverageRating(String carId) {
        List<Review> reviews = reviewRepository.findByCarId(carId);
        if (!reviews.isEmpty()) {
            double avgRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
                
            carRepository.findById(carId).ifPresent(car -> {
                car.setRating(avgRating);
                carRepository.save(car);
            });
        }
    }
}
