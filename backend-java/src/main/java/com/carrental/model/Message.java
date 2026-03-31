package com.carrental.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.Map;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "messages")
public class Message {

    @Id
    private String id;
    
    private String senderId;
    
    private String receiverId;
    
    private String bookingId;
    
    private String subject;
    
    private String messageContent;
    
    private boolean read = false;
    
    private Date readAt;
    
    private List<Map<String, String>> attachments; // e.g. [{filename: "a", url: "b"}]
    
    private Date createdAt = new Date();
}
