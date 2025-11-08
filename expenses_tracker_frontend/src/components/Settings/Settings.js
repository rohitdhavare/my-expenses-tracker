import React, { useState, useEffect } from 'react';
import { userAPI, reportAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Moon, Download, Trash2 } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const { user, deleteAccount } = useAuth();
  const [preferences, setPreferences] = useState({
    darkMode: false,
    preferredCurrency: 'INR',
  });
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    birthdate: '',
    profilePhotoUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const response = await userAPI.getUserById(user.id);
      console.log('User preferences:', response.data);
      setPreferences({
        darkMode: response.data.darkMode || false,
        preferredCurrency: response.data.preferredCurrency || 'INR'
      });
      setUserInfo({
        username: response.data.username || '',
        email: response.data.email || '',
        birthdate: response.data.birthdate || '',
        profilePhotoUrl: response.data.profilePhotoUrl || ''
      });
      // Apply dark mode if enabled and save to localStorage
      if (response.data.darkMode) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
      } else {
        localStorage.setItem('darkMode', 'false');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    try {
      const updated = { ...preferences, [key]: value };
      
      // Update on backend
      const userData = {
        ...user,
        [key]: value
      };
      await userAPI.updateUser(user.id, userData);
      
      // Update local state
      setPreferences(updated);
      
      // Apply dark mode immediately and save to localStorage
      if (key === 'darkMode') {
        if (value) {
          document.body.classList.add('dark-mode');
          localStorage.setItem('darkMode', 'true');
        } else {
          document.body.classList.remove('dark-mode');
          localStorage.setItem('darkMode', 'false');
        }
      }
      
      console.log(`Updated ${key} to ${value}`);
    } catch (error) {
      console.error('Error updating preference:', error);
      alert('Failed to update preference');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await userAPI.updateUser(user.id, userInfo);
      alert('Profile updated successfully!');
      setEditMode(false);
      fetchPreferences();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handlePhotoUpload = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      try {
        const formData = new FormData();
        formData.append('photo', file);
        
        const response = await userAPI.uploadProfilePhoto(user.id, formData);
        
        alert('Profile photo uploaded successfully!');
        fetchPreferences(); // Refresh to show new photo
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Failed to upload photo. Please try again.');
      }
    };
    
    input.click();
  };

  const handleDownloadReport = async (format) => {
    try {
      const response = await reportAPI.generateUserReport(user.id, format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="settings-section">
        <h2>User Information</h2>
        <div className="user-info-card">
          <div className="profile-photo-section">
            <div className="profile-photo">
              {userInfo.profilePhotoUrl ? (
                <img 
                  src={`http://localhost:8083${userInfo.profilePhotoUrl}`} 
                  alt="Profile" 
                  className="profile-photo-img"
                />
              ) : (
                userInfo.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <button className="btn-upload-photo" onClick={handlePhotoUpload}>Upload Photo</button>
          </div>
          <div className="user-details">
            <div className="user-detail-item">
              <label>Name</label>
              <input 
                type="text" 
                value={userInfo.username} 
                onChange={(e) => setUserInfo({...userInfo, username: e.target.value})}
                readOnly={!editMode}
                className="user-input"
              />
            </div>
            <div className="user-detail-item">
              <label>Email</label>
              <input 
                type="email" 
                value={userInfo.email} 
                onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                readOnly={!editMode}
                className="user-input"
              />
            </div>
            <div className="user-detail-item">
              <label>Birthdate</label>
              <input 
                type="date" 
                value={userInfo.birthdate} 
                onChange={(e) => setUserInfo({...userInfo, birthdate: e.target.value})}
                readOnly={!editMode}
                className="user-input"
                placeholder="Set your birthdate"
              />
            </div>
            <div className="profile-actions">
              {!editMode ? (
                <button className="btn-edit-profile" onClick={() => setEditMode(true)}>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button className="btn-save-profile" onClick={handleSaveProfile}>
                    Save Changes
                  </button>
                  <button className="btn-cancel-profile" onClick={() => {
                    setEditMode(false);
                    fetchPreferences();
                  }}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Appearance</h2>
        <div className="setting-item">
          <div className="setting-info">
            <Moon size={20} />
            <div>
              <h3>Dark Mode</h3>
              <p>Enable dark theme across the app</p>
            </div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={preferences.darkMode}
              onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

      </div>

      <div className="settings-section">
        <h2>Currency</h2>
        <div className="setting-item">
          <div className="setting-info">
            <div>
              <h3>Preferred Currency</h3>
              <p>Select your default currency</p>
            </div>
          </div>
          <select
            value={preferences.preferredCurrency}
            onChange={(e) => handlePreferenceChange('preferredCurrency', e.target.value)}
            className="currency-select"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h2>Reports</h2>
        <div className="report-buttons">
          <button onClick={() => handleDownloadReport('csv')} className="btn-report">
            <Download size={20} /> Download CSV
          </button>
        </div>
      </div>

      <div className="settings-section danger-zone">
        <h2>Danger Zone</h2>
        <div className="setting-item">
          <div className="setting-info">
            <Trash2 size={20} color="#e74c3c" />
            <div>
              <h3>Delete Account</h3>
              <p>Permanently delete your account and all data</p>
            </div>
          </div>
          <button onClick={handleDeleteAccount} className="btn-danger">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
