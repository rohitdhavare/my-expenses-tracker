package com.expenses_tracker.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.expenses_tracker.dto.AuthRequest;
import com.expenses_tracker.dto.RegisterRequest;
import com.expenses_tracker.entity.ERole;
import com.expenses_tracker.entity.Role;
import com.expenses_tracker.entity.User;
import com.expenses_tracker.repository.RoleRepository;
import com.expenses_tracker.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    // --- These are your class fields, they must be declared here ---
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // --- This is your constructor ---
    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // --- This is your helper method ---
    private User getCurrentUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
    }

    /**
     * NEW ENDPOINT: Gets the details for the currently logged-in user.
     */
    @GetMapping("/me") // <-- THIS ANNOTATION WAS MISSING
    public ResponseEntity<?> getCurrentUserDetails(@AuthenticationPrincipal UserDetails currentUser) {
        try {
            User user = getCurrentUser(currentUser);
            
            // Return a simple map of details (never send the password!)
            Map<String, Object> userDetailsMap = Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail()
            );
            return ResponseEntity.ok(userDetailsMap);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
    }

    /**
     * NEW ENDPOINT: Deletes the currently logged-in user's account.
     */
    @DeleteMapping("/me") // <-- THIS ANNOTATION WAS MISSING
    public ResponseEntity<?> deleteCurrentUser(@AuthenticationPrincipal UserDetails currentUser) {
        try {
            User user = getCurrentUser(currentUser);
            
            userRepository.delete(user);
            SecurityContextHolder.clearContext();
            
            return ResponseEntity.ok(Map.of("message", "User account deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
    }

    // --- This is your register method ---
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already taken"));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        String roleStr = request.getRole();
        ERole roleName = (roleStr != null && roleStr.equalsIgnoreCase("ADMIN")) 
            ? ERole.ROLE_ADMIN 
            : ERole.ROLE_USER;

        Role userRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        user.getRoles().add(userRole);

        userRepository.save(user);

        return ResponseEntity.status(201).body(Map.of("message", "User registered successfully"));
    }

    // --- This is your login method ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletRequest req) {
        try {
            System.out.println("Login attempt for user: " + request.getUsername());
            
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            System.out.println("Authentication successful for: " + request.getUsername());
            
            SecurityContextHolder.getContext().setAuthentication(auth);
            
            HttpSession session = req.getSession(true); 
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());
            
            System.out.println("Session created with ID: " + session.getId());

            UserDetails principal = (UserDetails) auth.getPrincipal();

            List<String> roles = principal.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .toList();

            return ResponseEntity.ok(Map.of(
                "roles", roles,
                "username", request.getUsername()
            ));
        } catch (BadCredentialsException ex) {
            System.err.println("Login failed for user: " + request.getUsername() + " - Bad credentials");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        } catch (Exception ex) {
            System.err.println("Login error: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Login failed: " + ex.getMessage()));
        }
    }
}
