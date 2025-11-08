package com.expenses_tracker.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.expenses_tracker.entity.Budget;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    /**
     * Find all budgets for a specific user
     */
    List<Budget> findByUserId(Long userId);

    /**
     * Find active budget for a user and category within a date range
     */
    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.category = :category " +
           "AND :expenseDate BETWEEN b.startDate AND b.endDate")
    Optional<Budget> findActiveBudgetByUserAndCategory(@Param("userId") Long userId, 
                                                       @Param("category") String category, 
                                                       @Param("expenseDate") LocalDate expenseDate);

    /**
     * Calculate total spending for a user and category within a budget's date range
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId " +
           "AND e.category = :category AND e.date BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalSpendingByUserAndCategory(@Param("userId") Long userId, 
                                                       @Param("category") String category, 
                                                       @Param("startDate") LocalDate startDate, 
                                                       @Param("endDate") LocalDate endDate);
}
