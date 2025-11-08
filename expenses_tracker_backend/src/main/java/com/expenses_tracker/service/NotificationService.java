package com.expenses_tracker.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.expenses_tracker.entity.Notification;
import com.expenses_tracker.entity.RecurringBill;
import com.expenses_tracker.entity.User;
import com.expenses_tracker.repository.NotificationRepository;
import com.expenses_tracker.repository.RecurringBillRepository;
import com.expenses_tracker.repository.UserRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private RecurringBillRepository recurringBillRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Scheduled task that runs every minute
     * Checks for bills that need reminders based on custom reminder settings
     */
    @Scheduled(cron = "0 * * * * *") // Runs every minute at the start of the minute
    public void checkForUpcomingBills() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        int currentHour = now.getHour();
        int currentMinute = now.getMinute();
        
        System.out.println("=== Bill Notification Check at " + now + " ===");
        
        // Get all recurring bills
        List<RecurringBill> allBills = recurringBillRepository.findAll();
        System.out.println("Found " + allBills.size() + " total bills");
        
        for (RecurringBill bill : allBills) {
            // Skip if bill has no due date set
            if (bill.getNextDueDate() == null) {
                System.out.println("Skipping bill '" + bill.getName() + "' - no due date set");
                continue;
            }
            
            // Get custom reminder settings or use defaults (only if null)
            int reminderDaysBefore = bill.getReminderDaysBefore() != null ? bill.getReminderDaysBefore() : 2;
            int reminderHour = bill.getReminderHour() != null ? bill.getReminderHour() : 9;
            int reminderMinute = bill.getReminderMinute() != null ? bill.getReminderMinute() : 0;
            
            System.out.println("Checking bill: " + bill.getName() + 
                             " | Due: " + bill.getNextDueDate() + 
                             " | Remind: " + reminderDaysBefore + " days before at " + 
                             String.format("%02d:%02d", reminderHour, reminderMinute));
            
            // Calculate when the reminder should be sent
            LocalDate reminderDate = bill.getNextDueDate().minusDays(reminderDaysBefore);
            
            System.out.println("  Reminder date: " + reminderDate + " | Today: " + today);
            
            // Check if today is the reminder date
            if (reminderDate.equals(today)) {
                System.out.println("  ✓ Today is reminder date!");
                
                // Check if current time matches the reminder time (exact hour and minute)
                if (currentHour == reminderHour && currentMinute == reminderMinute) {
                    System.out.println("  ✓ Time matches! Current: " + currentHour + ":" + currentMinute);
                    
                    // Check if notification already exists for this bill today
                    if (!hasNotificationToday(bill.getUser().getId(), bill.getName())) {
                        System.out.println("  ✓ No notification sent yet today. Creating notification...");
                        
                        // Create notification
                        String message = String.format("Reminder: Your '%s' bill of ₹%.2f is due in %d day(s).", 
                            bill.getName(), bill.getAmount(), reminderDaysBefore);
                        
                        createNotification(bill.getUser(), message);
                        System.out.println("  ✅ Notification created!");
                    } else {
                        System.out.println("  ⏭ Notification already sent today");
                    }
                } else {
                    System.out.println("  ✗ Time doesn't match. Expected: " + reminderHour + ":" + reminderMinute + 
                                     " | Current: " + currentHour + ":" + currentMinute);
                }
            } else {
                System.out.println("  ✗ Not reminder date yet");
            }
        }
        
        System.out.println("=== Check complete ===\n");
    }
    
    /**
     * Check if a notification for this bill was already created today
     */
    private boolean hasNotificationToday(Long userId, String billName) {
        List<Notification> todayNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        LocalDate today = LocalDate.now();
        
        for (Notification notification : todayNotifications) {
            // Check if notification was created today and contains the bill name
            if (notification.getCreatedAt() != null) {
                LocalDate notificationDate = notification.getCreatedAt().toLocalDateTime().toLocalDate();
                if (notificationDate.equals(today) && notification.getMessage().contains(billName)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Create a new notification for a user (only if it doesn't already exist)
     */
    public Notification createNotification(User user, String message) {
        // Check if similar notification already exists (within last 24 hours)
        if (hasSimilarRecentNotification(user.getId(), message)) {
            System.out.println("Skipping duplicate notification: " + message);
            return null;
        }
        
        Notification notification = new Notification(message, user);
        return notificationRepository.save(notification);
    }

    /**
     * Create a new notification for a user by user ID (only if it doesn't already exist)
     */
    public Notification createNotification(Long userId, String message) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return createNotification(user, message);
    }
    
    /**
     * Check if a similar notification already exists within the last 24 hours
     */
    private boolean hasSimilarRecentNotification(Long userId, String message) {
        LocalDateTime yesterday = LocalDateTime.now().minusHours(24);
        List<Notification> recentNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        return recentNotifications.stream()
            .filter(n -> n.getCreatedAt().toLocalDateTime().isAfter(yesterday))
            .anyMatch(n -> n.getMessage().equals(message));
    }

    /**
     * Get all notifications for a user, ordered by newest first
     */
    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get all unread notifications for a user, ordered by newest first
     */
    public List<Notification> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    /**
     * Mark a notification as read
     */
    public void markNotificationAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    /**
     * Mark a notification as unread
     */
    public void markNotificationAsUnread(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for a user
     */
    public void markAllNotificationsAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Delete a notification
     */
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
    
    /**
     * Delete all notifications for a user
     */
    public void deleteAllNotifications(Long userId) {
        List<Notification> userNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(userNotifications);
    }
}
