package com.expenses_tracker.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.expenses_tracker.entity.Category;
import com.expenses_tracker.repository.CategoryRepository;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Get all categories
     */
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    /**
     * Get category by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new category
     */
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        try {
            // Check if category with same name already exists
            if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Category with this name already exists"));
            }

            Category savedCategory = categoryRepository.save(category);
            return ResponseEntity.status(201).body(savedCategory);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update an existing category
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        try {
            Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

            // Check if new name conflicts with another category
            if (!existingCategory.getName().equalsIgnoreCase(categoryDetails.getName()) &&
                categoryRepository.existsByNameIgnoreCase(categoryDetails.getName())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Category with this name already exists"));
            }

            existingCategory.setName(categoryDetails.getName());
            existingCategory.setDescription(categoryDetails.getDescription());
            existingCategory.setIcon(categoryDetails.getIcon());

            Category updatedCategory = categoryRepository.save(existingCategory);
            return ResponseEntity.ok(updatedCategory);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a category
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
            
            categoryRepository.delete(category);
            return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}
