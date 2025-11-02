import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import logo from './assets/logo.png';
import profileIcon from './assets/profileIcon.png';
import { goalAPI } from './api';

const GoalsTracker = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('today');
  const [goals, setGoals] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDateGoals, setShowDateGoals] = useState(false);
  const [trendPeriod, setTrendPeriod] = useState('weekly');
  const [analyticsFilter, setAnalyticsFilter] = useState('all');
  const [analyticsView, setAnalyticsView] = useState('progress');
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'academic',
    priority: 'medium',
    targetValue: 100,
    currentValue: 0,
    unit: '%',
    dueDate: '',
    tags: []
  });

  const categories = [
    { id: 'academic', name: 'Academic', icon: '📚', color: '#4ECDC4' },
    { id: 'fitness', name: 'Fitness', icon: '💪', color: '#45B7D1' },
    { id: 'personal', name: 'Personal', icon: '🌱', color: '#96CEB4' },
    { id: 'career', name: 'Career', icon: '💼', color: '#FFEAA7' },
    { id: 'financial', name: 'Financial', icon: '💰', color: '#DDA0DD' },
    { id: 'social', name: 'Social', icon: '👥', color: '#98D8C8' }
  ];

  const priorities = [
    { id: 'low', name: 'Low', color: '#95E1D3' },
    { id: 'medium', name: 'Medium', color: '#F8D7B0' },
    { id: 'high', name: 'High', color: '#F38BA8' },
    { id: 'urgent', name: 'Urgent', color: '#FF6B6B' }
  ];

useEffect(() => {
  const fetchGoals = async () => {
    try {
      const fetchedGoals = await goalAPI.getAll();
      setGoals(fetchedGoals);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      showNotification('Failed to load goals', 'error');
    }
  };
  
  fetchGoals();
}, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

const handleAddGoal = async () => {
  if (!newGoal.title.trim()) {
    showNotification('Please enter a goal title', 'error');
    return;
  }

  try {
    const goal = await goalAPI.create({
      ...newGoal,
      createdDate: new Date().toISOString().split('T')[0]
    });

    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    
    setNewGoal({
      title: '',
      description: '',
      category: 'academic',
      priority: 'medium',
      targetValue: 100,
      currentValue: 0,
      unit: '%',
      dueDate: '',
      tags: []
    });

    showNotification('Goal added successfully! 🎯');
    setShowAddModal(false);
  } catch (error) {
    console.error('Failed to add goal:', error);
    showNotification(error.message || 'Failed to add goal', 'error');
  }
};

const handleEditGoal = async () => {
  if (!editingGoal.title.trim()) {
    showNotification('Please enter a goal title', 'error');
    return;
  }

  try {
    const updated = await goalAPI.update(editingGoal._id, editingGoal);
    const updatedGoals = goals.map(g => g._id === editingGoal._id ? updated : g);
    setGoals(updatedGoals);
    
    showNotification('Goal updated successfully!');
    setShowEditModal(false);
    setEditingGoal(null);
  } catch (error) {
    console.error('Failed to update goal:', error);
    showNotification(error.message || 'Failed to update goal', 'error');
  }
};
const toggleComplete = async (goalId) => {
  try {
    const goal = goals.find(g => g._id === goalId);
    const updated = await goalAPI.update(goalId, {
      ...goal,
      completed: !goal.completed,
      currentValue: !goal.completed ? goal.targetValue : goal.currentValue
    });
    
    const updatedGoals = goals.map(g => g._id === goalId ? updated : g);
    setGoals(updatedGoals);
    
    if (updated.completed) {
      showNotification(`Congratulations! "${updated.title}" completed! 🎉`);
    }
  } catch (error) {
    console.error('Failed to toggle goal:', error);
    showNotification('Failed to update goal', 'error');
  }
};
const deleteGoal = async (goalId) => {
  try {
    await goalAPI.delete(goalId);
    const updatedGoals = goals.filter(goal => goal._id !== goalId);
    setGoals(updatedGoals);
    showNotification('Goal deleted');
  } catch (error) {
    console.error('Failed to delete goal:', error);
    showNotification('Failed to delete goal', 'error');
  }
};
  const handleProgressClick = (e, goal) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width);
    const newValue = Math.round(percentage * goal.targetValue);
    handleProgressDrag(goal.id, newValue);
  };

const handleProgressDrag = async (goalId, newValue) => {
  try {
    const goal = goals.find(g => g._id === goalId);
    const progress = Math.min(Math.max(newValue, 0), goal.targetValue);
    const completed = progress >= goal.targetValue;
    
    const updated = await goalAPI.update(goalId, {
      ...goal,
      currentValue: progress,
      completed
    });
    
    const updatedGoals = goals.map(g => g._id === goalId ? updated : g);
    setGoals(updatedGoals);
    
    if (completed && !goal.completed) {
      showNotification(`Congratulations! "${goal.title}" completed! 🎉`);
    }
  } catch (error) {
    console.error('Failed to update progress:', error);
  }
};

  const getTodayGoals = () => {
    const today = new Date().toISOString().split('T')[0];
    return goals.filter(g => !g.completed && g.dueDate === today);
  };

  const getOverdueGoals = () => {
    const today = new Date().toISOString().split('T')[0];
    return goals.filter(g => !g.completed && g.dueDate && g.dueDate < today);
  };

  const getGoalsForDate = (dateStr) => {
    return goals.filter(g => g.dueDate === dateStr);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay(),
      year,
      month
    };
  };

  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowDateGoals(true);
  };

  const getUnifiedChartData = (period, filter, view) => {
    let filteredGoals = goals;
    
    if (filter !== 'all') {
      filteredGoals = goals.filter(g => g.category === filter);
    }

    const now = new Date();
    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredGoals = filteredGoals.filter(g => new Date(g.createdDate) >= weekAgo);
    } else if (period === 'monthly') {
      filteredGoals = filteredGoals.filter(g => 
        new Date(g.createdDate).getMonth() === now.getMonth() &&
        new Date(g.createdDate).getFullYear() === now.getFullYear()
      );
    } else if (period === 'yearly') {
      filteredGoals = filteredGoals.filter(g => 
        new Date(g.createdDate).getFullYear() === now.getFullYear()
      );
    }

    if (view === 'progress') {
      return [
        { name: 'Completed', value: filteredGoals.filter(g => g.completed).length, fill: '#4CAF50' },
        { name: 'In Progress', value: filteredGoals.filter(g => !g.completed && g.currentValue > 0).length, fill: '#FF9800' },
        { name: 'Not Started', value: filteredGoals.filter(g => g.currentValue === 0 && !g.completed).length, fill: '#9E9E9E' }
      ].filter(item => item.value > 0);
    } else if (view === 'category') {
      return categories.map(cat => ({
        ...cat,
        total: filteredGoals.filter(g => g.category === cat.id).length,
        completed: filteredGoals.filter(g => g.category === cat.id && g.completed).length
      })).filter(c => c.total > 0);
    } else if (view === 'priority') {
      return priorities.map(p => ({
        priority: p.name,
        count: filteredGoals.filter(g => g.priority === p.id).length,
        fill: p.color
      })).filter(p => p.count > 0);
    } else if (view === 'performance') {
      return categories.map(cat => {
        const catGoals = filteredGoals.filter(g => g.category === cat.id);
        const avgProgress = catGoals.length > 0
          ? catGoals.reduce((sum, g) => sum + ((g.currentValue / g.targetValue) * 100), 0) / catGoals.length
          : 0;
        
        return {
          category: cat.name,
          progress: Math.round(avgProgress),
          fullMark: 100
        };
      }).filter(c => c.progress > 0);
    }
  };

  const getProgressPercentage = (goal) => {
    return Math.round((goal.currentValue / goal.targetValue) * 100);
  };

  const renderGoalCard = (goal) => {
    const category = categories.find(c => c.id === goal.category);
    const progress = getProgressPercentage(goal);
    const isOverdue = goal.dueDate && new Date(goal.dueDate) < new Date() && !goal.completed;
    
    return (
      <div
        key={goal.id}
        style={{
          ...styles.goalCard,
          borderColor: isOverdue ? '#f44336' : '#eee'
        }}
        onClick={() => {
          setEditingGoal({...goal});
          setShowEditModal(true);
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={styles.goalHeader}>
          <div style={{flex: 1}}>
            <div style={styles.goalTitle}>
              {goal.title}
              {goal.completed && <span style={{color: '#4CAF50', marginLeft: '10px'}}>✓</span>}
            </div>
            <div style={styles.goalMeta}>
              <span style={{...styles.categoryBadge, background: category?.color}}>
                {category?.icon} {category?.name}
              </span>
              {goal.dueDate && (
                <span style={{color: isOverdue ? '#f44336' : '#666'}}>
                  Due: {new Date(goal.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: goal.completed ? '#4CAF50' : (isOverdue ? '#f44336' : '#4ECDC4')
            }}>
              {progress}%
            </div>
          </div>
        </div>

        {goal.description && (
          <p style={{fontSize: '14px', color: '#666', marginBottom: '15px', marginTop: '10px'}}>
            {goal.description}
          </p>
        )}

        <div style={styles.progressContainer} onClick={(e) => e.stopPropagation()}>
          <div 
            style={styles.progressBarWrapper}
            onClick={(e) => handleProgressClick(e, goal)}
          >
            <div
              style={{
                ...styles.progressFill,
                width: `${progress}%`,
                backgroundColor: goal.completed ? '#4CAF50' : (isOverdue ? '#f44336' : '#4ECDC4')
              }}
            >
              <div style={{
                ...styles.progressHandle,
                borderColor: goal.completed ? '#4CAF50' : (isOverdue ? '#f44336' : '#4ECDC4')
              }} />
            </div>
          </div>
          <div style={styles.progressText}>
            <span>{progress}% complete</span>
            <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
          </div>
        </div>

        {!goal.completed && (
          <div style={styles.actionButtons} onClick={(e) => e.stopPropagation()}>
            <button
              style={{...styles.btn, ...styles.completeBtn}}
              onClick={() => toggleComplete(goal.id)}
            >
              Mark Complete
            </button>
            <button
              style={{...styles.btn, ...styles.deleteBtn}}
              onClick={() => {
                if (window.confirm('Delete this goal?')) deleteGoal(goal.id);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
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
      padding: '40px 20px',
      position: 'relative'
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
      marginBottom: '30px',
      position: 'relative'
    },
    addButton: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '65px',
      height: '65px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
      color: 'white',
      border: 'none',
      fontSize: '36px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 6px 20px rgba(78, 205, 196, 0.5)',
      transition: 'all 0.3s ease',
      zIndex: 999,
      fontWeight: '300',
      lineHeight: '1',
      padding: 0
    },
    goalCard: {
      background: 'white',
      border: '2px solid #eee',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '15px',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    goalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '10px'
    },
    goalTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '8px'
    },
    goalMeta: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      flexWrap: 'wrap',
      fontSize: '13px'
    },
    categoryBadge: {
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      color: 'white'
    },
    progressContainer: {
      marginBottom: '15px',
      marginTop: '15px'
    },
    progressBarWrapper: {
      position: 'relative',
      height: '12px',
      backgroundColor: '#f0f0f0',
      borderRadius: '6px',
      overflow: 'visible',
      marginBottom: '8px',
      cursor: 'pointer'
    },
    progressFill: {
      height: '100%',
      borderRadius: '6px',
      transition: 'width 0.3s ease',
      position: 'relative'
    },
    progressHandle: {
      position: 'absolute',
      right: '-8px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '20px',
      height: '20px',
      background: 'white',
      border: '3px solid',
      borderRadius: '50%',
      cursor: 'grab',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
    },
    progressText: {
      fontSize: '13px',
      color: '#666',
      display: 'flex',
      justifyContent: 'space-between'
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
      marginTop: '15px'
    },
    btn: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    completeBtn: {
      background: '#4CAF50',
      color: 'white'
    },
    deleteBtn: {
      background: '#f44336',
      color: 'white'
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
      maxWidth: '600px',
      width: '90%',
      maxHeight: '85vh',
      overflow: 'auto'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '25px',
      textAlign: 'center'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#333',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      minHeight: '80px',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white',
      boxSizing: 'border-box'
    },
    modalBtnGroup: {
      display: 'flex',
      gap: '10px',
      marginTop: '25px'
    },
    primaryBtn: {
      flex: 1,
      padding: '12px',
      background: '#4ECDC4',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '500'
    },
    secondaryBtn: {
      flex: 1,
      padding: '12px',
      background: '#f0f0f0',
      color: '#333',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '500'
    },
    calendar: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '650px',
      margin: '0 auto'
    },
    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    calendarTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333'
    },
    navBtn: {
      padding: '6px 14px',
      background: '#4ECDC4',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px'
    },
    weekDays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '4px',
      marginBottom: '8px'
    },
    weekDay: {
      textAlign: 'center',
      padding: '8px',
      fontWeight: '600',
      color: '#666',
      fontSize: '13px'
    },
    calendarDays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '4px'
    },
    calendarDay: {
      aspectRatio: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '1px solid #f0f0f0',
      position: 'relative',
      fontSize: '12px'
    },
    dayNumber: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '2px'
    },
    goalDot: {
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      marginTop: '1px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: '2px solid #4ECDC4'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: '#666'
    },
    filterControls: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    filterBtn: {
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
    activeFilterBtn: {
      background: '#4ECDC4',
      color: 'white'
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
            <span style={{...styles.navLink, ...styles.activeNavLink}}>
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
        <h1 style={styles.pageTitle}>Goal Tracker</h1>
        <p style={styles.pageSubtitle}>Track, achieve, and celebrate your goals</p>

        <div style={styles.viewToggle}>
          <button
            style={{...styles.toggleBtn, ...(currentView === 'today' ? styles.activeToggleBtn : {})}}
            onClick={() => setCurrentView('today')}
          >
            Today
          </button>
          <button
            style={{...styles.toggleBtn, ...(currentView === 'goals' ? styles.activeToggleBtn : {})}}
            onClick={() => setCurrentView('goals')}
          >
            Goals
          </button>
          <button
            style={{...styles.toggleBtn, ...(currentView === 'calendar' ? styles.activeToggleBtn : {})}}
            onClick={() => setCurrentView('calendar')}
          >
            Calendar
          </button>
          <button
            style={{...styles.toggleBtn, ...(currentView === 'analysis' ? styles.activeToggleBtn : {})}}
            onClick={() => setCurrentView('analysis')}
          >
            Analysis
          </button>
        </div>

        {currentView === 'today' && (
          <div>
            {getOverdueGoals().length > 0 && (
              <div style={styles.card}>
                <h3 style={{...styles.sectionTitle, color: '#f44336', borderBottomColor: '#f44336'}}>
                  ⚠️ Overdue ({getOverdueGoals().length})
                </h3>
                {getOverdueGoals().map(goal => renderGoalCard(goal))}
              </div>
            )}

            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>📅 Today's Goals ({getTodayGoals().length})</h3>
              {getTodayGoals().length > 0 ? (
                getTodayGoals().map(goal => renderGoalCard(goal))
              ) : (
                <div style={styles.emptyState}>
                  <p>No goals due today. You're all caught up! 🎉</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'goals' && (
          <div>
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>All Goals ({goals.filter(g => !g.completed).length})</h3>
              
              {goals.filter(g => !g.completed).length > 0 ? (
                goals.filter(g => !g.completed).map(goal => renderGoalCard(goal))
              ) : (
                <div style={styles.emptyState}>
                  <p>No active goals. Click + to add your first goal!</p>
                </div>
              )}
            </div>

            <button
              style={styles.addButton}
              onClick={() => setShowAddModal(true)}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 8px 25px rgba(78, 205, 196, 0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.5)';
              }}
            >
              +
            </button>
          </div>
        )}

        {currentView === 'calendar' && (
          <div>
            <div style={styles.card}>
              <div style={styles.calendarHeader}>
                <button style={styles.navBtn} onClick={() => changeMonth(-1)}>
                  ← Prev
                </button>
                <h2 style={styles.calendarTitle}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button style={styles.navBtn} onClick={() => changeMonth(1)}>
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
                    days.push(<div key={`empty-${i}`} style={{...styles.calendarDay, cursor: 'default', border: 'none'}}></div>);
                  }
                  
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayGoals = getGoalsForDate(dateStr);
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    
                    days.push(
                      <div
                        key={day}
                        style={{
                          ...styles.calendarDay,
                          background: isToday ? '#e0f9f7' : (dayGoals.length > 0 ? '#f8f9fa' : 'white'),
                          border: isToday ? '2px solid #4ECDC4' : '1px solid #f0f0f0'
                        }}
                        onClick={() => handleDateClick(day)}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#f0fdfc';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = isToday ? '#e0f9f7' : (dayGoals.length > 0 ? '#f8f9fa' : 'white');
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <div style={styles.dayNumber}>{day}</div>
                        {dayGoals.length > 0 && (
                          <div style={{display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center'}}>
                            {dayGoals.slice(0, 3).map((goal, idx) => {
                              const cat = categories.find(c => c.id === goal.category);
                              return <div key={idx} style={{...styles.goalDot, background: cat?.color}} />;
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>

            {showDateGoals && selectedDate && (
              <div style={styles.card}>
                <h3 style={styles.sectionTitle}>
                  Goals for {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>

                <button
                  style={{...styles.btn, ...styles.completeBtn, marginBottom: '20px', padding: '12px 24px'}}
                  onClick={() => {
                    setNewGoal({...newGoal, dueDate: selectedDate});
                    setShowAddModal(true);
                  }}
                >
                  + Add Goal for This Day
                </button>

                {getGoalsForDate(selectedDate).length > 0 ? (
                  getGoalsForDate(selectedDate).map(goal => renderGoalCard(goal))
                ) : (
                  <div style={styles.emptyState}>
                    <p>No goals scheduled for this day.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {currentView === 'analysis' && (
          <div>
            <div style={styles.card}>
              <div style={{marginBottom: '15px', textAlign: 'center', fontWeight: '600', color: '#333'}}>
                Time Period
              </div>
              <div style={styles.filterControls}>
                <button
                  style={{...styles.filterBtn, ...(trendPeriod === 'weekly' ? styles.activeFilterBtn : {})}}
                  onClick={() => setTrendPeriod('weekly')}
                >
                  Weekly
                </button>
                <button
                  style={{...styles.filterBtn, ...(trendPeriod === 'monthly' ? styles.activeFilterBtn : {})}}
                  onClick={() => setTrendPeriod('monthly')}
                >
                  Monthly
                </button>
                <button
                  style={{...styles.filterBtn, ...(trendPeriod === 'yearly' ? styles.activeFilterBtn : {})}}
                  onClick={() => setTrendPeriod('yearly')}
                >
                  Yearly
                </button>
              </div>

              <div style={{marginTop: '20px', marginBottom: '15px', textAlign: 'center', fontWeight: '600', color: '#333'}}>
                Filter by Category
              </div>
              <div style={styles.filterControls}>
                <button
                  style={{...styles.filterBtn, ...(analyticsFilter === 'all' ? styles.activeFilterBtn : {})}}
                  onClick={() => setAnalyticsFilter('all')}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    style={{...styles.filterBtn, ...(analyticsFilter === cat.id ? styles.activeFilterBtn : {})}}
                    onClick={() => setAnalyticsFilter(cat.id)}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>

              <div style={{marginTop: '20px', marginBottom: '15px', textAlign: 'center', fontWeight: '600', color: '#333'}}>
                View Type
              </div>
              <div style={styles.filterControls}>
                <button
                  style={{...styles.filterBtn, ...(analyticsView === 'progress' ? styles.activeFilterBtn : {})}}
                  onClick={() => setAnalyticsView('progress')}
                >
                  📊 Progress
                </button>
                <button
                  style={{...styles.filterBtn, ...(analyticsView === 'category' ? styles.activeFilterBtn : {})}}
                  onClick={() => setAnalyticsView('category')}
                >
                  📚 Categories
                </button>
                <button
                  style={{...styles.filterBtn, ...(analyticsView === 'priority' ? styles.activeFilterBtn : {})}}
                  onClick={() => setAnalyticsView('priority')}
                >
                  ⚡ Priority
                </button>
                <button
                  style={{...styles.filterBtn, ...(analyticsView === 'performance' ? styles.activeFilterBtn : {})}}
                  onClick={() => setAnalyticsView('performance')}
                >
                  🎯 Performance
                </button>
              </div>
            </div>

            {goals.length > 0 ? (
              <div style={styles.card}>
                <h3 style={styles.sectionTitle}>
                  {analyticsView === 'progress' && '📊 Progress Distribution'}
                  {analyticsView === 'category' && '📚 Category Performance'}
                  {analyticsView === 'priority' && '⚡ Goals by Priority'}
                  {analyticsView === 'performance' && '🎯 Category Performance Radar'}
                </h3>
                
                {(() => {
                  const data = getUnifiedChartData(trendPeriod, analyticsFilter, analyticsView);
                  
                  if (!data || data.length === 0) {
                    return (
                      <div style={styles.emptyState}>
                        <p>No data available for the selected filters.</p>
                      </div>
                    );
                  }

                  if (analyticsView === 'progress') {
                    return (
                      <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={120}
                              dataKey="value"
                              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  } else if (analyticsView === 'category') {
                    return (
                      <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total" fill="#4ECDC4" name="Total" radius={[0, 8, 8, 0]} />
                            <Bar dataKey="completed" fill="#4CAF50" name="Completed" radius={[0, 8, 8, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  } else if (analyticsView === 'priority') {
                    return (
                      <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="priority" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" radius={[10, 10, 0, 0]} name="Goals">
                              {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  } else if (analyticsView === 'performance') {
                    return (
                      <div style={{ height: '400px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={data}>
                            <PolarGrid stroke="#4ECDC4" />
                            <PolarAngleAxis dataKey="category" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar
                              name="Progress %"
                              dataKey="progress"
                              stroke="#4ECDC4"
                              fill="#4ECDC4"
                              fillOpacity={0.6}
                              strokeWidth={2}
                            />
                            <Tooltip />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  }
                })()}
              </div>
            ) : (
              <div style={styles.card}>
                <div style={styles.emptyState}>
                  <p>No goals to analyze yet.</p>
                  <button
                    style={{...styles.btn, ...styles.completeBtn, padding: '12px 24px'}}
                    onClick={() => setCurrentView('goals')}
                  >
                    Add Your First Goal
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={styles.modal} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Add New Goal</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Goal Title *</label>
              <input
                style={styles.input}
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                placeholder="e.g., Complete project"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                placeholder="Add details about your goal..."
              />
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  style={styles.select}
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Priority</label>
                <select
                  style={styles.select}
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                >
                  {priorities.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px'}}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Target Value</label>
                <input
                  style={styles.input}
                  type="number"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({...newGoal, targetValue: parseInt(e.target.value) || 0})}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Unit</label>
                <input
                  style={styles.input}
                  type="text"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                  placeholder="%, hours, pages"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Due Date</label>
                <input
                  style={styles.input}
                  type="date"
                  value={newGoal.dueDate}
                  onChange={(e) => setNewGoal({...newGoal, dueDate: e.target.value})}
                />
              </div>
            </div>

            <div style={styles.modalBtnGroup}>
              <button
                style={styles.primaryBtn}
                onClick={handleAddGoal}
              >
                Add Goal
              </button>
              <button
                style={styles.secondaryBtn}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingGoal && (
        <div style={styles.modal} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Edit Goal</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Goal Title *</label>
              <input
                style={styles.input}
                type="text"
                value={editingGoal.title}
                onChange={(e) => setEditingGoal({...editingGoal, title: e.target.value})}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                value={editingGoal.description}
                onChange={(e) => setEditingGoal({...editingGoal, description: e.target.value})}
              />
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  style={styles.select}
                  value={editingGoal.category}
                  onChange={(e) => setEditingGoal({...editingGoal, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Priority</label>
                <select
                  style={styles.select}
                  value={editingGoal.priority}
                  onChange={(e) => setEditingGoal({...editingGoal, priority: e.target.value})}
                >
                  {priorities.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px'}}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Target Value</label>
                <input
                  style={styles.input}
                  type="number"
                  value={editingGoal.targetValue}
                  onChange={(e) => setEditingGoal({...editingGoal, targetValue: parseInt(e.target.value) || 0})}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Unit</label>
                <input
                  style={styles.input}
                  type="text"
                  value={editingGoal.unit}
                  onChange={(e) => setEditingGoal({...editingGoal, unit: e.target.value})}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Due Date</label>
                <input
                  style={styles.input}
                  type="date"
                  value={editingGoal.dueDate}
                  onChange={(e) => setEditingGoal({...editingGoal, dueDate: e.target.value})}
                />
              </div>
            </div>

            <div style={styles.modalBtnGroup}>
              <button
                style={styles.primaryBtn}
                onClick={handleEditGoal}
              >
                Save Changes
              </button>
              <button
                style={styles.secondaryBtn}
                onClick={() => {
                  setShowEditModal(false);
                  setEditingGoal(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

export default GoalsTracker;