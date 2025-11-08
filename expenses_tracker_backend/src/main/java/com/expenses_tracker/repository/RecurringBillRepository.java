package com.expenses_tracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.expenses_tracker.entity.RecurringBill;

@Repository
public interface RecurringBillRepository extends JpaRepository<RecurringBill, Long> {

    /**
     * Find all recurring bills for a specific user
     */
    List<RecurringBill> findByUserId(Long userId);

    /**
     * Find recurring bills that are due on a specific day of the month
     */
    List<RecurringBill> findByDayOfMonthDue(int dayOfMonth);
}
