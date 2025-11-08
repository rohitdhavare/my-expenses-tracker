import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, PieChart, Calendar, Users, Bell, Settings, LogOut, Menu, X } from 'lucide-react';
import { notificationAPI } from '../../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && user.id) {
      fetchUnreadCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      
      // Listen for notification updates
      const handleNotificationUpdate = () => fetchUnreadCount();
      window.addEventListener('notificationUpdate', handleNotificationUpdate);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('notificationUpdate', handleNotificationUpdate);
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadNotifications(user.id);
      setUnreadCount(response.data.length);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const WalletIcon = () => <img src="/wallet.png" alt="Expenses" style={{ width: '20px', height: '20px' }} />;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/expenses', icon: WalletIcon, label: 'Expenses' },
    { path: '/budgets', icon: PieChart, label: 'Budgets' },
    { path: '/bills', icon: Calendar, label: 'Bills' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <img src="/wallet.png" alt="Logo" style={{ width: '32px', height: '32px', marginRight: '10px' }} />
          <span>SpendWise</span>
        </Link>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="nav-icon-wrapper">
                  <item.icon size={20} />
                  {item.path === '/notifications' && unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="navbar-user">
            <span className="user-name">{user?.username}</span>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
