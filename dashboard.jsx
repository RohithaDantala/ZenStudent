import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
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

    updateGreeting();
  }, []);

  const openMoodTracker = () => {
    alert('Mood tracker feature coming soon! 😊\n\nThis will allow you to:\n• Log daily mood\n• Track emotional patterns\n• View mood analytics');
  };

  const openGoalTracker = () => {
    alert('Goal tracker feature coming soon! 🎯\n\nThis will allow you to:\n• Set SMART goals\n• Track progress\n• Celebrate achievements');
  };

  const openBudgetTracker = () => {
    alert('Budget tracker feature coming soon! 💰\n\nThis will allow you to:\n• Track expenses\n• Set budget limits\n• View spending analytics');
  };

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-placeholder">ZenStudent Logo</div>
          </div>
          <nav className="nav-bar">
            <a href="#dashboard">Dashboard</a>
            <a href="#mood">Mood Tracker</a>
            <a href="#goals">Goals</a>
            <a href="#budget">Budget</a>
          </nav>
          <div className="user-menu">
            <div className="user-avatar">
              <div className="profile-placeholder">Profile</div>
            </div>
            <a href="index.html" className="logout-btn">Logout</a>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="welcome-section">
          <h1 className="welcome-title">{greeting}, User!</h1>
          <p className="welcome-subtitle">Track, Plan, Thrive – the Zen Way.</p>
        </div>

        <div className="dashboard-grid">
          <div className="card mood-card">
            <div className="card-icon">😊</div>
            <h2 className="card-title">Mood Tracker</h2>
            <p className="card-description">Log your daily mood and track patterns to maintain emotional wellness</p>
            <button className="card-btn" onClick={openMoodTracker}>Track Mood</button>
          </div>

          <div className="card goals-card">
            <div className="card-icon">🎯</div>
            <h2 className="card-title">Goal Tracker</h2>
            <p className="card-description">Set and monitor your academic and personal goals with progress tracking</p>
            <button className="card-btn" onClick={openGoalTracker}>Manage Goals</button>
          </div>

          <div className="card budget-card">
            <div className="card-icon">💰</div>
            <h2 className="card-title">Budget Tracker</h2>
            <p className="card-description">Monitor your expenses and maintain financial wellness as a student</p>
            <button className="card-btn" onClick={openBudgetTracker}>Track Budget</button>
          </div>
        </div>

        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-number">7</div>
            <div className="stat-label">Days Tracked</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">3</div>
            <div className="stat-label">Active Goals</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">$125</div>
            <div className="stat-label">Budget Remaining</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">85%</div>
            <div className="stat-label">Goal Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;