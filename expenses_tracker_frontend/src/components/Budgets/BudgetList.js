import React, { useState, useEffect } from 'react';
import { budgetAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import BudgetForm from './BudgetForm';
import './Budgets.css';

const BudgetList = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [spending, setSpending] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    console.log('BudgetList - Current user:', user);
    console.log('BudgetList - User ID:', user?.id);
    console.log('BudgetList - User keys:', user ? Object.keys(user) : 'null');
    if (user && user.id) {
      fetchBudgets();
    }
  }, [user]);

  const fetchBudgets = async () => {
    try {
      const response = await budgetAPI.getBudgetsByUser(user.id);
      const budgetsData = response.data;
      setBudgets(budgetsData);
      
      // Check for budget alerts
      try {
        await budgetAPI.checkBudgetAlerts(user.id);
      } catch (err) {
        console.error('Error checking budget alerts:', err);
      }
      
      // Fetch actual spending for each budget
      const spendingData = {};
      for (const budget of budgetsData) {
        try {
          const spendingRes = await budgetAPI.getBudgetSpending(budget.id);
          spendingData[budget.id] = parseFloat(spendingRes.data);
        } catch (err) {
          console.error(`Error fetching spending for budget ${budget.id}:`, err);
          spendingData[budget.id] = 0;
        }
      }
      setSpending(spendingData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetAPI.deleteBudget(id);
        fetchBudgets();
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBudget(null);
    fetchBudgets();
  };

  const calculateProgress = (budget) => {
    const spent = spending[budget.id] || 0;
    const limit = parseFloat(budget.limitAmount);
    return ((spent / limit) * 100).toFixed(0);
  };

  const getSpent = (budget) => {
    return spending[budget.id] || 0;
  };

  if (loading) {
    return <div className="loading">Loading budgets...</div>;
  }

  return (
    <div className="budgets-container">
      <div className="budgets-header">
        <h1>Budget Management</h1>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          <Plus size={20} /> Add Budget
        </button>
      </div>

      <div className="budgets-grid">
        {budgets.map(budget => {
          const progress = calculateProgress(budget);
          const isOverBudget = progress > 100;
          const isWarning = progress > 80 && progress <= 100;

          return (
            <div key={budget.id} className="budget-card">
              <div className="budget-header-row">
                <div className="budget-info">
                  <h3>{budget.category}</h3>
                  <p className="budget-period">
                    {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="budget-actions">
                  <button onClick={() => handleEdit(budget)} className="btn-icon">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(budget.id)} className="btn-icon delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="budget-amount">
                <span className="label">Budget Limit</span>
                <span className="value">₹{parseFloat(budget.limitAmount).toFixed(2)}</span>
              </div>

              <div className="budget-amount">
                <span className="label">Spent</span>
                <span className="value" style={{ color: isOverBudget ? '#e74c3c' : '#27ae60' }}>
                  ₹{getSpent(budget).toFixed(2)}
                </span>
              </div>

              <div className="budget-amount">
                <span className="label">Remaining</span>
                <span className="value">
                  ₹{Math.max(parseFloat(budget.limitAmount) - getSpent(budget), 0).toFixed(2)}
                </span>
              </div>

              <div className="progress-section">
                <div className="progress-header">
                  <span>Progress</span>
                  <span className={`progress-percent ${isOverBudget ? 'over' : isWarning ? 'warning' : ''}`}>
                    {progress}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${isOverBudget ? 'over' : isWarning ? 'warning' : ''}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              {isOverBudget && (
                <div className="budget-alert over">
                  <TrendingUp size={16} />
                  Over Limit
                </div>
              )}
              {isWarning && (
                <div className="budget-alert warning">
                  <TrendingUp size={16} />
                  Approaching limit
                </div>
              )}
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="empty-state">
          <p>No budgets created yet</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Create Your First Budget
          </button>
        </div>
      )}

      {showForm && user && user.id && (
        <BudgetForm
          budget={editingBudget}
          onClose={handleFormClose}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default BudgetList;
