package com.expenses_tracker.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.expenses_tracker.entity.Budget;
import com.expenses_tracker.entity.Expense;
import com.expenses_tracker.entity.User;
import com.expenses_tracker.repository.BudgetRepository;
import com.expenses_tracker.repository.ExpenseRepository;
import com.expenses_tracker.repository.UserRepository;
import com.expenses_tracker.service.NotificationService;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class BudgetController {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;
    
    @Autowired
    private NotificationService notificationService;

    /**
     * Create a new budget
     */
    @PostMapping
    public Budget createBudget(@RequestBody Map<String, Object> budgetRequest) {
        // Extract userId from request
        Object userIdObj = budgetRequest.get("userId");
        if (userIdObj == null) {
            throw new RuntimeException("User ID must be provided to create a budget.");
        }

        Long userId = Long.valueOf(userIdObj.toString());
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Create budget from request data
        Budget budget = new Budget();
        budget.setCategory((String) budgetRequest.get("category"));
        budget.setLimitAmount(new BigDecimal(budgetRequest.get("limitAmount").toString()));
        budget.setStartDate(LocalDate.parse((String) budgetRequest.get("startDate")));
        budget.setEndDate(LocalDate.parse((String) budgetRequest.get("endDate")));
        budget.setUser(user);
        
        return budgetRepository.save(budget);
    }

    /**
     * Get all budgets for a specific user
     */
    @GetMapping("/user/{userId}")
    public List<Budget> getBudgetsByUserId(@PathVariable Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    /**
     * Get all budgets
     */
    @GetMapping
    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    /**
     * Get budget by ID
     */
    @GetMapping("/{id}")
    public Budget getBudgetById(@PathVariable Long id) {
        return budgetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id));
    }

    /**
     * Update an existing budget
     */
    @PutMapping("/{id}")
    public Budget updateBudget(@PathVariable Long id, @RequestBody Budget budgetDetails) {
        Budget existingBudget = budgetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id));

        existingBudget.setCategory(budgetDetails.getCategory());
        existingBudget.setLimitAmount(budgetDetails.getLimitAmount());
        existingBudget.setStartDate(budgetDetails.getStartDate());
        existingBudget.setEndDate(budgetDetails.getEndDate());

        return budgetRepository.save(existingBudget);
    }

    /**
     * Get actual spending for a specific budget
     */
    @GetMapping("/{id}/spending")
    public BigDecimal getBudgetSpending(@PathVariable Long id) {
        Budget budget = budgetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id));
        
        // Get all expenses for this category and date range
        List<Expense> expenses = expenseRepository.findByUserId(budget.getUser().getId());
        
        return expenses.stream()
            .filter(e -> e.getCategory().equals(budget.getCategory()))
            .filter(e -> !e.getDate().isBefore(budget.getStartDate()))
            .filter(e -> !e.getDate().isAfter(budget.getEndDate()))
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Delete a budget
     */
    @DeleteMapping("/{id}")
    public void deleteBudget(@PathVariable Long id) {
        Budget budget = budgetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id));
        budgetRepository.delete(budget);
    }

    /**
     * Get active budget for a user and category
     */
    @GetMapping("/active/user/{userId}/category/{category}")
    public Optional<Budget> getActiveBudgetByUserAndCategory(@PathVariable Long userId, 
                                                             @PathVariable String category) {
        LocalDate today = LocalDate.now();
        return budgetRepository.findActiveBudgetByUserAndCategory(userId, category, today);
    }

    /**
     * Calculate total spending for a user and category within a date range
     */
    @GetMapping("/spending/user/{userId}/category/{category}")
    public BigDecimal getTotalSpendingByUserAndCategory(@PathVariable Long userId, 
                                                        @PathVariable String category,
                                                        @RequestParam String startDate,
                                                        @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return budgetRepository.calculateTotalSpendingByUserAndCategory(userId, category, start, end);
    }
    
    /**
     * Check all budgets for a user and create notifications for over-limit budgets
     */
    @PostMapping("/check-alerts/user/{userId}")
    public Map<String, Object> checkBudgetAlerts(@PathVariable Long userId) {
        List<Budget> userBudgets = budgetRepository.findByUserId(userId);
        int alertsCreated = 0;
        int budgetsChecked = 0;
        
        for (Budget budget : userBudgets) {
            budgetsChecked++;
            
            // Calculate total spending for this budget
            BigDecimal totalSpending = budgetRepository.calculateTotalSpendingByUserAndCategory(
                userId, budget.getCategory(), budget.getStartDate(), budget.getEndDate());
            
            // Calculate remaining budget
            BigDecimal remainingBudget = budget.getLimitAmount().subtract(totalSpending);
            
            // Check if budget exceeded (Over Limit - 100%+)
            if (remainingBudget.compareTo(BigDecimal.ZERO) <= 0) {
                String message = String.format("🚨 Budget Alert: You have exceeded your %s budget of ₹%.2f! Current spending: ₹%.2f", 
                    budget.getCategory(), budget.getLimitAmount(), totalSpending);
                
                // Create notification for over limit
                notificationService.createNotification(userId, message);
                alertsCreated++;
            }
            // Check if spending exceeds 90% of budget limit (Approaching limit)
            else {
                BigDecimal threshold = budget.getLimitAmount().multiply(new BigDecimal("0.9"));
                
                if (totalSpending.compareTo(threshold) > 0) {
                    String message = String.format("⚠️ Budget Alert: You have only ₹%.2f left in your %s budget!", 
                        remainingBudget, budget.getCategory());
                    
                    // Create notification for approaching limit
                    notificationService.createNotification(userId, message);
                    alertsCreated++;
                }
            }
        }
        
        return Map.of(
            "budgetsChecked", budgetsChecked,
            "alertsCreated", alertsCreated,
            "message", alertsCreated + " budget alert(s) created"
        );
    }
}
