package com.carrental.repository;

import com.carrental.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByReceiverId(String receiverId);
    List<Message> findBySenderId(String senderId);
    List<Message> findByBookingId(String bookingId);
}
