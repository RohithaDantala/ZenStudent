import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import profileIcon from './assets/profileIcon.png';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { userAPI } from './api';

const ZenStudentDashboard = () => {
  const [greeting, setGreeting] = useState('Welcome back');
  const [userName, setUserName] = useState('User');
  const [stats, setStats] = useState({
    moodEntries: 0,
    activeGoals: 0,
    completedGoals: 0,
    totalSpent: 0,
    daysActive: 0
  });
  const navigate = useNavigate();
  
  const openMoodTracker = () => {
    navigate('/mood');
  };

  const openGoalTracker = () => {
    navigate('/goals');
  };

  const openBudgetTracker = () => {
    navigate('/budget');
  };

  const updateGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    
    let newGreeting = 'Welcome back';
    if (hour < 12) {
      newGreeting = 'Good morning';
    } else if (hour < 17) {
      newGreeting = 'Good afternoon';
    } else {
      newGreeting = 'Good evening';
    }
    
    setGreeting(newGreeting);
  };

  const fetchDashboardData = async () => {
    try {
      const [profile, statsData] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getStats()
      ]);
      
      setUserName(profile.fullName);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  useEffect(() => {
    updateGreeting();
    fetchDashboardData();
  }, []);

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
      transition: 'background 0.3s ease, color 0.3s ease'
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
      fontWeight: 'bold'
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
    welcomeSection: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    welcomeTitle: {
      fontSize: '32px',
      color: '#333',
      marginBottom: '10px'
    },
    welcomeSubtitle: {
      fontSize: '18px',
      color: '#666'
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      marginBottom: '40px'
    },
    card: {
      background: 'white',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      transition: 'transform 0.2s ease'
    },
    cardIcon: {
      width: '60px',
      height: '60px',
      margin: '0 auto 20px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: 'white',
      background: '#4ECDC4'
    },
    cardTitle: {
      fontSize: '24px',
      color: '#333',
      marginBottom: '10px'
    },
    cardDescription: {
      color: '#666',
      marginBottom: '20px'
    },
    cardBtn: {
      padding: '12px 24px',
      background: '#4ECDC4',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-block',
      transition: 'background 0.3s ease'
    },
    quickStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginTop: '40px'
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
      color: '#4ECDC4'
    },
    statLabel: {
      color: '#666',
      marginTop: '5px'
    }
  };

  return (
    <div style={styles.body}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          {/* Logo */}
          <div style={styles.logo}>
            <img src={logo} alt="ZenStudent Logo" style={styles.logoImg} />
          </div>
          
          <nav style={styles.navBar}>
            <Link
                to="/dashboard"
                style={styles.navLink}
                onMouseOver={(e) => { e.target.style.background = '#4ECDC4'; e.target.style.color = 'white'; }}
                onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#2C3E50'; }}
            >
                Dashboard
            </Link>

            <Link
                to="/mood"
                style={styles.navLink}
                onMouseOver={(e) => { e.target.style.background = '#4ECDC4'; e.target.style.color = 'white'; }}
                onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#2C3E50'; }}
            >
                Mood Tracker
            </Link>

            <Link
                to="/goals"
                style={styles.navLink}
                onMouseOver={(e) => { e.target.style.background = '#4ECDC4'; e.target.style.color = 'white'; }}
                onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#2C3E50'; }}
            >
                Goals
            </Link>

            <Link
                to="/budget"
                style={styles.navLink}
                onMouseOver={(e) => { e.target.style.background = '#4ECDC4'; e.target.style.color = 'white'; }}
                onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#2C3E50'; }}
            >
                Budget
            </Link>
            </nav>

          <div style={styles.userMenu}>
          <div 
            style={{...styles.userAvatar, cursor: 'pointer'}} 
            id="profile-avatar"
            onClick={() => navigate('/profile')}
          >
            <img src={profileIcon} alt="Profile" style={styles.logoImg} />
          </div>
            <Link
                to="/"  // Redirects to your home/login page
                style={styles.logoutBtn}
                onMouseOver={(e) => { e.target.style.background = 'hsl(176, 56%, 45%)'; }}
                onMouseOut={(e) => { e.target.style.background = '#4ECDC4'; }}
            >
                Logout
            </Link>
          </div>
        </div>
      </header>

      <div style={styles.container}>
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>{greeting}, {userName}!</h1>
          <p style={styles.welcomeSubtitle}>Track, Plan, Thrive — the Zen Way.</p>
        </div>

        <div style={styles.dashboardGrid}>
          <div 
            style={styles.card}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={styles.cardIcon}>😊</div>
            <h2 style={styles.cardTitle}>Mood Tracker</h2>
            <p style={styles.cardDescription}>Log your daily mood and track patterns to maintain emotional wellness</p>
            <button
            style={styles.cardBtn}
            onClick={() => navigate('/mood')} // Navigates to Mood.jsx route
            onMouseOver={(e) => { e.target.style.background = 'hsl(173, 45%, 49%)'; }}
            onMouseOut={(e) => { e.target.style.background = '#4ECDC4'; }}
            >
            Track Mood
            </button>

          </div>

          <div 
            style={styles.card}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={styles.cardIcon}>🎯</div>
            <h2 style={styles.cardTitle}>Goal Tracker</h2>
            <p style={styles.cardDescription}>Set and monitor your academic and personal goals with progress tracking</p>
            <button 
                style={styles.cardBtn}
                onClick={() => navigate('/goals')}
                onMouseOver={(e) => {
                    e.target.style.background = '#4ECDC4';
                }}
                onMouseOut={(e) => {
                    e.target.style.background = '#4ECDC4';
                }}
                >
                Manage Goals
                </button>
          </div>

          <div 
            style={styles.card}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={styles.cardIcon}>💰</div>
            <h2 style={styles.cardTitle}>Budget Tracker</h2>
            <p style={styles.cardDescription}>Monitor your expenses and maintain financial wellness as a student</p>
            <button 
            style={styles.cardBtn}
            onClick={() => navigate('/budget')}
            onMouseOver={(e) => {
                e.target.style.background = 'hsl(176, 56%, 45%)';
            }}
            onMouseOut={(e) => {
                e.target.style.background = '#4ECDC4';
            }}
            >
            Track Budget
            </button>

          </div>
        </div>

        <div style={styles.quickStats}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.daysActive}</div>
            <div style={styles.statLabel}>Days Active</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.activeGoals}</div>
            <div style={styles.statLabel}>Active Goals</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>${stats.totalSpent.toFixed(2)}</div>
            <div style={styles.statLabel}>Budget Tracked</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.moodEntries}</div>
            <div style={styles.statLabel}>Mood Entries</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZenStudentDashboard;