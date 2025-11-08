package com.expenses_tracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.expenses_tracker.entity.Notification;
import com.expenses_tracker.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * Get all notifications for a specific user
     */
    @GetMapping("/{userId}")
    public List<Notification> getNotificationsByUserId(@PathVariable Long userId) {
        return notificationService.getNotificationsByUserId(userId);
    }

    /**
     * Get all unread notifications for a specific user
     */
    @GetMapping("/{userId}/unread")
    public List<Notification> getUnreadNotificationsByUserId(@PathVariable Long userId) {
        return notificationService.getUnreadNotificationsByUserId(userId);
    }

    /**
     * Mark a specific notification as read
     */
    @PostMapping("/{notificationId}/mark-read")
    public void markNotificationAsRead(@PathVariable Long notificationId) {
        notificationService.markNotificationAsRead(notificationId);
    }

    /**
     * Mark a specific notification as unread
     */
    @PostMapping("/{notificationId}/mark-unread")
    public void markNotificationAsUnread(@PathVariable Long notificationId) {
        notificationService.markNotificationAsUnread(notificationId);
    }

    /**
     * Mark all notifications as read for a user
     */
    @PostMapping("/{userId}/mark-all-read")
    public void markAllNotificationsAsRead(@PathVariable Long userId) {
        notificationService.markAllNotificationsAsRead(userId);
    }

    /**
     * Delete a specific notification
     */
    @DeleteMapping("/{notificationId}")
    public void deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
    }
    
    /**
     * Delete all notifications for a user
     */
    @DeleteMapping("/user/{userId}/delete-all")
    public void deleteAllNotifications(@PathVariable Long userId) {
        notificationService.deleteAllNotifications(userId);
    }
}
