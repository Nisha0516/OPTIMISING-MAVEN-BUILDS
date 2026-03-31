package com.carrental.service;

import com.carrental.model.Favorite;
import com.carrental.model.Insurance;
import com.carrental.model.Maintenance;
import com.carrental.model.Message;
import com.carrental.repository.FavoriteRepository;
import com.carrental.repository.InsuranceRepository;
import com.carrental.repository.MaintenanceRepository;
import com.carrental.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OperationalService {

    // Centralizing these services to reduce file clutter, as they are simple CRUD proxies

    @Autowired private FavoriteRepository favoriteRepository;
    @Autowired private InsuranceRepository insuranceRepository;
    @Autowired private MaintenanceRepository maintenanceRepository;
    @Autowired private MessageRepository messageRepository;

    /* Favorites */
    public Favorite addFavorite(Favorite favorite) {
        return favoriteRepository.save(favorite);
    }
    public List<Favorite> getCustomerFavorites(String customerId) {
        return favoriteRepository.findByCustomerId(customerId);
    }
    public void removeFavorite(String id) {
        favoriteRepository.deleteById(id);
    }

    /* Insurance */
    public Insurance addInsurance(Insurance insurance) {
        return insuranceRepository.save(insurance);
    }
    public List<Insurance> getCarInsurance(String carId) {
        return insuranceRepository.findByCarId(carId);
    }

    /* Maintenance */
    public Maintenance addMaintenanceLog(Maintenance maintenance) {
        return maintenanceRepository.save(maintenance);
    }
    public List<Maintenance> getCarMaintenanceLogs(String carId) {
        return maintenanceRepository.findByCarId(carId);
    }

    /* Messages */
    public Message sendMessage(Message message) {
        return messageRepository.save(message);
    }
    public List<Message> getInbox(String receiverId) {
        return messageRepository.findByReceiverId(receiverId);
    }
}
