package com.expenses_tracker.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.expenses_tracker.repository.UserRepository;
import com.expenses_tracker.service.ReportService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Generate user expense report in specified format
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> generateUserReport(@PathVariable Long userId,
                                              @RequestParam String format,
                                              @AuthenticationPrincipal UserDetails currentUser) {
        try {
            // Validate user access
            validateUserAccess(userId, currentUser);
            
            // Validate format
            if (!isValidFormat(format)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid format. Supported: csv, excel, pdf"));
            }
            
            byte[] reportData;
            String contentType;
            String fileExtension;
            
            switch (format.toLowerCase()) {
                case "csv":
                    reportData = reportService.generateUserCSVReport(userId);
                    contentType = "text/csv";
                    fileExtension = "csv";
                    break;
                case "excel":
                    reportData = reportService.generateUserExcelReport(userId);
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    fileExtension = "xlsx";
                    break;
                case "pdf":
                    reportData = reportService.generateUserPDFReport(userId);
                    contentType = "application/pdf";
                    fileExtension = "pdf";
                    break;
                default:
                    return ResponseEntity.badRequest().body(Map.of("error", "Unsupported format"));
            }
            
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("user_expenses_%d_%s.%s", userId, timestamp, fileExtension);
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(reportData);
                
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get available report formats
     */
    @GetMapping("/formats")
    public ResponseEntity<?> getAvailableFormats() {
        return ResponseEntity.ok(Map.of(
            "formats", new String[]{"csv", "excel", "pdf"},
            "descriptions", Map.of(
                "csv", "Comma-separated values file",
                "excel", "Microsoft Excel spreadsheet",
                "pdf", "Portable Document Format"
            )
        ));
    }

    private void validateUserAccess(Long userId, UserDetails currentUser) {
        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }
        
        var currentUserEntity = userRepository.findByUsername(currentUser.getUsername())
            .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        
        // Check if user is accessing their own data or is admin
        if (!currentUserEntity.getId().equals(userId) && 
            !currentUserEntity.getRoles().stream().anyMatch(role -> role.getName().name().equals("ROLE_ADMIN"))) {
            throw new RuntimeException("Access denied");
        }
    }

    private boolean isValidFormat(String format) {
        return format != null && (format.equalsIgnoreCase("csv") || 
                                 format.equalsIgnoreCase("excel") || 
                                 format.equalsIgnoreCase("pdf"));
    }
}
