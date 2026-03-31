package com.carrental.dto;

import lombok.Data;
import java.util.Map;

@Data
public class PaymentDto {
    private String bookingId;
    private String customerId;
    private Double amount;
    private String paymentMethod;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private Map<String, String> cardDetails;
    private String upiId;
    private String notes;
}
