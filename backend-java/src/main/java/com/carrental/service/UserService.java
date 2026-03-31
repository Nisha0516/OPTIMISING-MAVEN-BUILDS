package com.carrental.service;

import com.carrental.dto.LoginDto;
import com.carrental.dto.UserDto;
import com.carrental.model.User;
import com.carrental.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(UserDto userDto) {
        // Check if user already exists
        if (userRepository.findByEmail(userDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists!");
        }

        User user = new User();
        user.setName(userDto.getName());
        user.setEmail(userDto.getEmail().toLowerCase());
        user.setPhone(userDto.getPhone());
        
        if (userDto.getRole() != null) {
            user.setRole(userDto.getRole());
        }
        
        user.setDrivingLicense(userDto.getDrivingLicense());

        // Hash password
        String hashedPassword = BCrypt.hashpw(userDto.getPassword(), BCrypt.gensalt(10));
        user.setPassword(hashedPassword);

        return userRepository.save(user);
    }

    public User loginUser(LoginDto loginDto) {
        Optional<User> optionalUser = userRepository.findByEmail(loginDto.getEmail().toLowerCase());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (BCrypt.checkpw(loginDto.getPassword(), user.getPassword())) {
                return user; // Successfully logged in
            }
        }
        throw new RuntimeException("Invalid email or password!");
    }
    
    public User getUserById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
