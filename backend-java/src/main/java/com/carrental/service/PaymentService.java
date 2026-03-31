package com.carrental.service;

import com.carrental.dto.PaymentDto;
import com.carrental.model.Payment;
import com.carrental.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public Payment processPayment(PaymentDto paymentDto) {
        Payment payment = new Payment();
        payment.setBookingId(paymentDto.getBookingId());
        payment.setCustomerId(paymentDto.getCustomerId());
        payment.setAmount(paymentDto.getAmount());
        payment.setPaymentMethod(paymentDto.getPaymentMethod());
        payment.setRazorpayOrderId(paymentDto.getRazorpayOrderId());
        payment.setRazorpayPaymentId(paymentDto.getRazorpayPaymentId());
        payment.setRazorpaySignature(paymentDto.getRazorpaySignature());
        payment.setCardDetails(paymentDto.getCardDetails());
        payment.setUpiId(paymentDto.getUpiId());
        payment.setNotes(paymentDto.getNotes());
        
        // Mock successful payment
        payment.setStatus("Completed");
        payment.setTransactionId("TXN" + System.currentTimeMillis());

        return paymentRepository.save(payment);
    }

    public List<Payment> getCustomerPayments(String customerId) {
        return paymentRepository.findByCustomerId(customerId);
    }
}
