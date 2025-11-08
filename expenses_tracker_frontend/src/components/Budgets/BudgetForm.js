import React, { useState, useEffect } from 'react';
import { budgetAPI } from '../../services/api';
import { X } from 'lucide-react';

const BudgetForm = ({ budget, onClose, userId }) => {
  const [formData, setFormData] = useState({
    category: 'Food',
    limitAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  });
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  console.log('BudgetForm - Received userId:', userId);

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        limitAmount: budget.limitAmount,
        startDate: budget.startDate,
        endDate: budget.endDate,
      });
    }
  }, [budget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('BudgetForm handleSubmit - userId:', userId);

    if (!userId) {
      setError('User ID must be provided to create a budget.');
      setLoading(false);
      return;
    }

    try {
      const budgetData = {
        category: showCustomCategory ? customCategory : formData.category,
        limitAmount: parseFloat(formData.limitAmount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        userId: userId  // Send userId directly, not nested object
      };

      console.log('Submitting budget:', budgetData);

      if (budget) {
        await budgetAPI.updateBudget(budget.id, budgetData);
      } else {
        await budgetAPI.createBudget(budgetData);
      }
      onClose();
    } catch (err) {
      console.error('Budget error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save budget');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{budget ? 'Edit Budget' : 'Create New Budget'}</h2>
          <button onClick={onClose} className="btn-close">
            <X size={24} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
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
              required
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

          <div className="form-group">
            <label>Budget Limit *</label>
            <input
              type="number"
              step="0.01"
              value={formData.limitAmount}
              onChange={(e) => setFormData({ ...formData, limitAmount: e.target.value })}
              required
              placeholder="Enter budget amount"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : budget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
