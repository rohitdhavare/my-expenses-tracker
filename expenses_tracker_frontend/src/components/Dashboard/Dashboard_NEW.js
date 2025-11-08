import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { expenseAPI, budgetAPI, notificationAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Bell, Calendar } from 'lucide-react';
import './Dashboard.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

const Dashboard = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    budgetUtilization: 0,
    unreadNotifications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data for user:', user.id);
      
      // Fetch expenses
      const expensesRes = await expenseAPI.getAllExpenses();
      console.log('Raw expenses response:', expensesRes.data);
      const expensesData = Array.isArray(expensesRes.data) ? expensesRes.data : [];
      setExpenses(expensesData);

      // Fetch budgets
      const budgetsRes = await budgetAPI.getBudgetsByUser(user.id);
      console.log('Raw budgets response:', budgetsRes.data);
      const budgetsData = Array.isArray(budgetsRes.data) ? budgetsRes.data : [];
      setBudgets(budgetsData);

      // Fetch notifications
      try {
        const notificationsRes = await notificationAPI.getNotificationsByUser(user.id);
        console.log('Raw notifications response:', notificationsRes.data);
        const notificationsData = Array.isArray(notificationsRes.data) ? notificationsRes.data : [];
        setNotifications(notificationsData.filter(n => !n.isRead));
      } catch (err) {
        console.log('Notifications fetch failed, using empty array');
        setNotifications([]);
      }

      // Calculate stats
      const total = expensesData.reduce((sum, exp) => {
        const amount = parseFloat(exp.amount || 0);
        return sum + amount;
      }, 0);
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonth = expensesData
        .filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
        })
        .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

      setStats({
        totalExpenses: total,
        monthlyExpenses: thisMonth,
        budgetUtilization: budgetsData.length,
        unreadNotifications: notifications.length
      });

      console.log('Dashboard stats calculated:', { total, thisMonth, budgets: budgetsData.length });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data);
      setExpenses([]);
      setBudgets([]);
      setNotifications([]);
      setLoading(false);
    }
  };

  const getCategoryData = () => {
    if (!expenses || expenses.length === 0) {
      return [{ name: 'No Data', value: 1 }];
    }
    const categoryMap = {};
    expenses.forEach(exp => {
      const category = exp.category || 'Other';
      const amount = parseFloat(exp.amount || 0);
      categoryMap[category] = (categoryMap[category] || 0) + amount;
    });
    const data = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    return data.length > 0 ? data : [{ name: 'No Data', value: 1 }];
  };

  const getMonthlyData = () => {
    if (!expenses || expenses.length === 0) {
      return [{ month: 'No Data', amount: 0 }];
    }
    const monthlyMap = {};
    expenses.forEach(exp => {
      const month = new Date(exp.date).toLocaleString('default', { month: 'short' });
      const amount = parseFloat(exp.amount || 0);
      monthlyMap[month] = (monthlyMap[month] || 0) + amount;
    });
    const data = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount }));
    return data.length > 0 ? data : [{ month: 'No Data', amount: 0 }];
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username}!</h1>
        <p>Here's your financial overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#667eea' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Expenses</h3>
            <p className="stat-value">₹{stats.totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#764ba2' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>This Month</h3>
            <p className="stat-value">₹{stats.monthlyExpenses.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f093fb' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>Active Budgets</h3>
            <p className="stat-value">{budgets.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#4facfe' }}>
            <Bell size={24} />
          </div>
          <div className="stat-content">
            <h3>Notifications</h3>
            <p className="stat-value">{stats.unreadNotifications}</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getCategoryData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getCategoryData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Expenses</h3>
        <div className="activity-list">
          {expenses.length === 0 ? (
            <p className="empty-message">No expenses yet. Add your first expense to see it here!</p>
          ) : (
            expenses.slice(0, 5).map(expense => (
              <div key={expense.id} className="activity-item">
                <div className="activity-info">
                  <h4>{expense.title || 'Untitled'}</h4>
                  <p>{expense.category || 'Other'} • {new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <div className="activity-amount">₹{parseFloat(expense.amount || 0).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
