import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import logo from './assets/logo.png';
import profileIcon from './assets/profileIcon.png';
import { moodAPI, customMoodAPI } from './api';

const MoodTracker = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [currentView, setCurrentView] = useState('log');
  const [trendPeriod, setTrendPeriod] = useState('weekly');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [customMoods, setCustomMoods] = useState([]);
  const [showCustomMoodForm, setShowCustomMoodForm] = useState(false);
  const [newCustomMood, setNewCustomMood] = useState({ emoji: '', name: '', value: 3 });

  const defaultMoods = [
    { emoji: '😄', name: 'Excellent', value: 5, color: '#4CAF50' },
    { emoji: '😊', name: 'Good', value: 4, color: '#8BC34A' },
    { emoji: '😐', name: 'Neutral', value: 3, color: '#FFC107' },
    { emoji: '😔', name: 'Poor', value: 2, color: '#FF9800' },
    { emoji: '😢', name: 'Terrible', value: 1, color: '#F44336' }
  ];

  const [moods, setMoods] = useState(defaultMoods);

  const motivationalQuotes = {
    excellent: [
      "You're radiating positive energy! Keep that amazing momentum going! 🌟",
      "Your happiness is contagious! Share that beautiful smile today! 😊",
      "Great vibes! You're crushing it! Keep shining bright! ✨"
    ],
    good: [
      "Good energy today! Keep nurturing those positive feelings! 🌱",
      "You're doing great! Stay on this positive path! 💪",
      "Feeling good is a great foundation. Build on it! 🏗️"
    ],
    neutral: [
      "Every day is a new opportunity for growth. You've got this! 🌈",
      "It's okay to feel neutral. Small steps lead to big changes! 👣",
      "Remember: This too shall pass. Better days are ahead! 🌅"
    ],
    poor: [
      "Tough day? Remember, storms don't last forever. You're stronger than you think! 💪",
      "It's okay to not be okay. Be gentle with yourself today. 🤗",
      "This feeling is temporary. Tomorrow is a fresh start! 🌱"
    ],
    terrible: [
      "You're going through a lot, but you're not alone. Reach out to someone you trust. ❤️",
      "Difficult times don't define you. Your resilience does. Take it one moment at a time. 🌸",
      "Please be kind to yourself. Consider talking to a friend, family member, or counselor. 🫂"
    ]
  };

useEffect(() => {
  const fetchMoods = async () => {
    try {
      const [fetchedMoods, fetchedCustomMoods] = await Promise.all([
        moodAPI.getAll(),
        customMoodAPI.getAll()
      ]);
      
      setMoodHistory(fetchedMoods);
      setCustomMoods(fetchedCustomMoods);
      setMoods([...defaultMoods, ...fetchedCustomMoods]);
      showMotivationalMessage(fetchedMoods);
    } catch (error) {
      console.error('Failed to fetch moods:', error);
      showNotification('Failed to load mood history', 'error');
    }
  };
  
  fetchMoods();
}, []);

  const showMotivationalMessage = (history) => {
    if (history.length === 0) return;
    
    const recentMoods = history.slice(0, 3);
    const avgMood = recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length;
    
    let category = 'neutral';
    if (avgMood >= 4.5) category = 'excellent';
    else if (avgMood >= 3.5) category = 'good';
    else if (avgMood >= 2.5) category = 'neutral';
    else if (avgMood >= 1.5) category = 'poor';
    else category = 'terrible';
    
    const quotes = motivationalQuotes[category];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    setTimeout(() => {
      showNotification(randomQuote, 'success');
    }, 1000);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  };

const handleAddCustomMood = async () => {
  if (!newCustomMood.emoji || !newCustomMood.name) {
    showNotification('Please enter both emoji and mood name', 'error');
    return;
  }

  try {
    const customMood = await customMoodAPI.create({
      ...newCustomMood,
      color: '#9C27B0'
    });

    const updatedCustomMoods = [...customMoods, customMood];
    setCustomMoods(updatedCustomMoods);
    setMoods([...defaultMoods, ...updatedCustomMoods]);
    
    setNewCustomMood({ emoji: '', name: '', value: 3 });
    setShowCustomMoodForm(false);
    showNotification('Custom mood added! 🎨');
  } catch (error) {
    console.error('Failed to add custom mood:', error);
    showNotification('Failed to add custom mood', 'error');
  }
};
const handleMoodSubmit = async (e) => {
  e.preventDefault();
  if (!selectedMood) {
    showNotification('Please select a mood first', 'error');
    return;
  }

  try {
    const newMood = await moodAPI.create({
      mood: selectedMood,
      note: moodNote,
      date: new Date().toISOString().split('T')[0]
    });

    const updatedHistory = [newMood, ...moodHistory];
    setMoodHistory(updatedHistory);
    showNotification('Mood logged successfully! 🎉');
    showMotivationalMessage(updatedHistory);
    
    setSelectedMood('');
    setMoodNote('');
  } catch (error) {
    console.error('Failed to log mood:', error);
    showNotification(error.message || 'Failed to log mood', 'error');
  }
};

const deleteMoodEntry = async (id) => {
  try {
    await moodAPI.delete(id);
    const updatedHistory = moodHistory.filter(entry => entry._id !== id);
    setMoodHistory(updatedHistory);
    showNotification('Mood entry deleted');
  } catch (error) {
    console.error('Failed to delete mood:', error);
    showNotification('Failed to delete mood', 'error');
  }
};

  const getMoodColor = (moodValue) => {
    const mood = moods.find(m => m.value === moodValue);
    return mood ? mood.color : '#4ECDC4';
  };

  const getAverageMood = () => {
    if (moodHistory.length === 0) return 0;
    const sum = moodHistory.reduce((acc, entry) => acc + entry.mood, 0);
    return (sum / moodHistory.length).toFixed(1);
  };

  const getMoodDistribution = () => {
    const distribution = moods.map(mood => ({
      ...mood,
      count: moodHistory.filter(entry => entry.mood === mood.value).length
    }));
    return distribution.filter(d => d.count > 0);
  };

  const getRecentStreak = () => {
    let streak = 0;
    const sortedHistory = [...moodHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (let i = 0; i < sortedHistory.length; i++) {
      const entryDate = new Date(sortedHistory[i].date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (sortedHistory[i].date === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getMoodTrendData = (period) => {
    const now = new Date();
    let daysBack = 7;
    let format = { month: 'short', day: 'numeric' };
    
    if (period === 'monthly') {
      daysBack = 30;
    } else if (period === 'yearly') {
      daysBack = 365;
      format = { month: 'short' };
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    const filteredHistory = [...moodHistory]
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (period === 'yearly') {
      const monthlyData = {};
      filteredHistory.forEach(entry => {
        const month = new Date(entry.date).toLocaleDateString('en-US', format);
        if (!monthlyData[month]) {
          monthlyData[month] = { total: 0, count: 0 };
        }
        monthlyData[month].total += entry.mood;
        monthlyData[month].count += 1;
      });
      
      return Object.entries(monthlyData).map(([month, data]) => ({
        date: month,
        mood: data.total / data.count,
        fullDate: month
      }));
    }
    
    return filteredHistory.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', format),
      mood: entry.mood,
      fullDate: entry.date
    }));
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getMoodForDate = (dateStr) => {
    return moodHistory.filter(entry => entry.date === dateStr);
  };

  const handleDateClick = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowDateModal(true);
  };

  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
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
    viewToggle: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '30px',
      gap: '10px',
      flexWrap: 'wrap'
    },
    toggleBtn: {
      padding: '12px 24px',
      border: '1px solid #4ECDC4',
      background: 'white',
      color: '#4ECDC4',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    activeToggleBtn: {
      background: '#4ECDC4',
      color: 'white'
    },
    card: {
      background: 'white',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)',
      marginBottom: '30px'
    },
    moodGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
      gap: '15px',
      marginBottom: '25px'
    },
    moodOption: {
      padding: '20px 10px',
      border: '2px solid #ddd',
      borderRadius: '15px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: 'white',
      position: 'relative'
    },
    selectedMood: {
      borderColor: '#4ECDC4',
      background: 'linear-gradient(135deg, #f0fdfc 0%, #e0f9f7 100%)',
      transform: 'scale(1.05)',
      boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)'
    },
    moodEmoji: {
      fontSize: '48px',
      marginBottom: '10px',
      display: 'block'
    },
    moodName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    },
    textarea: {
      width: '100%',
      minHeight: '100px',
      padding: '15px',
      border: '2px solid #e0e0e0',
      borderRadius: '10px',
      fontSize: '15px',
      fontFamily: 'inherit',
      resize: 'vertical',
      marginBottom: '20px',
      transition: 'border-color 0.3s ease',
      boxSizing: 'border-box'
    },
    submitBtn: {
      padding: '14px 40px',
      background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
      padding: '25px',
      borderRadius: '12px',
      textAlign: 'center',
      color: 'white',
      boxShadow: '0 4px 15px rgba(78, 205, 196, 0.4)'
    },
    statNumber: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    statLabel: {
      fontSize: '14px',
      opacity: 0.9
    },
    calendar: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)'
    },
    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      padding: '0 10px'
    },
    calendarTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#333'
    },
    calendarNav: {
      display: 'flex',
      gap: '10px'
    },
    navBtn: {
      padding: '8px 16px',
      background: '#4ECDC4',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    weekDays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '5px',
      marginBottom: '10px'
    },
    weekDay: {
      textAlign: 'center',
      padding: '10px',
      fontWeight: '600',
      color: '#666',
      fontSize: '14px'
    },
    calendarDays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '5px'
    },
    calendarDay: {
      aspectRatio: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '1px solid #f0f0f0',
      position: 'relative'
    },
    emptyDay: {
      cursor: 'default',
      border: 'none'
    },
    dayNumber: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '4px'
    },
    dayMoodIndicator: {
      fontSize: '20px'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      background: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '20px',
      textAlign: 'center'
    },
    modalBtnGroup: {
      display: 'flex',
      gap: '10px',
      marginTop: '20px'
    },
    modalBtn: {
      flex: 1,
      padding: '12px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    primaryModalBtn: {
      background: '#4ECDC4',
      color: 'white'
    },
    secondaryModalBtn: {
      background: '#f0f0f0',
      color: '#333'
    },
    entryCard: {
      background: '#f8f9fa',
      padding: '15px',
      borderRadius: '10px',
      marginBottom: '15px',
      border: '1px solid #e0e0e0'
    },
    entryTime: {
      fontSize: '12px',
      color: '#666',
      marginBottom: '8px'
    },
    entryMood: {
      fontSize: '32px',
      marginBottom: '8px'
    },
    entryNote: {
      fontSize: '14px',
      color: '#333',
      lineHeight: '1.5'
    },
    trendControls: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    trendBtn: {
      padding: '10px 20px',
      border: '1px solid #4ECDC4',
      background: 'white',
      color: '#4ECDC4',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    activeTrendBtn: {
      background: '#4ECDC4',
      color: 'white'
    },
    addCustomBtn: {
      padding: '10px 20px',
      background: '#9C27B0',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '20px'
    },
    customMoodForm: {
      background: '#f8f9fa',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '20px'
    },
    formGroup: {
      marginBottom: '15px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '500',
      color: '#333',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box'
    }
  };

  return (
    <div style={styles.body}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <img src={logo} alt="ZenStudent Logo" style={styles.logoImg} />
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
            <span style={{...styles.navLink, ...styles.activeNavLink}}>
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
              style={{...styles.userAvatar, cursor: 'pointer'}} 
              onClick={() => navigate('/profile')}
            >
              <img src={profileIcon} alt="Profile" style={styles.logoImg} />
            </div>
            <span
              style={styles.logoutBtn}
              onClick={() => navigate('/')}
              onMouseOver={(e) => { e.target.style.background = 'hsl(176, 56%, 45%)'; }}
              onMouseOut={(e) => { e.target.style.background = '#4ECDC4'; }}
            >
              Logout
            </span>
          </div>
        </div>
      </header>

      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Mood Tracker</h1>
        <p style={styles.pageSubtitle}>Track your daily emotions and discover patterns in your wellbeing journey</p>

        <div style={styles.viewToggle}>
          <button
            style={{
              ...styles.toggleBtn,
              ...(currentView === 'log' ? styles.activeToggleBtn : {})
            }}
            onClick={() => setCurrentView('log')}
          >
            Log Mood
          </button>
          <button
            style={{
              ...styles.toggleBtn,
              ...(currentView === 'calendar' ? styles.activeToggleBtn : {})
            }}
            onClick={() => setCurrentView('calendar')}
          >
            Calendar View
          </button>
          <button
            style={{
              ...styles.toggleBtn,
              ...(currentView === 'analysis' ? styles.activeToggleBtn : {})
            }}
            onClick={() => setCurrentView('analysis')}
          >
            Analysis
          </button>
        </div>

        {currentView === 'log' && (
          <div>
            <div style={styles.card}>
              <h2 style={{ marginBottom: '25px', color: '#333', textAlign: 'center' }}>How are you feeling today?</h2>
              
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                  style={styles.addCustomBtn}
                  onClick={() => setShowCustomMoodForm(!showCustomMoodForm)}
                >
                  {showCustomMoodForm ? '− Cancel' : '+ Add Custom Mood'}
                </button>
              </div>

              {showCustomMoodForm && (
                <div style={styles.customMoodForm}>
                  <h3 style={{ marginBottom: '15px', color: '#333' }}>Create Custom Mood</h3>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Emoji</label>
                    <input
                      style={styles.input}
                      type="text"
                      value={newCustomMood.emoji}
                      onChange={(e) => setNewCustomMood({...newCustomMood, emoji: e.target.value})}
                      placeholder="Enter an emoji (e.g., 🤗)"
                      maxLength="2"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Mood Name</label>
                    <input
                      style={styles.input}
                      type="text"
                      value={newCustomMood.name}
                      onChange={(e) => setNewCustomMood({...newCustomMood, name: e.target.value})}
                      placeholder="e.g., Excited, Anxious, Peaceful"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Intensity (1-5)</label>
                    <input
                      style={styles.input}
                      type="range"
                      min="1"
                      max="5"
                      value={newCustomMood.value}
                      onChange={(e) => setNewCustomMood({...newCustomMood, value: parseInt(e.target.value)})}
                    />
                    <div style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginTop: '5px' }}>
                      {newCustomMood.value}
                    </div>
                  </div>
                  <button
                    style={{...styles.submitBtn, width: '100%'}}
                    onClick={handleAddCustomMood}
                  >
                    Add Custom Mood
                  </button>
                </div>
              )}
              
              <form onSubmit={handleMoodSubmit}>
                <div style={styles.moodGrid}>
                  {moods.map((mood) => (
                    <div
                      key={mood.name}
                      style={{
                        ...styles.moodOption,
                        ...(selectedMood === mood.value ? styles.selectedMood : {})
                      }}
                      onClick={() => setSelectedMood(mood.value)}
                    >
                      <span style={styles.moodEmoji}>{mood.emoji}</span>
                      <span style={styles.moodName}>{mood.name}</span>
                    </div>
                  ))}
                </div>

                <textarea
                  style={styles.textarea}
                  placeholder="What's on your mind? (optional)..."
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#4ECDC4'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="submit"
                    style={styles.submitBtn}
                    onMouseOver={(e) => { 
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.4)';
                    }}
                    onMouseOut={(e) => { 
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.3)';
                    }}
                  >
                    Log Mood Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {currentView === 'calendar' && (
          <div style={styles.card}>
            <div style={styles.calendarHeader}>
              <button 
                style={styles.navBtn}
                onClick={() => changeMonth(-1)}
              >
                ← Previous
              </button>
              <h2 style={styles.calendarTitle}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button 
                style={styles.navBtn}
                onClick={() => changeMonth(1)}
              >
                Next →
              </button>
            </div>

            <div style={styles.weekDays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={styles.weekDay}>{day}</div>
              ))}
            </div>

            <div style={styles.calendarDays}>
              {(() => {
                const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
                const days = [];
                
                for (let i = 0; i < startingDayOfWeek; i++) {
                  days.push(<div key={`empty-${i}`} style={{...styles.calendarDay, ...styles.emptyDay}}></div>);
                }
                
                for (let day = 1; day <= daysInMonth; day++) {
                  const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayMoods = getMoodForDate(dateStr);
                  const avgMood = dayMoods.length > 0 
                    ? dayMoods.reduce((sum, entry) => sum + entry.mood, 0) / dayMoods.length 
                    : null;
                  const moodEmoji = avgMood ? moods.find(m => m.value === Math.round(avgMood))?.emoji : '';
                  
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  
                  days.push(
                    <div
                      key={day}
                      style={{
                        ...styles.calendarDay,
                        background: isToday ? '#e0f9f7' : (dayMoods.length > 0 ? '#f8f9fa' : 'white'),
                        border: isToday ? '2px solid #4ECDC4' : '1px solid #f0f0f0'
                      }}
                      onClick={() => handleDateClick(day)}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#f0fdfc';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = isToday ? '#e0f9f7' : (dayMoods.length > 0 ? '#f8f9fa' : 'white');
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <div style={styles.dayNumber}>{day}</div>
                      {moodEmoji && <div style={styles.dayMoodIndicator}>{moodEmoji}</div>}
                      {dayMoods.length > 1 && (
                        <div style={{ fontSize: '10px', color: '#666' }}>+{dayMoods.length - 1}</div>
                      )}
                    </div>
                  );
                }
                
                return days;
              })()}
            </div>
          </div>
        )}

        {showDateModal && selectedDate && (
          <div style={styles.modal} onClick={() => setShowDateModal(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3 style={styles.modalTitle}>
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              {(() => {
                const dayEntries = getMoodForDate(selectedDate);
                
                if (dayEntries.length > 0) {
                  return (
                    <>
                      <h4 style={{ color: '#333', marginBottom: '15px' }}>Entries for this day:</h4>
                      {dayEntries.map(entry => {
                        const mood = moods.find(m => m.value === entry.mood);
                        return (
                          <div key={entry.id} style={styles.entryCard}>
                            <div style={styles.entryTime}>{entry.timestamp}</div>
                            <div style={styles.entryMood}>{mood?.emoji} {mood?.name}</div>
                            {entry.note && <div style={styles.entryNote}>{entry.note}</div>}
                            <button
                              style={{
                                ...styles.modalBtn,
                                background: '#f44336',
                                color: 'white',
                                marginTop: '10px',
                                padding: '8px 16px',
                                fontSize: '12px'
                              }}
                              onClick={() => {
                                deleteMoodEntry(entry.id);
                                if (dayEntries.length === 1) {
                                  setShowDateModal(false);
                                }
                              }}
                            >
                              Delete Entry
                            </button>
                          </div>
                        );
                      })}
                    </>
                  );
                } else {
                  return (
                    <p style={{ textAlign: 'center', color: '#666', margin: '20px 0' }}>
                      No mood entries for this day yet.
                    </p>
                  );
                }
              })()}
              
              <div style={styles.modalBtnGroup}>
                <button
                  style={{...styles.modalBtn, ...styles.primaryModalBtn}}
                  onClick={() => {
                    setShowDateModal(false);
                    setCurrentView('log');
                  }}
                  onMouseOver={(e) => e.target.style.background = '#45b7aa'}
                  onMouseOut={(e) => e.target.style.background = '#4ECDC4'}
                >
                  Add New Entry
                </button>
                <button
                  style={{...styles.modalBtn, ...styles.secondaryModalBtn}}
                  onClick={() => setShowDateModal(false)}
                  onMouseOver={(e) => e.target.style.background = '#e0e0e0'}
                  onMouseOut={(e) => e.target.style.background = '#f0f0f0'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'analysis' && (
          <div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{moodHistory.length}</div>
                <div style={styles.statLabel}>Total Entries</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{getAverageMood()}</div>
                <div style={styles.statLabel}>Average Mood</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{getRecentStreak()}</div>
                <div style={styles.statLabel}>Day Streak</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>
                  {moodHistory.filter(entry => 
                    new Date(entry.date).toDateString() === new Date().toDateString()
                  ).length > 0 ? '✓' : '○'}
                </div>
                <div style={styles.statLabel}>Today's Entry</div>
              </div>
            </div>

            {moodHistory.length > 0 ? (
              <>
                <div style={styles.card}>
                  <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>Mood Trends</h3>
                  
                  <div style={styles.trendControls}>
                    <button
                      style={{
                        ...styles.trendBtn,
                        ...(trendPeriod === 'weekly' ? styles.activeTrendBtn : {})
                      }}
                      onClick={() => setTrendPeriod('weekly')}
                    >
                      Weekly
                    </button>
                    <button
                      style={{
                        ...styles.trendBtn,
                        ...(trendPeriod === 'monthly' ? styles.activeTrendBtn : {})
                      }}
                      onClick={() => setTrendPeriod('monthly')}
                    >
                      Monthly
                    </button>
                    <button
                      style={{
                        ...styles.trendBtn,
                        ...(trendPeriod === 'yearly' ? styles.activeTrendBtn : {})
                      }}
                      onClick={() => setTrendPeriod('yearly')}
                    >
                      Yearly
                    </button>
                  </div>

                  <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getMoodTrendData(trendPeriod)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[1, 5]} />
                        <Tooltip 
                          formatter={(value) => [
                            `${moods.find(m => m.value === Math.round(value))?.name || value}`,
                            'Mood'
                          ]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="#4ECDC4" 
                          strokeWidth={3}
                          dot={{ fill: '#4ECDC4', strokeWidth: 2, r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={styles.card}>
                  <h3 style={{ marginBottom: '20px', color: '#333' }}>Mood Distribution</h3>
                  <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getMoodDistribution()} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip 
                          formatter={(value) => [value, 'Times felt']}
                          contentStyle={{
                            background: 'white',
                            border: '1px solid #4ECDC4',
                            borderRadius: '8px',
                            padding: '10px'
                          }}
                        />
                        <Bar dataKey="count" radius={[0, 10, 10, 0]}>
                          {getMoodDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Fun Emoji Summary */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '15px',
                    marginTop: '20px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderRadius: '12px'
                  }}>
                    {getMoodDistribution().map((mood, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '15px',
                        background: 'white',
                        borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        minWidth: '80px'
                      }}>
                        <span style={{ fontSize: '32px', marginBottom: '5px' }}>{mood.emoji}</span>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: mood.color }}>
                          {mood.count}
                        </span>
                        <span style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                          {mood.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.card}>
                  <h3 style={{ marginBottom: '20px', color: '#333' }}>Insights & Suggestions</h3>
                  {(() => {
                    const recentMoods = moodHistory.slice(0, 7);
                    const avgMood = recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length;
                    const trend = recentMoods.length >= 2 
                      ? recentMoods[0].mood - recentMoods[recentMoods.length - 1].mood 
                      : 0;
                    
                    return (
                      <div>
                        <div style={{
                          background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                          padding: '25px',
                          borderRadius: '15px',
                          color: 'white',
                          marginBottom: '20px',
                          boxShadow: '0 4px 20px rgba(78, 205, 196, 0.3)'
                        }}>
                          <h4 style={{ marginBottom: '12px', fontSize: '20px', fontWeight: '600' }}>
                            📊 Your Weekly Average
                          </h4>
                          <p style={{ fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
                            {avgMood >= 4 && "You've been feeling great this week! Keep up the positive momentum. 🌟"}
                            {avgMood >= 3 && avgMood < 4 && "Your mood has been fairly stable. Consider activities that bring you joy! 🌈"}
                            {avgMood >= 2 && avgMood < 3 && "It's been a challenging week. Remember to practice self-care and reach out to loved ones. 💙"}
                            {avgMood < 2 && "You're going through a tough time. Please consider talking to a counselor or trusted friend. You're not alone. 🤗"}
                          </p>
                        </div>

                        <div style={{
                          background: 'linear-gradient(135deg, #e0f9f7 0%, #f0fdfc 100%)',
                          padding: '25px',
                          borderRadius: '15px',
                          border: '2px solid #4ECDC4',
                          marginBottom: '20px'
                        }}>
                          <h4 style={{ marginBottom: '12px', fontSize: '20px', color: '#2C3E50', fontWeight: '600' }}>
                            📈 Trend Analysis
                          </h4>
                          <p style={{ fontSize: '16px', lineHeight: '1.6', margin: 0, color: '#2C3E50' }}>
                            {trend > 0.5 && "📈 Your mood is trending upward! Whatever you're doing is working - keep it up!"}
                            {trend >= -0.5 && trend <= 0.5 && "➡️ Your mood has been relatively stable recently."}
                            {trend < -0.5 && "📉 Your mood has been declining. This might be a good time to focus on self-care activities or talk to someone."}
                          </p>
                        </div>

                        <div style={{
                          background: 'linear-gradient(135deg, #FFF4E6 0%, #FFE4CC 100%)',
                          padding: '25px',
                          borderRadius: '15px',
                          border: '2px solid #FFB84D'
                        }}>
                          <h4 style={{ marginBottom: '15px', fontSize: '20px', color: '#2C3E50', fontWeight: '600' }}>
                            💡 Wellness Tips
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '2', color: '#2C3E50', fontSize: '15px' }}>
                            <li>Practice gratitude: Write 3 things you're grateful for daily</li>
                            <li>Stay active: Even a 10-minute walk can boost your mood</li>
                            <li>Connect with others: Reach out to a friend or family member</li>
                            <li>Get quality sleep: Aim for 7-9 hours per night</li>
                            <li>Limit social media: Take breaks to reduce comparison and anxiety</li>
                          </ul>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            ) : (
              <div style={styles.card}>
                <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                  <p style={{ fontSize: '18px', marginBottom: '20px' }}>No mood data available yet.</p>
                  <button
                    style={styles.submitBtn}
                    onClick={() => setCurrentView('log')}
                  >
                    Start Logging Your Moods
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 25px',
          borderRadius: '10px',
          color: 'white',
          fontWeight: '500',
          zIndex: 1000,
          transform: notification.show ? 'translateX(0)' : 'translateX(400px)',
          transition: 'transform 0.3s ease',
          background: notification.type === 'success' ? 
            'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : 
            'linear-gradient(135deg, #f44336 0%, #da190b 100%)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          maxWidth: '400px',
          lineHeight: '1.5'
        }}
      >
        {notification.message}
      </div>
    </div>
  );
};

export default MoodTracker;