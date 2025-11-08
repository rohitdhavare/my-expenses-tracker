import React, { useState, useEffect } from 'react';
import { recurringBillAPI } from '../../services/api';
import { X } from 'lucide-react';

const BillForm = ({ bill, onClose, userId }) => {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    billName: '',
    amount: '',
    category: 'Bills',
    frequency: 'MONTHLY',
    nextDueDate: getTodayDate(),
    description: '',
    reminderDaysBefore: 2,
    reminderHour: 9,
    reminderMinute: 0,
  });
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  console.log('BillForm - Received userId:', userId);

  useEffect(() => {
    if (bill) {
      setFormData({
        billName: bill.billName,
        amount: bill.amount,
        category: bill.category,
        frequency: bill.frequency,
        nextDueDate: bill.nextDueDate,
        description: bill.description || '',
        reminderDaysBefore: bill.reminderDaysBefore || 2,
        reminderHour: bill.reminderHour || 9,
        reminderMinute: bill.reminderMinute || 0,
      });
    }
  }, [bill]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!userId) {
      setError('User ID must be provided to create a recurring bill.');
      setLoading(false);
      return;
    }

    try {
      // Extract day from nextDueDate
      const dueDate = new Date(formData.nextDueDate);
      const dayOfMonth = dueDate.getDate();

      const billData = {
        billName: formData.billName,
        amount: parseFloat(formData.amount),
        category: showCustomCategory ? customCategory : formData.category,
        frequency: formData.frequency,
        dayOfMonthDue: dayOfMonth,
        nextDueDate: formData.nextDueDate,
        description: formData.description,
        reminderDaysBefore: parseInt(formData.reminderDaysBefore),
        reminderHour: parseInt(formData.reminderHour),
        reminderMinute: parseInt(formData.reminderMinute),
        userId: userId  // Send userId directly, not nested object
      };

      console.log('Submitting bill data:', billData);

      if (bill) {
        await recurringBillAPI.updateBill(bill.id, billData);
      } else {
        await recurringBillAPI.createBill(billData);
      }
      onClose();
    } catch (err) {
      console.error('Error saving bill:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save bill');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{bill ? 'Edit Recurring Bill' : 'Add Recurring Bill'}</h2>
          <button onClick={onClose} className="btn-close">
            <X size={24} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Bill Name *</label>
              <input
                type="text"
                value={formData.billName}
                onChange={(e) => setFormData({ ...formData, billName: e.target.value })}
                required
                placeholder="e.g., Netflix Subscription"
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
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-row">
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
                <option value="Bills">Bills</option>
                <option value="Subscriptions">Subscriptions</option>
                <option value="Rent">Rent</option>
                <option value="Insurance">Insurance</option>
                <option value="Utilities">Utilities</option>
                <option value="Loan">Loan</option>
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
              <label>Frequency *</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Next Due Date *</label>
            <input
              type="date"
              value={formData.nextDueDate}
              onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
              required
            />
          </div>

          {/* Reminder Settings */}
          <div className="form-section-header">
            <h3>⏰ Reminder Settings</h3>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Remind Me (Days Before) *</label>
              <select
                value={formData.reminderDaysBefore}
                onChange={(e) => setFormData({ ...formData, reminderDaysBefore: e.target.value })}
              >
                <option value="0">On due date</option>
                <option value="1">1 day before</option>
                <option value="2">2 days before</option>
                <option value="3">3 days before</option>
                <option value="5">5 days before</option>
                <option value="7">1 week before</option>
              </select>
            </div>

            <div className="form-group">
              <label>Reminder Time *</label>
              <div className="time-inputs">
                <select
                  value={formData.reminderHour}
                  onChange={(e) => setFormData({ ...formData, reminderHour: e.target.value })}
                  className="time-select"
                >
                  {[...Array(24)].map((_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span className="time-separator">:</span>
                <select
                  value={formData.reminderMinute}
                  onChange={(e) => setFormData({ ...formData, reminderMinute: e.target.value })}
                  className="time-select"
                >
                  {[...Array(60)].map((_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="reminder-preview">
            <span>📅 You'll be reminded {formData.reminderDaysBefore} day(s) before at {String(formData.reminderHour).padStart(2, '0')}:{String(formData.reminderMinute).padStart(2, '0')}</span>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="Optional notes about this bill"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : bill ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillForm;
