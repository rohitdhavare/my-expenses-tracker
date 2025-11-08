package com.expenses_tracker.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.expenses_tracker.entity.User;
import com.expenses_tracker.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // CREATE: Add a new user
    @PostMapping
    public User addUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    // READ: Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // READ: Get user by ID
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    // READ: Get user by username
    @GetMapping("/username/{username}")
    public User getUserByUsername(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    // UPDATE: Update an existing user
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Update username if provided
        if (userDetails.getUsername() != null) {
            existingUser.setUsername(userDetails.getUsername());
        }
        
        // Update email if provided
        if (userDetails.getEmail() != null) {
            existingUser.setEmail(userDetails.getEmail());
        }
        
        // Update birthdate if provided
        if (userDetails.getBirthdate() != null) {
            existingUser.setBirthdate(userDetails.getBirthdate());
        }
        
        // Update darkMode preference
        existingUser.setDarkMode(userDetails.isDarkMode());
        
        // Update preferredCurrency if provided
        if (userDetails.getPreferredCurrency() != null) {
            existingUser.setPreferredCurrency(userDetails.getPreferredCurrency());
        }
        
        // Update accessibilityMode
        existingUser.setAccessibilityMode(userDetails.isAccessibilityMode());
        
        // Update profilePhotoUrl if provided
        if (userDetails.getProfilePhotoUrl() != null) {
            existingUser.setProfilePhotoUrl(userDetails.getProfilePhotoUrl());
        }
        
        return userRepository.save(existingUser);
    }
    
    // UPLOAD: Upload profile photo
    @PostMapping("/{id}/upload-photo")
    public ResponseEntity<?> uploadProfilePhoto(@PathVariable Long id, @RequestParam("photo") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Only image files are allowed");
            }
            
            // Create uploads directory if it doesn't exist
            String uploadDir = "uploads/profile-photos/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
            String filename = "user_" + id + "_" + UUID.randomUUID().toString() + fileExtension;
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Update user profile photo URL
            User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
            
            String photoUrl = "/uploads/profile-photos/" + filename;
            user.setProfilePhotoUrl(photoUrl);
            userRepository.save(user);
            
            return ResponseEntity.ok().body(new PhotoUploadResponse(photoUrl, "Photo uploaded successfully"));
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload photo: " + e.getMessage());
        }
    }
    
    // Helper class for photo upload response
    static class PhotoUploadResponse {
        private String photoUrl;
        private String message;
        
        public PhotoUploadResponse(String photoUrl, String message) {
            this.photoUrl = photoUrl;
            this.message = message;
        }
        
        public String getPhotoUrl() {
            return photoUrl;
        }
        
        public String getMessage() {
            return message;
        }
    }

    // DELETE: Delete a user
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        userRepository.delete(user);
    }
}
