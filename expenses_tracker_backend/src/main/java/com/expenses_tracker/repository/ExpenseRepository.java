package com.expenses_tracker.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.expenses_tracker.entity.Expense;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    /**
     * Finds all expenses by expense type (PERSONAL or PROFESSIONAL).
     */
    List<Expense> findByExpenseTypeIgnoreCase(String expenseType);

    /**
     * Filters expenses by category (string now, not entity).
     */
    List<Expense> findByCategoryIgnoreCase(String category);

    /**
     * Filters expenses by payment method.
     */
    List<Expense> findByPaymentMethodIgnoreCase(String paymentMethod);

    /**
     * Filters expenses that fall within a given date range.
     */
    List<Expense> findByDateBetween(LocalDate startDate, LocalDate endDate);

    /**
     * Filters expenses by expense type and category (string).
     */
    List<Expense> findByExpenseTypeIgnoreCaseAndCategoryIgnoreCase(String expenseType, String category);

    /**
     * Searches for a keyword in title, description, and category (string).
     */
    @Query("SELECT e FROM Expense e WHERE " +
           "LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.category) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Expense> searchExpenses(@Param("keyword") String keyword);

    /**
     * Find expenses by user ID
     */
    List<Expense> findByUserId(Long userId);

    /**
     * Find expenses by user ID, ordered by newest first
     */
    List<Expense> findByUserIdOrderByDateDesc(Long userId);

    /**
     * Find all expenses ordered by newest first
     */
    List<Expense> findAllByOrderByDateDesc();
}
