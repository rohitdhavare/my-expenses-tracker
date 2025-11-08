import React, { useState, useEffect } from 'react';
import { expenseAPI } from '../../services/api';
import { X } from 'lucide-react';

const ExpenseForm = ({ expense, onClose, userId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    paymentMethod: 'Credit Card',
    expenseType: 'PERSONAL',
    isPinned: false,
  });
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        category: expense.category,
        paymentMethod: expense.paymentMethod,
        expenseType: expense.expenseType,
        isPinned: expense.isPinned || false,
      });
    }
  }, [expense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const expenseData = {
        ...formData,
        category: showCustomCategory ? customCategory : formData.category,
        user: { id: userId }
      };

      if (expense) {
        await expenseAPI.updateExpense(expense.id, expenseData);
      } else {
        await expenseAPI.createExpense(expenseData);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save expense');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button onClick={onClose} className="btn-close">
            <X size={24} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Amount *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={showCustomCategory ? 'Custom' : formData.category}
                onChange={(e) => {
                  if (e.target.value === 'Custom') {
                    setShowCustomCategory(true);
                  } else {
                    setShowCustomCategory(false);
                    setFormData({ ...formData, category: e.target.value });
                  }
                }}
              >
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
                <option value="Custom">Custom...</option>
              </select>
              {showCustomCategory && (
                <input
                  type="text"
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  style={{ marginTop: '10px' }}
                  required
                />
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Payment Method *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Company Card">Company Card</option>
              </select>
            </div>

            <div className="form-group">
              <label>Type *</label>
              <select
                value={formData.expenseType}
                onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
              >
                <option value="PERSONAL">Personal</option>
                <option value="PROFESSIONAL">Professional</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : expense ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
