package com.expenses_tracker.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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

import com.expenses_tracker.entity.Expense;
import com.expenses_tracker.entity.User;
import com.expenses_tracker.repository.UserRepository;
import com.expenses_tracker.service.ExpenseService;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public Expense addExpense(@RequestBody Expense expense, @AuthenticationPrincipal UserDetails currentUser) {
        User user = getUserFromDetails(currentUser);
        System.out.println("DEBUG: Adding expense for user: " + user.getUsername() + " (ID: " + user.getId() + ")");
        System.out.println("DEBUG: Expense details - Title: " + expense.getTitle() + ", Amount: " + expense.getAmount());
        expense.setUser(user);
        Expense saved = expenseService.addExpense(expense);
        System.out.println("DEBUG: Expense saved with ID: " + saved.getId());
        return saved;
    }

    @GetMapping
    public List<Expense> getAllExpenses(@AuthenticationPrincipal UserDetails currentUser) {
        User user = getUserFromDetails(currentUser);
        System.out.println("DEBUG: Fetching expenses for user: " + user.getUsername() + " (ID: " + user.getId() + ")");
        List<Expense> expenses = expenseService.getExpensesByUserId(user.getId());
        System.out.println("DEBUG: Found " + expenses.size() + " expenses for user " + user.getId());
        return expenses;
    }

    @GetMapping("/type/{expenseType}")
    public List<Expense> getExpensesByType(@PathVariable String expenseType) {
        return expenseService.getExpensesByType(expenseType);
    }

    @GetMapping("/{id}")
    public Expense getExpenseById(@PathVariable Long id) {
        return expenseService.getExpenseById(id);
    }

    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable Long id, @RequestBody Expense expenseDetails) {
        return expenseService.updateExpense(id, expenseDetails);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/togglePin")
    public ResponseEntity<Void> togglePin(@PathVariable Long id) {
        expenseService.togglePin(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public List<Expense> searchExpenses(@RequestParam String keyword) {
        return expenseService.searchByKeyword(keyword);
    }

    @GetMapping("/filter/category")
    public List<Expense> filterByCategory(@RequestParam String category) {
        return expenseService.filterByCategory(category);
    }

    @GetMapping("/filter/payment-method")
    public List<Expense> filterByPaymentMethod(@RequestParam String paymentMethod) {
        return expenseService.filterByPaymentMethod(paymentMethod);
    }

    @GetMapping("/filter/date-range")
    public List<Expense> filterByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return expenseService.filterByDateRange(startDate, endDate);
    }

    @GetMapping("/filter/type-category")
    public List<Expense> filterByTypeAndCategory(@RequestParam String expenseType, @RequestParam String category) {
        return expenseService.filterByTypeAndCategory(expenseType, category);
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
    }
}
