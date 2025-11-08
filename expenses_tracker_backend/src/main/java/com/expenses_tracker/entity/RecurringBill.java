package com.expenses_tracker.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class RecurringBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String billName; // Alias for name to match frontend
    private BigDecimal amount;
    private String category;
    private String description;
    private String frequency; // DAILY, WEEKLY, MONTHLY, YEARLY
    private int dayOfMonthDue; // Day of month when bill is due (1-31)
    private LocalDate nextDueDate;
    
    // Reminder settings
    private Integer reminderDaysBefore; // How many days before due date to send reminder (default: 2)
    private Integer reminderHour; // Hour of day to send reminder (0-23, default: 9 for 9 AM)
    private Integer reminderMinute; // Minute of hour to send reminder (0-59, default: 0)
    
    // Payment tracking
    private Boolean isPaid = false; // Whether the current bill cycle is paid
    private LocalDate paidDate; // Date when bill was marked as paid

    // Relationship to User
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // Constructors
    public RecurringBill() {}

    public RecurringBill(String name, BigDecimal amount, String category, int dayOfMonthDue, User user) {
        this.name = name;
        this.amount = amount;
        this.category = category;
        this.dayOfMonthDue = dayOfMonthDue;
        this.user = user;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getDayOfMonthDue() {
        return dayOfMonthDue;
    }

    public void setDayOfMonthDue(int dayOfMonthDue) {
        this.dayOfMonthDue = dayOfMonthDue;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getBillName() {
        return billName != null ? billName : name;
    }

    public void setBillName(String billName) {
        this.billName = billName;
        if (this.name == null) {
            this.name = billName;
        }
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFrequency() {
        return frequency != null ? frequency : "MONTHLY";
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public LocalDate getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(LocalDate nextDueDate) {
        this.nextDueDate = nextDueDate;
    }

    public Integer getReminderDaysBefore() {
        return reminderDaysBefore;
    }

    public void setReminderDaysBefore(Integer reminderDaysBefore) {
        this.reminderDaysBefore = reminderDaysBefore;
    }

    public Integer getReminderHour() {
        return reminderHour;
    }

    public void setReminderHour(Integer reminderHour) {
        this.reminderHour = reminderHour;
    }

    public Integer getReminderMinute() {
        return reminderMinute;
    }

    public void setReminderMinute(Integer reminderMinute) {
        this.reminderMinute = reminderMinute;
    }

    public Boolean getIsPaid() {
        return isPaid != null ? isPaid : false;
    }

    public void setIsPaid(Boolean isPaid) {
        this.isPaid = isPaid;
    }

    public LocalDate getPaidDate() {
        return paidDate;
    }

    public void setPaidDate(LocalDate paidDate) {
        this.paidDate = paidDate;
    }
}
