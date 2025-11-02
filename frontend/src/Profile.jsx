import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/logo.png';
import profileIcon from './assets/profileIcon.png';
import { userAPI, authAPI } from './api';
const ProfilePage = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '+1 234 567 8900',
    university: 'State University',
    major: 'Computer Science',
    year: 'Junior',
    bio: 'Passionate student focused on personal growth and academic excellence.',
    joinDate: '2025-01-15'
  });

  const [editedData, setEditedData] = useState({...profileData});
  const [stats, setStats] = useState({
    moodEntries: 0,
    activeGoals: 0,
    completedGoals: 0,
    totalSpent: 0,
    daysActive: 0
  });

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const profile = await userAPI.getProfile();
      setProfileData(profile);
      setEditedData(profile);
      
      const statsData = await userAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      showNotification('Failed to load profile', 'error');
    }
  };
  
  fetchProfile();
}, []);
  const loadRealStats = (joinDate) => {
    // Load mood entries
    const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    
    // Calculate days active
    const join = new Date(joinDate);
    const today = new Date();
    const daysActive = Math.floor((today - join) / (1000 * 60 * 60 * 24));

    // Load goals data (you can expand this based on your actual implementation)
    // For now, we'll count from sample data or localStorage if you save goals
    const goalsData = JSON.parse(localStorage.getItem('goals') || '[]');
    const activeGoals = goalsData.filter(g => !g.completed).length;
    const completedGoals = goalsData.filter(g => g.completed).length;

    // Load budget/expenses data
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const totalSpent = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    setStats({
      moodEntries: moodHistory.length,
      activeGoals: activeGoals,
      completedGoals: completedGoals,
      totalSpent: totalSpent,
      daysActive: Math.max(daysActive, 0)
    });
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

const handleEditToggle = async () => {
  if (isEditing) {
    try {
      const updated = await userAPI.updateProfile(editedData);
      setProfileData(updated);
      showNotification('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      showNotification(error.message || 'Failed to update profile', 'error');
    }
  } else {
    setEditedData({...profileData});
    setIsEditing(true);
  }
};

  const handleCancel = () => {
    setEditedData({...profileData});
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const styles = {
    body: {
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    },
    header: {
      background: 'white',
      padding: '20px 0',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      maxHeight: '120px'
    },
    logoImg: {
      width: '300px',
      height: 'auto',
      objectFit: 'contain'
    },
    navBar: {
      display: 'flex',
      gap: '20px',
      fontWeight: '500'
    },
    navLink: {
      color: '#2C3E50',
      textDecoration: 'none',
      padding: '8px 12px',
      borderRadius: '5px',
      transition: 'background 0.3s ease, color 0.3s ease',
      cursor: 'pointer'
    },
    activeNavLink: {
      background: '#4ECDC4',
      color: 'white'
    },
    userMenu: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      background: '#4ECDC4',
      cursor: 'pointer'
    },
    logoutBtn: {
      padding: '8px 16px',
      background: '#4ECDC4',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      textDecoration: 'none'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px'
    },
    pageTitle: {
      fontSize: '32px',
      color: '#333',
      marginBottom: '10px',
      textAlign: 'center'
    },
    pageSubtitle: {
      fontSize: '18px',
      color: '#666',
      textAlign: 'center',
      marginBottom: '40px'
    },
    card: {
      background: 'white',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)',
      marginBottom: '30px'
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '30px',
      marginBottom: '30px',
      flexWrap: 'wrap'
    },
    profileImageLarge: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '4px solid #4ECDC4'
    },
    profileInfo: {
      flex: 1,
      minWidth: '250px'
    },
    profileName: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '5px'
    },
    profileEmail: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '10px'
    },
    memberSince: {
      fontSize: '14px',
      color: '#999',
      fontStyle: 'italic'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#4ECDC4',
      marginBottom: '5px'
    },
    statLabel: {
      color: '#666',
      fontSize: '14px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '500',
      color: '#333'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box',
      background: 'white'
    },
    inputDisabled: {
      background: '#f8f9fa',
      cursor: 'not-allowed'
    },
    textarea: {
      width: '100%',
      minHeight: '80px',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'white',
      boxSizing: 'border-box'
    },
    btnGroup: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'center',
      marginTop: '20px'
    },
    btn: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    primaryBtn: {
      background: '#4ECDC4',
      color: 'white'
    },
    secondaryBtn: {
      background: '#f8f9fa',
      color: '#333',
      border: '1px solid #ddd'
    },
    dangerBtn: {
      background: '#f44336',
      color: 'white'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: '2px solid #4ECDC4'
    },
    infoRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '20px'
    }
  };

  return (
    <div style={styles.body}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <img 
              src={logo} 
              alt="ZenStudent Logo" 
              style={styles.logoImg} 
            />
          </div>
          
          <nav style={styles.navBar}>
            <span
              style={styles.navLink}
              onClick={() => navigate('/dashboard')}
              onMouseOver={(e) => { e.target.style.background = '#4ECDC4'; e.target.style.color = 'white'; }}
              onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#2C3E50'; }}
            >
              Dashboard
            </span>
            <span
              style={styles.navLink}
              onClick={() => navigate('/mood')}
              onMouseOver={(e) => { e.target.style.background = '#4ECDC4'; e.target.style.color = 'white'; }}
              onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#2C3E50'; }}
            >
              Mood Tracker
            </span>
            <span
              style={styles.navLink}
              onClick={() => navigate('/goals')}
              onMouseOver={(e) => { e.target.style.background = '#4ECDC4'; e.target.style.color = 'white'; }}
              onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#2C3E50'; }}
            >
              Goals
            </span>
            <span
              style={styles.navLink}
              onClick={() => navigate('/budget')}
              onMouseOver={(e) => { e.target.style.background = '#4ECDC4'; e.target.style.color = 'white'; }}
              onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#2C3E50'; }}
            >
              Budget
            </span>
          </nav>

          <div style={styles.userMenu}>
            <div 
              style={styles.userAvatar}
              onClick={() => navigate('/profile')}
            >
              <img 
                src={profileIcon} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
              />
            </div>
            <span
                style={styles.logoutBtn}
                onClick={() => {
                  authAPI.logout();
                  navigate('/');
                }}
                onMouseOver={(e) => { e.target.style.background = 'hsl(176, 56%, 45%)'; }}
                onMouseOut={(e) => { e.target.style.background = '#4ECDC4'; }}
              >
                Logout
              </span>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>My Profile</h1>
        <p style={styles.pageSubtitle}>View and manage your personal information</p>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.daysActive}</div>
            <div style={styles.statLabel}>Days Active</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.moodEntries}</div>
            <div style={styles.statLabel}>Mood Entries</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.activeGoals}</div>
            <div style={styles.statLabel}>Active Goals</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.completedGoals}</div>
            <div style={styles.statLabel}>Completed Goals</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>${stats.totalSpent.toFixed(2)}</div>
            <div style={styles.statLabel}>Budget Tracked</div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div style={styles.card}>
          <div style={styles.profileHeader}>
            <img 
              src={profileIcon} 
              alt="Profile" 
              style={styles.profileImageLarge}
            />
            <div style={styles.profileInfo}>
              <h2 style={styles.profileName}>
                {isEditing ? editedData.fullName : profileData.fullName}
              </h2>
              <div style={styles.profileEmail}>
                {isEditing ? editedData.email : profileData.email}
              </div>
              <div style={styles.memberSince}>
                Member since {new Date(profileData.joinDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            <button
              style={{...styles.btn, ...styles.primaryBtn}}
              onClick={handleEditToggle}
              onMouseOver={(e) => { e.target.style.background = '#45b7aa'; }}
              onMouseOut={(e) => { e.target.style.background = '#4ECDC4'; }}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          <h3 style={styles.sectionTitle}>Personal Information</h3>
          
          <div style={styles.infoRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                style={{
                  ...styles.input,
                  ...(isEditing ? {} : styles.inputDisabled)
                }}
                type="text"
                value={isEditing ? editedData.fullName : profileData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                style={{
                  ...styles.input,
                  ...(isEditing ? {} : styles.inputDisabled)
                }}
                type="email"
                value={isEditing ? editedData.email : profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div style={styles.infoRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                style={{
                  ...styles.input,
                  ...(isEditing ? {} : styles.inputDisabled)
                }}
                type="tel"
                value={isEditing ? editedData.phone : profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>University</label>
              <input
                style={{
                  ...styles.input,
                  ...(isEditing ? {} : styles.inputDisabled)
                }}
                type="text"
                value={isEditing ? editedData.university : profileData.university}
                onChange={(e) => handleInputChange('university', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div style={styles.infoRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Major</label>
              <input
                style={{
                  ...styles.input,
                  ...(isEditing ? {} : styles.inputDisabled)
                }}
                type="text"
                value={isEditing ? editedData.major : profileData.major}
                onChange={(e) => handleInputChange('major', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Academic Year</label>
              <select
                style={{
                  ...styles.select,
                  ...(isEditing ? {} : styles.inputDisabled)
                }}
                value={isEditing ? editedData.year : profileData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                disabled={!isEditing}
              >
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Bio</label>
            <textarea
              style={{
                ...styles.textarea,
                ...(isEditing ? {} : styles.inputDisabled)
              }}
              value={isEditing ? editedData.bio : profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
            />
          </div>

          {isEditing && (
            <div style={styles.btnGroup}>
              <button
                style={{...styles.btn, ...styles.primaryBtn}}
                onClick={handleEditToggle}
                onMouseOver={(e) => { e.target.style.background = '#45b7aa'; }}
                onMouseOut={(e) => { e.target.style.background = '#4ECDC4'; }}
              >
                Save Changes
              </button>
              <button
                style={{...styles.btn, ...styles.secondaryBtn}}
                onClick={handleCancel}
                onMouseOver={(e) => { e.target.style.background = '#e9ecef'; }}
                onMouseOut={(e) => { e.target.style.background = '#f8f9fa'; }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Account Settings Card */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Account Settings</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Change Password</label>
            <button
              style={{...styles.btn, ...styles.secondaryBtn}}
              onClick={() => showNotification('Password change feature coming soon!', 'success')}
              onMouseOver={(e) => { e.target.style.background = '#e9ecef'; }}
              onMouseOut={(e) => { e.target.style.background = '#f8f9fa'; }}
            >
              Update Password
            </button>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Delete Account</label>
            <button
              style={{...styles.btn, ...styles.dangerBtn}}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  showNotification('Account deletion feature coming soon!', 'error');
                }
              }}
              onMouseOver={(e) => { e.target.style.background = '#d32f2f'; }}
              onMouseOut={(e) => { e.target.style.background = '#f44336'; }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 25px',
          borderRadius: '5px',
          color: 'white',
          fontWeight: '500',
          zIndex: 1000,
          transform: notification.show ? 'translateX(0)' : 'translateX(400px)',
          transition: 'transform 0.3s ease',
          background: notification.type === 'success' ? '#28a745' : '#dc3545'
        }}
      >
        {notification.message}
      </div>
    </div>
  );
};

export default ProfilePage;