import React, { useState, useEffect } from 'react';
import { groupAPI } from '../../services/api';
import { Plus, Users, DollarSign, Trash2, UserPlus } from 'lucide-react';
import GroupForm from './GroupForm';
import './Groups.css';

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupAPI.getUserGroups();
      setGroups(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    fetchGroups();
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      try {
        await groupAPI.deleteGroup(groupId);
        fetchGroups();
      } catch (error) {
        console.error('Error deleting group:', error);
        alert('Failed to delete group');
      }
    }
  };

  const handleAddMember = async (groupId) => {
    const userId = prompt('Enter user ID to add to group:');
    if (userId) {
      try {
        await groupAPI.addMembers(groupId, [parseInt(userId)]);
        fetchGroups();
        alert('Member added successfully!');
      } catch (error) {
        console.error('Error adding member:', error);
        alert('Failed to add member');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading groups...</div>;
  }

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h1>Group Expenses</h1>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          <Plus size={20} /> Create Group
        </button>
      </div>

      <div className="groups-grid">
        {groups.map(group => (
          <div key={group.id} className="group-card">
            <div className="group-icon">
              <Users size={32} />
            </div>
            <h3>{group.name}</h3>
            <p className="group-description">{group.description}</p>
            <div className="group-stats">
              <div className="stat">
                <Users size={16} />
                <span>{group.members?.length || 0} members</span>
              </div>
              <div className="stat">
                <DollarSign size={16} />
                <span>₹0.00</span>
              </div>
            </div>
            <div className="group-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button 
                onClick={() => handleAddMember(group.id)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#667eea',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <UserPlus size={16} /> Add Member
              </button>
              <button 
                onClick={() => handleDeleteGroup(group.id)}
                style={{
                  padding: '8px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#e74c3c',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="empty-state">
          <Users size={64} color="#ccc" />
          <p>No groups yet</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Create Your First Group
          </button>
        </div>
      )}

      {showForm && <GroupForm onClose={handleFormClose} />}
    </div>
  );
};

export default GroupList;
