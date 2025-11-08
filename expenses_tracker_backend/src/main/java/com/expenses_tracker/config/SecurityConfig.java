package com.expenses_tracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import jakarta.servlet.http.HttpServletResponse; // <-- NEW IMPORT

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;

    public SecurityConfig(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS using the Bean defined below
            .cors(Customizer.withDefaults())
            // Disable CSRF protection (common for stateless APIs)
            .csrf(AbstractHttpConfigurer::disable)
            // Define authorization rules
            .authorizeHttpRequests(auth -> auth
                // Allow public access to authentication endpoints and static resources
                .requestMatchers(
                    "/api/auth/**",
                    "/api/public/**",
                    "/",
                    "/index.html",
                    "/favicon.ico",
                    "/css/**",
                    "/js/**",
                    "/static/**" // Might be needed for React's static assets
                ).permitAll()
                // Example role-based restrictions (adjust as needed)
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/user/**").hasRole("USER")
                // All other requests must be authenticated
                .anyRequest().authenticated()
            )
            // Configure exception handling for unauthorized access
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) ->
                    res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized")
                )
            )
            // Configure session management (IF_REQUIRED is okay for session cookies)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1) // Prevent concurrent logins
            )
            // Disable default form login
            .formLogin(AbstractHttpConfigurer::disable)
            // Configure logout behavior
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout") // Define the logout endpoint
                .logoutSuccessHandler((req, res, auth) -> res.setStatus(HttpServletResponse.SC_OK)) // Send OK on successful logout
                .invalidateHttpSession(true) // Invalidate session
                .deleteCookies("JSESSIONID") // Delete session cookie
            );

        return http.build();
    }
    // --- BEAN TO CONFIGURE CORS ---


    // --- Authentication Provider Bean ---
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService); // Service to load user details
        provider.setPasswordEncoder(passwordEncoder()); // Password encoder
        return provider;
    }

    // --- Authentication Manager Bean ---
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager(); // Standard way to get the AuthenticationManager
    }

    // --- Password Encoder Bean ---
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Use BCrypt for strong password hashing
    }
}