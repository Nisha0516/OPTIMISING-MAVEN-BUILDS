package com.carrental.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@NoArgsConstructor
@Document(collection = "favorites")
@CompoundIndex(name = "customer_car_idx", def = "{'customerId': 1, 'carId': 1}", unique = true)
public class Favorite {

    @Id
    private String id;
    
    private String customerId;
    
    private String carId;
    
    private Date createdAt = new Date();
}
