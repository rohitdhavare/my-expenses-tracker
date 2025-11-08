package com.expenses_tracker.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.expenses_tracker.entity.Budget;
import com.expenses_tracker.entity.Expense;
import com.expenses_tracker.entity.RecurringBill;
import com.expenses_tracker.entity.User;
import com.expenses_tracker.repository.BudgetRepository;
import com.expenses_tracker.repository.ExpenseRepository;
import com.expenses_tracker.repository.RecurringBillRepository;
import com.expenses_tracker.repository.UserRepository;
import com.opencsv.CSVWriter;

@Service
public class ReportService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BudgetRepository budgetRepository;
    
    @Autowired
    private RecurringBillRepository recurringBillRepository;

    /**
     * Generate CSV report for user expenses
     */
    public byte[] generateUserCSVReport(Long userId) throws IOException {
        List<Expense> expenses = expenseRepository.findByUserId(userId);

        StringWriter stringWriter = new StringWriter();
        // Write header
        try (CSVWriter csvWriter = new CSVWriter(stringWriter)) {
            // Write Expenses Section Header
            csvWriter.writeNext(new String[]{"═══════════════════════════════════════════════════════════"});
            csvWriter.writeNext(new String[]{"EXPENSES REPORT"});
            csvWriter.writeNext(new String[]{"═══════════════════════════════════════════════════════════"});
            csvWriter.writeNext(new String[]{});
            
            // Write expenses header
            csvWriter.writeNext(new String[]{
                "Expense ID", "Title", "Description", "Amount (₹)", "Date",
                "Category", "Payment Method", "Type"
            });

            // Write expenses data
            for (Expense expense : expenses) {
                csvWriter.writeNext(new String[]{
                    expense.getId().toString(),
                    expense.getTitle(),
                    expense.getDescription(),
                    "₹" + expense.getAmount().toString(),
                    expense.getDate().toString(),
                    expense.getCategory(),
                    expense.getPaymentMethod(),
                    expense.getExpenseType()
                });
            }
            
            // Add spacing
            csvWriter.writeNext(new String[]{});
            csvWriter.writeNext(new String[]{});
            
            // Write Budgets Section
            List<Budget> budgets = budgetRepository.findByUserId(userId);
            csvWriter.writeNext(new String[]{"═══════════════════════════════════════════════════════════"});
            csvWriter.writeNext(new String[]{"BUDGETS REPORT"});
            csvWriter.writeNext(new String[]{"═══════════════════════════════════════════════════════════"});
            csvWriter.writeNext(new String[]{});
            
            // Write budgets header
            csvWriter.writeNext(new String[]{
                "Budget ID", "Category", "Limit Amount (₹)", "Start Date", "End Date"
            });
            
            // Write budgets data
            for (Budget budget : budgets) {
                csvWriter.writeNext(new String[]{
                    budget.getId().toString(),
                    budget.getCategory(),
                    "₹" + budget.getLimitAmount().toString(),
                    budget.getStartDate().toString(),
                    budget.getEndDate().toString()
                });
            }
            
            // Add spacing
            csvWriter.writeNext(new String[]{});
            csvWriter.writeNext(new String[]{});
            
            // Write Bills Section
            List<RecurringBill> bills = recurringBillRepository.findByUserId(userId);
            csvWriter.writeNext(new String[]{"═══════════════════════════════════════════════════════════"});
            csvWriter.writeNext(new String[]{"RECURRING BILLS REPORT"});
            csvWriter.writeNext(new String[]{"═══════════════════════════════════════════════════════════"});
            csvWriter.writeNext(new String[]{});
            
            // Write bills header
            csvWriter.writeNext(new String[]{
                "Bill ID", "Name", "Amount (₹)", "Category", "Frequency", "Next Due Date", "Description"
            });
            
            // Write bills data
            for (RecurringBill bill : bills) {
                csvWriter.writeNext(new String[]{
                    bill.getId().toString(),
                    bill.getName(),
                    "₹" + bill.getAmount().toString(),
                    bill.getCategory(),
                    bill.getFrequency(),
                    bill.getNextDueDate() != null ? bill.getNextDueDate().toString() : "N/A",
                    bill.getDescription() != null ? bill.getDescription() : ""
                });
            }
        }
        return stringWriter.toString().getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Generate Excel report for user expenses
     */
    public byte[] generateUserExcelReport(Long userId) throws IOException {
        List<Expense> expenses = expenseRepository.findByUserId(userId);

        // --- FIX 1: Declare outputStream here ---
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Expenses Report");
            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Expense ID", "Title", "Description", "Amount (₹)", "Date",
                "Category", "Payment Method", "Type"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            // Create data rows
            int rowNum = 1;
            for (Expense expense : expenses) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(expense.getId());
                row.createCell(1).setCellValue(expense.getTitle());
                row.createCell(2).setCellValue(expense.getDescription());
                row.createCell(3).setCellValue("₹" + expense.getAmount().toString());
                row.createCell(4).setCellValue(expense.getDate().toString());
                row.createCell(5).setCellValue(expense.getCategory());
                row.createCell(6).setCellValue(expense.getPaymentMethod());
                row.createCell(7).setCellValue(expense.getExpenseType());
            }
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            // --- FIX 1: Write to the outputStream ---
            workbook.write(outputStream);
        }

        return outputStream.toByteArray();
    }

    /**
     * Generate PDF report for user expenses
     */
    public byte[] generateUserPDFReport(Long userId) throws IOException {
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // Create formatted text report with better structure
        StringBuilder pdfContent = new StringBuilder();
        
        // Header
        pdfContent.append("═══════════════════════════════════════════════════════════════════════════\n");
        pdfContent.append("                          EXPENSES TRACKER REPORT                           \n");
        pdfContent.append("═══════════════════════════════════════════════════════════════════════════\n\n");
        
        // User Info
        pdfContent.append("USER INFORMATION\n");
        pdfContent.append("───────────────────────────────────────────────────────────────────────────\n");
        pdfContent.append(String.format("  Username      : %s\n", user.getUsername()));
        pdfContent.append(String.format("  Email         : %s\n", user.getEmail()));
        pdfContent.append(String.format("  Currency      : %s\n", user.getPreferredCurrency()));
        pdfContent.append(String.format("  Generated     : %s\n", 
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))));
        pdfContent.append("\n\n");

        // Summary Statistics
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal personalTotal = BigDecimal.ZERO;
        BigDecimal professionalTotal = BigDecimal.ZERO;
        int personalCount = 0;
        int professionalCount = 0;

        for (Expense expense : expenses) {
            totalAmount = totalAmount.add(expense.getAmount());
            if ("PERSONAL".equalsIgnoreCase(expense.getExpenseType())) {
                personalTotal = personalTotal.add(expense.getAmount());
                personalCount++;
            } else {
                professionalTotal = professionalTotal.add(expense.getAmount());
                professionalCount++;
            }
        }

        pdfContent.append("SUMMARY STATISTICS\n");
        pdfContent.append("───────────────────────────────────────────────────────────────────────────\n");
        pdfContent.append(String.format("  Total Expenses        : ₹ %,.2f\n", totalAmount));
        pdfContent.append(String.format("  Total Count           : %d expenses\n", expenses.size()));
        pdfContent.append(String.format("  Personal Expenses     : ₹ %,.2f (%d expenses)\n", personalTotal, personalCount));
        pdfContent.append(String.format("  Professional Expenses : ₹ %,.2f (%d expenses)\n", professionalTotal, professionalCount));
        pdfContent.append("\n\n");

        // Detailed Expenses List
        pdfContent.append("DETAILED EXPENSES\n");
        pdfContent.append("═══════════════════════════════════════════════════════════════════════════\n");
        pdfContent.append(String.format("%-4s %-25s %-12s %-12s %-15s %-10s\n",
            "ID", "Title", "Amount", "Date", "Category", "Type"));
        pdfContent.append("───────────────────────────────────────────────────────────────────────────\n");

        for (Expense expense : expenses) {
            String title = expense.getTitle();
            if (title.length() > 25) {
                title = title.substring(0, 22) + "...";
            }
            
            String category = expense.getCategory();
            if (category.length() > 15) {
                category = category.substring(0, 12) + "...";
            }

            pdfContent.append(String.format("%-4d %-25s ₹%-10.2f %-12s %-15s %-10s\n",
                expense.getId(),
                title,
                expense.getAmount(),
                expense.getDate().toString(),
                category,
                expense.getExpenseType()
            ));
            
            // Add description if exists
            if (expense.getDescription() != null && !expense.getDescription().isEmpty()) {
                String desc = expense.getDescription();
                if (desc.length() > 70) {
                    desc = desc.substring(0, 67) + "...";
                }
                pdfContent.append(String.format("     Description: %s\n", desc));
            }
            
            // Add payment method
            pdfContent.append(String.format("     Payment: %s\n\n", expense.getPaymentMethod()));
        }

        pdfContent.append("═══════════════════════════════════════════════════════════════════════════\n");
        pdfContent.append(String.format("                    GRAND TOTAL: ₹ %,.2f\n", totalAmount));
        pdfContent.append("═══════════════════════════════════════════════════════════════════════════\n");
        pdfContent.append("\n\n");
        pdfContent.append("                    End of Report - Thank you for using Expenses Tracker\n");

        // Convert to bytes
        return pdfContent.toString().getBytes(StandardCharsets.UTF_8);
    }
}