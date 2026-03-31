package com.carrental.config;

import com.carrental.model.User;
import com.carrental.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed admin user if it doesn't already exist
        if (userRepository.findByEmail("admin@carrental.com").isEmpty()) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@carrental.com");
            admin.setPassword(BCrypt.hashpw("admin123", BCrypt.gensalt(10)));
            admin.setRole("admin");
            admin.setPhone("9999999999");
            userRepository.save(admin);
            System.out.println("✅ Default admin user created: admin@carrental.com / admin123");
        } else {
            System.out.println("ℹ️ Admin user already exists, skipping seed.");
        }
    }
}
