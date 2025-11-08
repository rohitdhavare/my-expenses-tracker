package com.expenses_tracker.service;

import java.time.LocalDate;
import java.util.List;

import com.expenses_tracker.entity.Expense;

public interface ExpenseService {

    // CREATE
    Expense addExpense(Expense expense);

    // READ
    List<Expense> getAllExpenses();

    List<Expense> getExpensesByUserId(Long userId);

    List<Expense> getExpensesByType(String expenseType);

    Expense getExpenseById(Long id);

    // UPDATE
    Expense updateExpense(Long id, Expense expenseDetails);

    // DELETE
    void deleteExpense(Long id);

    // ACTION
    void togglePin(Long id);

    // SEARCH
    List<Expense> searchByKeyword(String keyword);

    // FILTERS
    List<Expense> filterByCategory(String category);

    List<Expense> filterByPaymentMethod(String paymentMethod);

    List<Expense> filterByDateRange(LocalDate startDate, LocalDate endDate);

    List<Expense> filterByTypeAndCategory(String expenseType, String category);
}
