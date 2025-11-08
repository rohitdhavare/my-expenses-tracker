-- 1. Find the ID for the target user 'Dnyaneshwar_19' and store it in a session variable.
-- This ensures the script works regardless of what the user ID is in the container.
SET @my_user_id = 3;

-- 2. INSERT CATEGORIES (REQUIRED FOR FOREIGN KEY)
INSERT IGNORE INTO category (category) VALUES 
('Food'),
('Transport'),
('Entertainment'),
('Shopping'),
('Bills'),
('Healthcare'),
('Education'),
('Business'),
('Other'),
('Subscriptions'),
('Rent'),
('Insurance'),
('Utilities'),
('Loan');

-- 2. INSERT EXPENSES (October 2025)
INSERT INTO expense (title, amount, description, date, category, payment_method, expense_type, is_pinned, user_id) VALUES
('Barfi', 200, 'Diwali sweets', '2025-10-23', 'Food', 'UPI', 'PERSONAL', 0, @my_user_id),
('Monthly Train Pass', 300, 'October pass', '2025-10-01', 'Transport', 'Cash', 'PERSONAL', 0, @my_user_id),
('Movie Tickets', 650, 'Weekend movie', '2025-10-18', 'Entertainment', 'Credit Card', 'PERSONAL', 0, @my_user_id),
('New Jeans', 2500, 'Shopping spree', '2025-10-19', 'Shopping', 'Debit Card', 'PERSONAL', 0, @my_user_id),
('Electricity Bill', 800, 'October bill', '2025-10-15', 'Bills', 'Net Banking', 'PERSONAL', 1, @my_user_id),
('Doctor''s Visit', 1000, 'Consultation fee', '2025-10-10', 'Healthcare', 'UPI', 'PERSONAL', 0, @my_user_id),
('Online Course', 499, 'Web Dev course', '2025-10-05', 'Education', 'Credit Card', 'PROFESSIONAL', 0, @my_user_id),
('Client Lunch', 1200, 'Meeting with Acme Corp', '2025-10-20', 'Business', 'Company Card', 'PROFESSIONAL', 1, @my_user_id),
('Birthday Gift', 700, 'Gift for a friend', '2025-10-22', 'Other', 'UPI', 'PERSONAL', 0, @my_user_id),
('Groceries', 1800, 'Weekly groceries', '2025-10-21', 'Food', 'Debit Card', 'PERSONAL', 0, @my_user_id),
('Cab Fare', 250, 'Ride to office', '2025-10-23', 'Transport', 'UPI', 'PROFESSIONAL', 0, @my_user_id),
('Dinner Out', 900, 'Restaurant with friends', '2025-10-17', 'Food', 'Credit Card', 'PERSONAL', 0, @my_user_id),
('Phone Bill', 599, 'Postpaid plan', '2025-10-12', 'Bills', 'Net Banking', 'PERSONAL', 0, @my_user_id),
('Stationery', 350, 'Notebooks and pens', '2025-10-02', 'Education', 'Cash', 'PERSONAL', 0, @my_user_id),
('Software Subscription', 1500, 'Annual design tool', '2025-10-14', 'Business', 'Company Card', 'PROFESSIONAL', 1, @my_user_id),
('Sneakers', 4000, 'New shoes', '2025-10-19', 'Shopping', 'Credit Card', 'PERSONAL', 0, @my_user_id),
('Pharmacy', 450, 'Medicines', '2025-10-11', 'Healthcare', 'Cash', 'PERSONAL', 0, @my_user_id),
('Concert', 3000, 'Live music event', '2025-10-25', 'Entertainment', 'Debit Card', 'PERSONAL', 0, @my_user_id),
('Team Dinner', 5000, 'Project celebration', '2025-10-22', 'Business', 'Company Card', 'PROFESSIONAL', 0, @my_user_id),
('Coffee', 180, 'Morning coffee', '2025-10-23', 'Food', 'UPI', 'PROFESSIONAL', 0, @my_user_id),
('Charity Donation', 500, 'Monthly donation', '2025-10-05', 'Other', 'Net Banking', 'PERSONAL', 0, @my_user_id);

-- --- 8 Expenses for August 2025 ---
INSERT INTO expense (title, amount, description, date, category, payment_method, expense_type, is_pinned, user_id) VALUES
('Rent Payment', 15000, 'August Rent', '2025-08-05', 'Bills', 'Net Banking', 'PERSONAL', 1, @my_user_id),
('Business Flight', 8500, 'Flight to Delhi meeting', '2025-08-10', 'Business', 'Company Card', 'PROFESSIONAL', 0, @my_user_id),
('Weekend Getaway', 7200, 'Trip with friends', '2025-08-15', 'Entertainment', 'Credit Card', 'PERSONAL', 0, @my_user_id),
('New Monitor', 12000, 'Work setup upgrade', '2025-08-18', 'Education', 'Debit Card', 'PROFESSIONAL', 0, @my_user_id),
('Lunch at Cafe', 450, 'Quick lunch', '2025-08-20', 'Food', 'UPI', 'PERSONAL', 0, @my_user_id),
('Gym Membership', 2000, 'Quarterly fee', '2025-08-22', 'Healthcare', 'Credit Card', 'PERSONAL', 0, @my_user_id),
('Taxi to Airport', 800, 'Cab for business trip', '2025-08-10', 'Transport', 'Cash', 'PROFESSIONAL', 0, @my_user_id),
('Groceries', 2300, 'Monthly stock-up', '2025-08-28', 'Food', 'Debit Card', 'PERSONAL', 0, @my_user_id);

-- --- 7 Expenses for September 2025 ---
INSERT INTO expense (title, amount, description, date, category, payment_method, expense_type, is_pinned, user_id) VALUES
('Wi-Fi Bill', 799, 'September bill', '2025-09-08', 'Bills', 'UPI', 'PERSONAL', 0, @my_user_id),
('Textbooks', 1800, 'New semester books', '2025-09-12', 'Education', 'Credit Card', 'PERSONAL', 0, @my_user_id),
('Team Lunch', 3500, 'Project milestone lunch', '2025-09-15', 'Business', 'Company Card', 'PROFESSIONAL', 1, @my_user_id),
('Amazon Order', 1100, 'Household items', '2025-09-19', 'Shopping', 'Debit Card', 'PERSONAL', 0, @my_user_id),
('Birthday Dinner', 2800, 'Friend''s birthday', '2025-09-22', 'Food', 'Credit Card', 'PERSONAL', 0, @my_user_id),
('Bus Fare', 150, 'Commute to office', '2025-09-25', 'Transport', 'Cash', 'PROFESSIONAL', 0, @my_user_id),
('Streaming Service', 299, 'Monthly subscription', '2025-09-30', 'Entertainment', 'UPI', 'PERSONAL', 0, @my_user_id);


-- 3. INSERT BUDGETS (August, September, October 2025)
INSERT INTO budget (category, limit_amount, start_date, end_date, user_id) VALUES
-- August 2025
('Food', 2500, '2025-08-01', '2025-08-31', @my_user_id),
('Entertainment', 8000, '2025-08-01', '2025-08-31', @my_user_id),
('Business', 8000, '2025-08-01', '2025-08-31', @my_user_id),
('Education', 15000, '2025-08-01', '2025-08-31', @my_user_id),
('Bills', 14000, '2025-08-01', '2025-08-31', @my_user_id),
('Healthcare', 3000, '2025-08-01', '2025-08-31', @my_user_id),
-- September 2025
('Food', 3000, '2025-09-01', '2025-09-30', @my_user_id),
('Education', 1500, '2025-09-01', '2025-09-30', @my_user_id),
('Business', 4000, '2025-09-01', '2025-09-30', @my_user_id),
('Shopping', 1000, '2025-09-01', '2025-09-30', @my_user_id),
('Bills', 1000, '2025-09-01', '2025-09-30', @my_user_id),
('Entertainment', 250, '2025-09-01', '2025-09-30', @my_user_id),
-- October 2025
('Food', 3000, '2025-10-01', '2025-10-31', @my_user_id),
('Entertainment', 3000, '2025-10-01', '2025-10-31', @my_user_id),
('Shopping', 8000, '2025-10-01', '2025-10-31', @my_user_id),
('Bills', 1500, '2025-10-01', '2025-10-31', @my_user_id),
('Business', 7500, '2025-10-01', '2025-10-31', @my_user_id),
('Healthcare', 2000, '2025-10-01', '2025-10-31', @my_user_id);


-- 4. INSERT RECURRING BILLS
SET @my_user_id = 3;

INSERT INTO recurring_bill (name, amount, category, frequency, next_due_date, day_of_month_due, reminder_days_before, reminder_hour, reminder_minute, description, user_id) VALUES
-- 5 Bills for November 2025 (Next due dates)
('Netflix', 649.00, 'Subscriptions', 'MONTHLY', '2025-11-05', 5, 2, 9, 0, 'Premium Plan', @my_user_id),
('House Rent', 20000.00, 'Rent', 'MONTHLY', '2025-11-01', 1, 5, 12, 0, 'Monthly Rent', @my_user_id),
('Car Insurance', 15000.00, 'Insurance', 'YEARLY', '2026-08-15', 15, 7, 10, 30, 'Annual car insurance', @my_user_id),
('Electricity Bill', 1200.00, 'Utilities', 'MONTHLY', '2025-11-20', 20, 3, 11, 0, 'Monthly power bill', @my_user_id),
('Gym Membership', 4500.00, 'Subscriptions', 'QUARTERLY', '2025-11-10', 10, 1, 8, 0, 'Quarterly fee', @my_user_id),
-- 5 Bills for September 2025 (Next due dates)
('Phone Bill (Airtel)', 799.00, 'Bills', 'MONTHLY', '2025-11-18', 18, 3, 14, 0, 'Postpaid plan', @my_user_id),
('Home Loan EMI', 35000.00, 'Loan', 'MONTHLY', '2025-11-10', 10, 5, 10, 0, 'HDFC Home Loan', @my_user_id),
('Wi-Fi Bill', 999.00, 'Utilities', 'MONTHLY', '2025-11-22', 22, 2, 16, 30, 'Broadband internet', @my_user_id),
('Amazon Prime', 1499.00, 'Subscriptions', 'YEARLY', '2026-09-25', 25, 7, 9, 0, 'Annual subscription', @my_user_id),
('Maid Salary', 3000.00, 'Other', 'MONTHLY', '2025-10-30', 30, 0, 10, 0, 'Monthly salary', @my_user_id),
-- 6 Bills for October 2025 (FIXED)
('Spotify Premium', 50.00, 'Subscriptions', 'MONTHLY', '2025-10-26', 26, 2, 10, 40, 'Subscriptions', @my_user_id),
('dfgerg', 1233.00, 'Bills', 'MONTHLY', '2025-10-25', 25, 2, 17, 45, 'dd', @my_user_id),
('Audible', 99.00, 'Subscriptions', 'MONTHLY', '2025-10-30', 30, 7, 10, 35, NULL, @my_user_id),
('Health Insurance', 2500.00, 'Insurance', 'MONTHLY', '2025-10-28', 28, 3, 11, 15, 'Monthly premium', @my_user_id),
('Newspaper', 20.00, 'Other', 'DAILY', '2025-10-24', 0, 0, 6, 0, 'Daily newspaper delivery', @my_user_id),
('Milk Delivery', 60.00, 'Utilities', 'DAILY', '2025-10-24', 0, 1, 5, 30, 'Daily milk', @my_user_id),
-- 5 Bills for November 2025
('Disney+ Hotstar', 899.00, 'Subscriptions', 'YEARLY', '2025-11-15', 15, 5, 18, 0, 'Annual Plan', @my_user_id),
('Gas Bill', 400.00, 'Utilities', 'MONTHLY', '2025-11-12', 12, 2, 13, 0, 'Piped gas bill', @my_user_id),
('Personal Loan EMI', 5000.00, 'Loan', 'MONTHLY', '2025-11-07', 7, 3, 9, 30, NULL, @my_user_id),
('Life Insurance', 6000.00, 'Insurance', 'QUARTERLY', '2025-11-20', 20, 7, 10, 0, 'LIC Quarterly Premium', @my_user_id),
('Water Bill', 300.00, 'Bills', 'MONTHLY', '2025-11-19', 19, 1, 15, 0, 'Monthly water supply', @my_user_id);