package com.expenses_tracker.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // --- THIS IS THE CORRECTED LINE ---
        // Allow requests from your NGINX frontend origin (port 80)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost", "http://localhost:80"));
        // --- END OF CORRECTION ---

        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // Allow common HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD")); // Added HEAD

        // Allow necessary headers (safer than "*")
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type", "Origin", "Accept", "X-Requested-With"));

        // Expose headers that frontend can read (if needed, e.g., for JWT in headers)
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Set-Cookie")); // Keep if you use Set-Cookie

        // How long the browser can cache preflight responses
        configuration.setMaxAge(3600L); // 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this CORS configuration to all paths
        source.registerCorsConfiguration("/**", configuration); // Or "/api/**" if preferred

        return source;
    }
}