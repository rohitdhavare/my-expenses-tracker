package com.expenses_tracker.controller;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.expenses_tracker.entity.Expense;
import com.expenses_tracker.entity.User;
import com.expenses_tracker.repository.ExpenseRepository;
import com.expenses_tracker.repository.UserRepository;

@RestController
@RequestMapping("/api/data")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class DataController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    // Initialize sample data for testing
    @PostMapping("/init")
    public String initializeSampleData() {
        // Create sample users
        User user1 = new User();
        user1.setUsername("john_doe");
        user1.setEmail("john@example.com"); // <-- ADD THIS
        user1.setPassword("password123");
        userRepository.save(user1);

        User user2 = new User();
        user2.setUsername("jane_smith");
        user2.setEmail("jane@example.com"); // <-- ADD THIS
        user2.setPassword("password456");
        userRepository.save(user2);

        // Sample categories as strings
        String food = "Food";
        String transport = "Transport";
        String business = "Business";
        String entertainment = "Entertainment";

        // Create sample expenses
        Expense expense1 = new Expense();
        expense1.setTitle("Lunch");
        expense1.setDescription("Lunch at restaurant");
        expense1.setAmount(new BigDecimal("25.50"));
        expense1.setDate(LocalDate.now());
        expense1.setPaymentMethod("Credit Card");
        expense1.setExpenseType("PERSONAL");
        expense1.setCategory(food);
        expense1.setUser(user1);
        expenseRepository.save(expense1);

        Expense expense2 = new Expense();
        expense2.setTitle("Client Dinner");
        expense2.setDescription("Client meeting dinner");
        expense2.setAmount(new BigDecimal("120.00"));
        expense2.setDate(LocalDate.now().minusDays(1));
        expense2.setPaymentMethod("Company Card");
        expense2.setExpenseType("PROFESSIONAL");
        expense2.setCategory(business);
        expense2.setUser(user1);
        expenseRepository.save(expense2);

        Expense expense3 = new Expense();
        expense3.setTitle("Uber Ride");
        expense3.setDescription("Uber ride to office");
        expense3.setAmount(new BigDecimal("15.75"));
        expense3.setDate(LocalDate.now().minusDays(2));
        expense3.setPaymentMethod("Credit Card");
        expense3.setExpenseType("PROFESSIONAL");
        expense3.setCategory(transport);
        expense3.setUser(user2);
        expenseRepository.save(expense3);

        Expense expense4 = new Expense();
        expense4.setTitle("Movie Night");
        expense4.setDescription("Went to the cinema");
        expense4.setAmount(new BigDecimal("30.00"));
        expense4.setDate(LocalDate.now().minusDays(3));
        expense4.setPaymentMethod("Cash");
        expense4.setExpenseType("PERSONAL");
        expense4.setCategory(entertainment); // <-- using it now
        expense4.setUser(user2);
        expenseRepository.save(expense4);


        return "Sample data initialized successfully!";
    }

    // Clear all data
    @DeleteMapping("/clear")
    public String clearAllData() {
        expenseRepository.deleteAll();
        userRepository.deleteAll();
        return "All data cleared successfully!";
    }

    // Get all data for verification
    @GetMapping("/status")
    public String getDataStatus() {
        long userCount = userRepository.count();
        long expenseCount = expenseRepository.count();

        return String.format("Users: %d, Expenses: %d", 
                             userCount, expenseCount);
    }
}
