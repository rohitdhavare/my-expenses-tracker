package com.expenses_tracker.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.expenses_tracker.entity.User;
import com.expenses_tracker.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserPreferencesController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get user preferences
     */
    @GetMapping("/{id}/preferences")
    public ResponseEntity<?> getUserPreferences(@PathVariable Long id,
                                               @AuthenticationPrincipal UserDetails currentUser) {
        try {
            User currentUserEntity = getUserFromDetails(currentUser);
            
            // Check if user is accessing their own preferences or is admin
            if (!currentUserEntity.getId().equals(id) && 
                !currentUserEntity.getRoles().stream().anyMatch(role -> role.getName().name().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Map<String, Object> preferences = Map.of(
                "darkMode", user.isDarkMode(),
                "accessibilityMode", user.isAccessibilityMode(),
                "preferredCurrency", user.getPreferredCurrency()
            );
            
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update user preferences
     */
    @PutMapping("/{id}/preferences")
    public ResponseEntity<?> updateUserPreferences(@PathVariable Long id,
                                                 @RequestBody Map<String, Object> preferences,
                                                 @AuthenticationPrincipal UserDetails currentUser) {
        try {
            User currentUserEntity = getUserFromDetails(currentUser);
            
            // Check if user is updating their own preferences or is admin
            if (!currentUserEntity.getId().equals(id) && 
                !currentUserEntity.getRoles().stream().anyMatch(role -> role.getName().name().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Update preferences
            if (preferences.containsKey("darkMode")) {
                user.setDarkMode((Boolean) preferences.get("darkMode"));
            }
            
            if (preferences.containsKey("accessibilityMode")) {
                user.setAccessibilityMode((Boolean) preferences.get("accessibilityMode"));
            }
            
            if (preferences.containsKey("preferredCurrency")) {
                String currency = (String) preferences.get("preferredCurrency");
                if (currency != null && !currency.isEmpty()) {
                    user.setPreferredCurrency(currency);
                }
            }
            
            User updatedUser = userRepository.save(user);
            
            Map<String, Object> response = Map.of(
                "message", "Preferences updated successfully",
                "darkMode", updatedUser.isDarkMode(),
                "accessibilityMode", updatedUser.isAccessibilityMode(),
                "preferredCurrency", updatedUser.getPreferredCurrency()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
    }
}
