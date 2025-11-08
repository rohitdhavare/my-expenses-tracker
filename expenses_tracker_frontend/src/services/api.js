import axios from "axios";

// Remove or comment out this line, it's not needed if baseURL is set below
// const API_BASE_URL = "http://localhost:8083/api";

const api = axios.create({
  // --- THIS IS THE CORRECTED LINE ---
  baseURL: "/api", // Use relative path for NGINX proxy
  // --- END OF CORRECTION ---
  withCredentials: true, // Important for session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getCurrentUser: () => api.get("/auth/me"),
  deleteAccount: () => api.delete("/auth/me"),
};

// User API
export const userAPI = {
  getAllUsers: () => api.get("/users"),
  getUserById: (id) => api.get(`/users/${id}`),
  getUserByUsername: (username) => api.get(`/users/username/${username}`),
  createUser: (userData) => api.post("/users", userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getPreferences: (id) => api.get(`/users/${id}/preferences`),
  updatePreferences: (id, preferences) =>
    api.put(`/users/${id}/preferences`, preferences),
  uploadProfilePhoto: (id, formData) =>
    api.post(`/users/${id}/upload-photo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

// Expense API
export const expenseAPI = {
  getAllExpenses: () => api.get("/expenses"),
  getExpenseById: (id) => api.get(`/expenses/${id}`),
  getExpensesByType: (type) => api.get(`/expenses/type/${type}`),
  createExpense: (expenseData) => api.post("/expenses", expenseData),
  updateExpense: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  togglePin: (id) => api.post(`/expenses/${id}/togglePin`),
  searchExpenses: (keyword) => api.get(`/expenses/search?keyword=${keyword}`),
  filterByCategory: (category) =>
    api.get(`/expenses/filter/category?category=${category}`),
  filterByPaymentMethod: (method) =>
    api.get(`/expenses/filter/payment-method?paymentMethod=${method}`),
  filterByDateRange: (startDate, endDate) =>
    api.get(
      `/expenses/filter/date-range?startDate=${startDate}&endDate=${endDate}`
    ),
  filterByTypeAndCategory: (type, category) =>
    api.get(
      `/expenses/filter/type-category?expenseType=${type}&category=${category}`
    ),
};

// Budget API
export const budgetAPI = {
  getAllBudgets: () => api.get("/budgets"),
  getBudgetById: (id) => api.get(`/budgets/${id}`),
  getBudgetsByUser: (userId) => api.get(`/budgets/user/${userId}`),
  createBudget: (budgetData) => api.post("/budgets", budgetData),
  updateBudget: (id, budgetData) => api.put(`/budgets/${id}`, budgetData),
  deleteBudget: (id) => api.delete(`/budgets/${id}`),
  getBudgetSpending: (id) => api.get(`/budgets/${id}/spending`),
  getActiveBudget: (userId, category) =>
    api.get(`/budgets/active/user/${userId}/category/${category}`),
  getTotalSpending: (userId, category, startDate, endDate) =>
    api.get(
      `/budgets/spending/user/${userId}/category/${category}?startDate=${startDate}&endDate=${endDate}`
    ),
  checkBudgetAlerts: (userId) =>
    api.post(`/budgets/check-alerts/user/${userId}`),
};

// Recurring Bill API
export const recurringBillAPI = {
  getAllBills: () => api.get("/recurring-bills"),
  getBillById: (id) => api.get(`/recurring-bills/${id}`),
  getBillsByUser: (userId) => api.get(`/recurring-bills/user/${userId}`),
  createBill: (billData) => api.post("/recurring-bills", billData),
  updateBill: (id, billData) => api.put(`/recurring-bills/${id}`, billData),
  deleteBill: (id) => api.delete(`/recurring-bills/${id}`),
  markAsPaid: (id) => api.post(`/recurring-bills/${id}/mark-paid`),
  markAsUnpaid: (id) => api.post(`/recurring-bills/${id}/mark-unpaid`),
};

// Notification API
export const notificationAPI = {
  getNotifications: (userId) => api.get(`/notifications/${userId}`),
  getUnreadNotifications: (userId) =>
    api.get(`/notifications/${userId}/unread`),
  markAsRead: (notificationId) =>
    api.post(`/notifications/${notificationId}/mark-read`),
  markAsUnread: (notificationId) =>
    api.post(`/notifications/${notificationId}/mark-unread`),
  markAllAsRead: (userId) => api.post(`/notifications/${userId}/mark-all-read`),
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`),
  deleteAllNotifications: (userId) =>
    api.delete(`/notifications/user/${userId}/delete-all`),
};

// Category API
export const categoryAPI = {
  getAllCategories: () => api.get("/categories"),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => api.post("/categories", categoryData),
  updateCategory: (id, categoryData) =>
    api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Report API
export const reportAPI = {
  getFormats: () => api.get("/reports/formats"),
  generateUserReport: (userId, format) =>
    api.get(`/reports/user/${userId}?format=${format}`, {
      responseType: "blob", // Important for downloading files
    }),
};

// Data API (for testing/seeding)
export const dataAPI = {
  initSampleData: () => api.post("/data/init"),
  getStatus: () => api.get("/data/status"),
  clearAll: () => api.delete("/data/clear"),
};

export default api;
