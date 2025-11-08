package com.expenses_tracker.config;

import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.expenses_tracker.entity.ERole;
import com.expenses_tracker.entity.Role;
import com.expenses_tracker.entity.User;
import com.expenses_tracker.repository.RoleRepository;
import com.expenses_tracker.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initializeRoles();
        initializeDefaultAdmin();
    }

    private void initializeRoles() {
        addRoleIfNotExists(ERole.ROLE_USER);
        addRoleIfNotExists(ERole.ROLE_ADMIN);
    }

    private void addRoleIfNotExists(ERole roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role newRole = new Role();
            newRole.setName(roleName);
            roleRepository.save(newRole);
            System.out.println("✅ Created role: " + roleName);
        }
    }

    private void initializeDefaultAdmin() {
        Optional<User> existingAdmin = userRepository.findByUsername("admin");

        if (existingAdmin.isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            // ✅ Always encode the password
            admin.setPassword(passwordEncoder.encode("admin123"));
            
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));
            admin.getRoles().add(adminRole);

            // Optional: set defaults for rupee currency, dark mode, etc.
            admin.setPreferredCurrency("INR");
            admin.setDarkMode(false);
            admin.setAccessibilityMode(false);

            userRepository.save(admin);
            System.out.println("👑 Default admin created: admin / admin123");
        }
    }
}
