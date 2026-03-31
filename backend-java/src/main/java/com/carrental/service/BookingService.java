package com.carrental.service;

import com.carrental.dto.BookingDto;
import com.carrental.model.Booking;
import com.carrental.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public Booking createBooking(BookingDto bookingDto) {
        Booking booking = new Booking();
        booking.setCustomerId(bookingDto.getCustomerId());
        booking.setCarId(bookingDto.getCarId());
        booking.setOwnerId(bookingDto.getOwnerId());
        
        booking.setCustomerName(bookingDto.getCustomerName());
        booking.setCustomerPhone(bookingDto.getCustomerPhone());
        booking.setCustomerEmail(bookingDto.getCustomerEmail());
        
        booking.setCarName(bookingDto.getCarName());
        booking.setCarNumber(bookingDto.getCarNumber());
        
        booking.setOwnerName(bookingDto.getOwnerName());
        booking.setOwnerEmail(bookingDto.getOwnerEmail());

        booking.setStartDate(bookingDto.getStartDate());
        booking.setEndDate(bookingDto.getEndDate());
        booking.setTotalPrice(bookingDto.getTotalPrice());
        booking.setPaymentMethod(bookingDto.getPaymentMethod());
        booking.setNotes(bookingDto.getNotes());

        return bookingRepository.save(booking);
    }

    public List<Booking> getCustomerBookings(String customerId) {
        return bookingRepository.findByCustomerId(customerId);
    }

    public Booking updateBookingStatus(String bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found!"));
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
}
