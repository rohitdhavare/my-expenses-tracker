import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { expenseAPI, budgetAPI, notificationAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Bell, Calendar } from 'lucide-react';
import './Dashboard.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

const Dashboard = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [timePeriod, setTimePeriod] = useState('monthly'); // 'weekly', 'monthly', 'yearly'
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
      
      // Refresh dashboard every 30 seconds to show new expenses
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      let unreadCount = 0;
      try {
        const notificationsRes = await notificationAPI.getNotifications(user.id);
        console.log('Raw notifications response:', notificationsRes.data);
        const notificationsData = Array.isArray(notificationsRes.data) ? notificationsRes.data : [];
        const unreadNotifications = notificationsData.filter(n => !n.isRead);
        setNotifications(unreadNotifications);
        unreadCount = unreadNotifications.length;
        console.log('Unread notifications count:', unreadCount);
      } catch (err) {
        console.log('Notifications fetch failed, using empty array');
        setNotifications([]);
        unreadCount = 0;
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
        unreadNotifications: unreadCount
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

  const getWeeklyData = () => {
    if (!expenses || expenses.length === 0) {
      return [{ week: 'No Data', amount: 0 }];
    }
    const weeklyMap = {};
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate >= fourWeeksAgo) {
        const weekNum = Math.floor((now - expDate) / (7 * 24 * 60 * 60 * 1000));
        const weekLabel = weekNum === 0 ? 'This Week' : `${weekNum} Week${weekNum > 1 ? 's' : ''} Ago`;
        const amount = parseFloat(exp.amount || 0);
        weeklyMap[weekLabel] = (weeklyMap[weekLabel] || 0) + amount;
      }
    });
    const data = Object.entries(weeklyMap).map(([week, amount]) => ({ week, amount }));
    return data.length > 0 ? data : [{ week: 'No Data', amount: 0 }];
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

  const getYearlyData = () => {
    if (!expenses || expenses.length === 0) {
      return [{ year: 'No Data', amount: 0 }];
    }
    const yearlyMap = {};
    expenses.forEach(exp => {
      const year = new Date(exp.date).getFullYear();
      const amount = parseFloat(exp.amount || 0);
      yearlyMap[year] = (yearlyMap[year] || 0) + amount;
    });
    const data = Object.entries(yearlyMap).map(([year, amount]) => ({ year, amount }));
    return data.length > 0 ? data : [{ year: 'No Data', amount: 0 }];
  };

  const getTimeBasedData = () => {
    switch(timePeriod) {
      case 'weekly':
        return getWeeklyData();
      case 'yearly':
        return getYearlyData();
      default:
        return getMonthlyData();
    }
  };

  const getXAxisKey = () => {
    switch(timePeriod) {
      case 'weekly':
        return 'week';
      case 'yearly':
        return 'year';
      default:
        return 'month';
    }
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
          <img src="/wallet.png" alt="Logo" style={{ width: '32px', height: '32px' }} />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Expense Trends</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setTimePeriod('weekly')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: timePeriod === 'weekly' ? '#667eea' : '#f0f0f0',
                  color: timePeriod === 'weekly' ? 'white' : '#333',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Weekly
              </button>
              <button 
                onClick={() => setTimePeriod('monthly')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: timePeriod === 'monthly' ? '#667eea' : '#f0f0f0',
                  color: timePeriod === 'monthly' ? 'white' : '#333',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Monthly
              </button>
              <button 
                onClick={() => setTimePeriod('yearly')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  background: timePeriod === 'yearly' ? '#667eea' : '#f0f0f0',
                  color: timePeriod === 'yearly' ? 'white' : '#333',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Yearly
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getTimeBasedData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={getXAxisKey()} />
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
            expenses
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 5)
              .map(expense => (
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
