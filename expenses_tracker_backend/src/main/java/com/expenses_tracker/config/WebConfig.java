package com.expenses_tracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**") // Apply to all API routes
                        .allowedOrigins("http://localhost:3000") // Allow your frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow all methods
                        .allowedHeaders("*") // Allow all headers
                        .allowCredentials(true); // THIS IS THE KEY
            }
            
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                // Serve uploaded profile photos
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations("file:uploads/");
            }
        };
    }
}
