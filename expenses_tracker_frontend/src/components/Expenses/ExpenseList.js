import React, { useState, useEffect } from 'react';
import { expenseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import ExpenseForm from './ExpenseForm';
import { getCategoryColor } from '../../utils/categoryColors';
import './Expenses.css';

const ExpenseList = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('ALL');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, searchTerm, filterType, filterCategory, filterPaymentMethod, filterStartDate, filterEndDate, sortOrder]);

  const fetchExpenses = async () => {
    try {
      console.log('Fetching expenses...');
      const response = await expenseAPI.getAllExpenses();
      console.log('Expenses response:', response.data);
      setExpenses(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      console.error('Error details:', error.response?.data);
      setExpenses([]);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'ALL') {
      filtered = filtered.filter(exp => exp.expenseType === filterType);
    }

    // Category filter
    if (filterCategory !== 'ALL') {
      filtered = filtered.filter(exp => exp.category === filterCategory);
    }

    // Payment Method filter
    if (filterPaymentMethod !== 'ALL') {
      filtered = filtered.filter(exp => exp.paymentMethod === filterPaymentMethod);
    }

    // Date Range filter
    if (filterStartDate) {
      filtered = filtered.filter(exp => exp.date >= filterStartDate);
    }
    if (filterEndDate) {
      filtered = filtered.filter(exp => exp.date <= filterEndDate);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredExpenses(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.deleteExpense(id);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };


  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
    fetchExpenses();
  };

  const categories = [...new Set(expenses.map(exp => exp.category).filter(Boolean))];

  if (loading) {
    return <div className="loading">Loading expenses...</div>;
  }

  return (
    <div className="expenses-container">
      <div className="expenses-header">
        <h1>My Expenses</h1>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          <Plus size={20} /> Add Expense
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="ALL">All Types</option>
            <option value="PERSONAL">Personal</option>
            <option value="PROFESSIONAL">Professional</option>
          </select>

          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select value={filterPaymentMethod} onChange={(e) => setFilterPaymentMethod(e.target.value)}>
            <option value="ALL">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="UPI">UPI</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Company Card">Company Card</option>
          </select>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          <input
            type="date"
            placeholder="Start Date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />

          <input
            type="date"
            placeholder="End Date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
      </div>

      <div className="expenses-grid">
        {filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses found. {searchTerm || filterType !== 'ALL' || filterCategory !== 'ALL' ? 'Try adjusting your filters.' : 'Add your first expense!'}</p>
          </div>
        ) : filteredExpenses.map(expense => (
          <div 
            key={expense.id} 
            className="expense-card"
            style={{ borderLeft: `4px solid ${getCategoryColor(expense.category)}` }}
          >
            <div className="expense-header-row">
              <h3>{expense.title}</h3>
              <div className="expense-actions">
                <button onClick={() => handleEdit(expense)} className="btn-icon">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(expense.id)} className="btn-icon delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <p className="expense-description">{expense.description}</p>

            <div className="expense-details">
              <div className="detail-item">
                <span className="label">Amount:</span>
                <div className="expense-amount">₹{parseFloat(expense.amount || 0).toFixed(2)}</div>
              </div>
              <div className="detail-item">
                <span className="label">Category:</span>
                <span 
                  className="value" 
                  style={{ 
                    backgroundColor: getCategoryColor(expense.category),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontWeight: '500'
                  }}
                >
                  {expense.category}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Type:</span>
                <span className={`badge ${expense.expenseType.toLowerCase()}`}>
                  {expense.expenseType}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Payment:</span>
                <span className="value">{expense.paymentMethod}</span>
              </div>
              <div className="detail-item">
                <span className="label">Date:</span>
                <span className="value">{new Date(expense.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <div className="empty-state">
          <p>No expenses found</p>
        </div>
      )}

      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={handleFormClose}
          userId={user?.id}
        />
      )}
    </div>
  );
};

export default ExpenseList;
