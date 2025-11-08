import React, { useState, useEffect } from 'react';
import { recurringBillAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Calendar, Bell } from 'lucide-react';
import BillForm from './BillForm';
import './Bills.css';

const BillList = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [viewMode, setViewMode] = useState('current'); // 'current' or 'nextCycle'
  const [sortOrder, setSortOrder] = useState('duedate-asc'); // 'duedate-asc', 'duedate-desc', 'reminder-asc', 'reminder-desc'

  useEffect(() => {
    console.log('BillList - Current user:', user);
    if (user && user.id) {
      fetchBills();
    }
  }, [user]);

  const fetchBills = async () => {
    try {
      console.log('Fetching bills for user:', user.id);
      const response = await recurringBillAPI.getBillsByUser(user.id);
      console.log('Bills response:', response.data);
      const fetchedBills = response.data || [];
      
      // Check and auto-move bills from next cycle to current cycle if due within 1 week
      await checkAndMoveBillsToCurrent(fetchedBills);
      
      // Fetch again after potential updates
      const updatedResponse = await recurringBillAPI.getBillsByUser(user.id);
      setBills(updatedResponse.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setBills([]);
      setLoading(false);
    }
  };

  const checkAndMoveBillsToCurrent = async (billsList) => {
    const today = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    for (const bill of billsList) {
      // If bill is paid (in next cycle) and due date is within 1 week
      if (bill.isPaid && bill.nextDueDate) {
        const dueDate = new Date(bill.nextDueDate);
        
        // If due date is within 1 week or already passed
        if (dueDate <= oneWeekFromNow) {
          try {
            console.log(`Moving bill ${bill.billName} back to current cycle (due: ${bill.nextDueDate})`);
            await recurringBillAPI.markAsUnpaid(bill.id);
          } catch (error) {
            console.error(`Error moving bill ${bill.id} to current cycle:`, error);
          }
        }
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring bill?')) {
      try {
        await recurringBillAPI.deleteBill(id);
        fetchBills();
      } catch (error) {
        console.error('Error deleting bill:', error);
      }
    }
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBill(null);
    fetchBills();
  };

  const calculateNextDueDate = (currentDueDate, frequency) => {
    const nextDate = new Date(currentDueDate);
    
    switch (frequency) {
      case 'DAILY':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'YEARLY':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    return nextDate.toISOString().split('T')[0];
  };

  const handleMarkAsPaid = async (billId) => {
    try {
      const bill = bills.find(b => b.id === billId);
      if (!bill) return;
      
      // Calculate next due date
      const nextDueDate = calculateNextDueDate(bill.nextDueDate, bill.frequency);
      
      // Mark as paid
      await recurringBillAPI.markAsPaid(billId);
      
      // Update bill with next due date
      await recurringBillAPI.updateBill(billId, {
        ...bill,
        nextDueDate: nextDueDate
      });
      
      fetchBills();
    } catch (error) {
      console.error('Error marking bill as paid:', error);
    }
  };

  const handleMarkAsUnpaid = async (id) => {
    try {
      await recurringBillAPI.markAsUnpaid(id);
      fetchBills();
    } catch (error) {
      console.error('Error marking bill as unpaid:', error);
    }
  };

  const getNextDueDate = (bill) => {
    if (!bill.nextDueDate) {
      return `Due on day ${bill.dayOfMonthDue} of month`;
    }
    const today = new Date();
    const nextDate = new Date(bill.nextDueDate);
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    return `Due in ${diffDays} days`;
  };

  const getTimeRemaining = (bill) => {
    if (!bill.nextDueDate) return null;
    
    const now = new Date();
    const dueDate = new Date(bill.nextDueDate);
    
    // Calculate reminder date/time
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(dueDate.getDate() - (bill.reminderDaysBefore || 2));
    reminderDate.setHours(bill.reminderHour || 9);
    reminderDate.setMinutes(bill.reminderMinute || 0);
    reminderDate.setSeconds(0);
    reminderDate.setMilliseconds(0);
    
    const diffMs = reminderDate - now;
    
    // If reminder time has passed, don't show countdown
    if (diffMs < 0) return null;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  };

  const getDueStatus = (bill) => {
    if (!bill.nextDueDate) return 'normal';
    const today = new Date();
    const nextDate = new Date(bill.nextDueDate);
    const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'urgent';
    return 'normal';
  };

  const getReminderDateTime = (bill) => {
    if (!bill.nextDueDate) return null;
    const dueDate = new Date(bill.nextDueDate);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(dueDate.getDate() - (bill.reminderDaysBefore || 2));
    reminderDate.setHours(bill.reminderHour || 9);
    reminderDate.setMinutes(bill.reminderMinute || 0);
    return reminderDate;
  };

  const getSortedBills = (billsToSort) => {
    const sorted = [...billsToSort];
    
    switch (sortOrder) {
      case 'duedate-asc': // Earliest due date first
        return sorted.sort((a, b) => {
          if (!a.nextDueDate) return 1;
          if (!b.nextDueDate) return -1;
          return new Date(a.nextDueDate) - new Date(b.nextDueDate);
        });
      
      case 'duedate-desc': // Latest due date first
        return sorted.sort((a, b) => {
          if (!a.nextDueDate) return 1;
          if (!b.nextDueDate) return -1;
          return new Date(b.nextDueDate) - new Date(a.nextDueDate);
        });
      
      case 'reminder-asc': // Earliest reminder first
        return sorted.sort((a, b) => {
          const reminderA = getReminderDateTime(a);
          const reminderB = getReminderDateTime(b);
          if (!reminderA) return 1;
          if (!reminderB) return -1;
          return reminderA - reminderB;
        });
      
      case 'reminder-desc': // Latest reminder first
        return sorted.sort((a, b) => {
          const reminderA = getReminderDateTime(a);
          const reminderB = getReminderDateTime(b);
          if (!reminderA) return 1;
          if (!reminderB) return -1;
          return reminderB - reminderA;
        });
      
      default:
        return sorted;
    }
  };

  if (loading) {
    return <div className="loading">Loading bills...</div>;
  }

  return (
    <div className="bills-container">
      <div className="bills-header">
        <div>
          <h1>Recurring Bills</h1>
          <p>Manage your regular payments and subscriptions</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          <Plus size={20} /> Add Bill
        </button>
      </div>

      <div className="bills-controls">
        <div className="bills-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'current' ? 'active' : ''}`}
            onClick={() => setViewMode('current')}
          >
            Current Cycle
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'nextCycle' ? 'active' : ''}`}
            onClick={() => setViewMode('nextCycle')}
          >
            Next Cycle
          </button>
        </div>

        <div className="bills-filter">
          <label>Sort by:</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="duedate-asc">Due Date: Earliest First</option>
            <option value="duedate-desc">Due Date: Latest First</option>
            <option value="reminder-asc">Reminder: Earliest First</option>
            <option value="reminder-desc">Reminder: Latest First</option>
          </select>
        </div>
      </div>

      <div className="bills-grid">
        {getSortedBills(bills.filter(bill => viewMode === 'nextCycle' ? bill.isPaid : !bill.isPaid)).map(bill => {
          const status = getDueStatus(bill);
          
          return (
            <div key={bill.id} className={`bill-card ${status}`}>
              <div className="bill-header-row">
                <div className="bill-info">
                  <h3>{bill.billName}</h3>
                  <p className="bill-category">{bill.category}</p>
                </div>
                <div className="bill-actions">
                  <button onClick={() => handleEdit(bill)} className="btn-icon">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(bill.id)} className="btn-icon delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="bill-amount">
                <img src="/wallet.png" alt="Amount" style={{ width: '20px', height: '20px' }} />
                <span>₹{parseFloat(bill.amount).toFixed(2)}</span>
              </div>

              <div className="bill-details">
                <div className="detail-row">
                  <Calendar size={16} />
                  <span>{getNextDueDate(bill)}</span>
                </div>
                <div className="detail-row">
                  <Bell size={16} />
                  <span>Every {bill.frequency ? bill.frequency.toLowerCase() : 'month'}</span>
                </div>
              </div>

              {bill.description && (
                <p className="bill-description">{bill.description}</p>
              )}

              {(() => {
                const timeLeft = getTimeRemaining(bill);
                if (timeLeft) {
                  return (
                    <div className="time-remaining">
                      <span className="time-badge">
                        <strong>{timeLeft.days}d</strong> {timeLeft.hours}h {timeLeft.minutes}m
                      </span>
                    </div>
                  );
                }
                return null;
              })()}

              {status === 'overdue' && !bill.isPaid && (
                <div className="bill-alert overdue">
                  <Bell size={16} />
                  Payment Overdue!
                  <button 
                    className="btn-mark-paid"
                    onClick={() => handleMarkAsPaid(bill.id)}
                  >
                    Mark as Paid
                  </button>
                </div>
              )}
              {bill.isPaid && (
                <div className="bill-alert paid">
                  <Bell size={16} />
                  <div>
                    <strong>Paid on {new Date(bill.paidDate).toLocaleDateString()}</strong>
                    <br />
                    Next due: {new Date(bill.nextDueDate).toLocaleDateString()}
                  </div>
                  <button 
                    className="btn-mark-unpaid"
                    onClick={() => handleMarkAsUnpaid(bill.id)}
                  >
                    Move to Current
                  </button>
                </div>
              )}
              {status === 'urgent' && (
                <div className="bill-alert urgent">
                  <Bell size={16} />
                  Due Soon
                </div>
              )}
            </div>
          );
        })}
      </div>

      {bills.length === 0 && (
        <div className="empty-state">
          <Calendar size={64} color="#ccc" />
          <p>No recurring bills yet</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add Your First Bill
          </button>
        </div>
      )}

      {showForm && user && user.id && (
        <BillForm
          bill={editingBill}
          onClose={handleFormClose}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default BillList;
