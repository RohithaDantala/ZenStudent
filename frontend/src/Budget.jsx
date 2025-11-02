import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import logo from './assets/logo.png';
import profileIcon from './assets/profileIcon.png';
import { expenseAPI, budgetAPI } from './api';

const BudgetTracker = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('overview');
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('month');
  const [showRecurring, setShowRecurring] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [analyticsView, setAnalyticsView] = useState('category');
  const [analyticsFilter, setAnalyticsFilter] = useState('all');

  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isRecurring: false,
    recurringPeriod: 'monthly'
  });

  const [newBudget, setNewBudget] = useState({
    category: 'food',
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0]
  });

  const categories = [
    { id: 'food', name: 'Food & Dining', icon: '🍕', color: '#FF6B6B' },
    { id: 'transport', name: 'Transportation', icon: '🚌', color: '#4ECDC4' },
    { id: 'education', name: 'Education', icon: '📚', color: '#45B7D1' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#96CEB4' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#FFEAA7' },
    { id: 'health', name: 'Health & Fitness', icon: '💊', color: '#DDA0DD' },
    { id: 'utilities', name: 'Utilities', icon: '💡', color: '#98D8C8' },
    { id: 'rent', name: 'Rent & Housing', icon: '🏠', color: '#F8B500' },
    { id: 'other', name: 'Other', icon: '📦', color: '#95A5A6' }
  ];

useEffect(() => {
  const fetchData = async () => {
    try {
      const [fetchedExpenses, fetchedBudgets] = await Promise.all([
        expenseAPI.getAll(),
        budgetAPI.getAll()
      ]);
      
      setExpenses(fetchedExpenses);
      setBudgets(fetchedBudgets);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showNotification('Failed to load data', 'error');
    }
  };
  
  fetchData();
}, []);
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.title.trim() || !newExpense.amount) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    const expense = {
      ...newExpense,
      id: Date.now(),
      amount: parseFloat(newExpense.amount),
      timestamp: new Date().toLocaleString()
    };

    const updatedExpenses = [expense, ...expenses];
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    
    setNewExpense({
      title: '',
      amount: '',
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      description: '',
      isRecurring: false,
      recurringPeriod: 'monthly'
    });

    showNotification('Expense added successfully! 💰');
    setShowAddModal(false);
  };

  const handleEditExpense = (e) => {
    e.preventDefault();
    if (!editingExpense.title.trim() || !editingExpense.amount) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    const updatedExpenses = expenses.map(exp => 
      exp.id === editingExpense.id ? {...editingExpense, amount: parseFloat(editingExpense.amount)} : exp
    );
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    
    showNotification('Expense updated successfully!');
    setShowEditModal(false);
    setEditingExpense(null);
  };

const handleAddBudget = async (e) => {
  e.preventDefault();
  if (!newBudget.amount) {
    showNotification('Please enter a budget amount', 'error');
    return;
  }

  try {
    const budget = await budgetAPI.createOrUpdate({
      ...newBudget,
      amount: parseFloat(newBudget.amount)
    });

    const existingIndex = budgets.findIndex(b => b.category === budget.category);
    let updatedBudgets;
    
    if (existingIndex >= 0) {
      updatedBudgets = budgets.map(b => 
        b.category === budget.category ? budget : b
      );
      showNotification('Budget updated successfully!');
    } else {
      updatedBudgets = [...budgets, budget];
      showNotification('Budget created successfully!');
    }

    setBudgets(updatedBudgets);

    setNewBudget({
      category: 'food',
      amount: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Failed to save budget:', error);
    showNotification(error.message || 'Failed to save budget', 'error');
  }
};

const deleteExpense = async (expenseId) => {
  try {
    await expenseAPI.delete(expenseId);
    const updatedExpenses = expenses.filter(expense => expense._id !== expenseId);
    setExpenses(updatedExpenses);
    showNotification('Expense deleted');
  } catch (error) {
    console.error('Failed to delete expense:', error);
    showNotification('Failed to delete expense', 'error');
  }
};
const deleteBudget = async (budgetId) => {
  try {
    await budgetAPI.delete(budgetId);
    const updatedBudgets = budgets.filter(budget => budget._id !== budgetId);
    setBudgets(updatedBudgets);
    showNotification('Budget deleted');
  } catch (error) {
    console.error('Failed to delete budget:', error);
    showNotification('Failed to delete budget', 'error');
  }
};

  const getFilteredExpenses = () => {
    let filtered = expenses.filter(expense => {
      if (selectedCategory !== 'all' && expense.category !== selectedCategory) return false;
      if (!showRecurring && expense.isRecurring) return false;
      
      const expenseDate = new Date(expense.date);
      const now = new Date();
      
      switch (dateFilter) {
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return expenseDate >= weekAgo;
        case 'month':
          return expenseDate.getMonth() === now.getMonth() && 
                 expenseDate.getFullYear() === now.getFullYear();
        case 'year':
          return expenseDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getTotalExpenses = () => {
    return getFilteredExpenses().reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getCategoryExpenses = () => {
    const categoryTotals = {};
    getFilteredExpenses().forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    return categories.map(category => ({
      ...category,
      amount: categoryTotals[category.id] || 0
    })).filter(category => category.amount > 0);
  };

  const getBudgetStatus = () => {
    const categoryExpenses = {};
    getFilteredExpenses().forEach(expense => {
      categoryExpenses[expense.category] = (categoryExpenses[expense.category] || 0) + expense.amount;
    });

    return budgets.map(budget => {
      const spent = categoryExpenses[budget.category] || 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const remaining = Math.max(budget.amount - spent, 0);
      const category = categories.find(c => c.id === budget.category);
      
      return {
        ...budget,
        category: category,
        spent,
        percentage,
        remaining,
        isOverBudget: spent > budget.amount
      };
    });
  };

  const getMonthlyTrend = () => {
    const monthlyData = {};
    expenses.forEach(expense => {
      const monthKey = new Date(expense.date).toISOString().slice(0, 7);
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + expense.amount;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        amount: Math.round(amount * 100) / 100
      }));
  };

  const getInsights = () => {
    const insights = [];
    const budgetStatus = getBudgetStatus();
    
    budgetStatus.forEach(budget => {
      if (budget.isOverBudget) {
        insights.push({
          type: 'warning',
          message: `You're over budget in ${budget.category.name} by $${Math.abs(budget.remaining).toFixed(2)}`
        });
      } else if (budget.percentage > 80) {
        insights.push({
          type: 'caution',
          message: `You've used ${Math.round(budget.percentage)}% of your ${budget.category.name} budget`
        });
      }
    });

    const categoryExpenses = getCategoryExpenses();
    if (categoryExpenses.length > 0) {
      const topCategory = categoryExpenses.reduce((max, cat) => cat.amount > max.amount ? cat : max);
      insights.push({
        type: 'info',
        message: `Your highest spending category this period is ${topCategory.name} ($${topCategory.amount.toFixed(2)})`
      });
    }

    return insights;
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

  const getExpensesForDate = (dateStr) => {
    return expenses.filter(expense => expense.date === dateStr);
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

  const getAnalyticsData = () => {
    let filteredExpenses = expenses;
    
    if (analyticsFilter !== 'all') {
      filteredExpenses = expenses.filter(e => e.category === analyticsFilter);
    }

    if (analyticsView === 'category') {
      const categoryTotals = {};
      filteredExpenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });
      
      return categories.map(category => ({
        ...category,
        amount: categoryTotals[category.id] || 0
      })).filter(category => category.amount > 0);
    } else if (analyticsView === 'trend') {
      const monthlyData = {};
      filteredExpenses.forEach(expense => {
        const monthKey = new Date(expense.date).toISOString().slice(0, 7);
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + expense.amount;
      });

      return Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, amount]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          amount: Math.round(amount * 100) / 100
        }));
    } else if (analyticsView === 'budget') {
      const budgetPerformance = getBudgetStatus();
      if (analyticsFilter !== 'all') {
        return budgetPerformance.filter(b => b.category.id === analyticsFilter);
      }
      return budgetPerformance;
    }
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
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
      boxSizing: 'border-box'
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
    budgetCard: {
      border: '1px solid #eee',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '15px',
      background: 'white'
    },
    budgetHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    budgetTitle: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#333'
    },
    budgetAmount: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#4ECDC4'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#f0f0f0',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '10px'
    },
    progressFill: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 0.3s ease'
    },
    budgetStats: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#666'
    },
    insightCard: {
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    warningInsight: {
      background: '#fff3cd',
      border: '1px solid #ffeaa7',
      color: '#856404'
    },
    cautionInsight: {
      background: '#d4edda',
      border: '1px solid #c3e6cb',
      color: '#155724'
    },
    infoInsight: {
      background: '#d1ecf1',
      border: '1px solid #bee5eb',
      color: '#0c5460'
    },
    calendar: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px'
    },
    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    calendarTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#333'
    },
    navBtn: {
      padding: '8px 16px',
      background: '#4ECDC4',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px'
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
    dayNumber: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '4px'
    },
    dayAmount: {
      fontSize: '11px',
      color: '#4ECDC4',
      fontWeight: 'bold'
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
    modalBtnGroup: {
      display: 'flex',
      gap: '10px',
      marginTop: '25px'
    },
    expenseItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '15px',
      border: '1px solid #eee',
      borderRadius: '8px',
      marginBottom: '10px',
      background: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    expenseIcon: {
      fontSize: '24px',
      marginRight: '15px',
      width: '40px',
      textAlign: 'center'
    },
    expenseContent: {
      flex: 1
    },
    expenseTitle: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '4px'
    },
    expenseDetails: {
      fontSize: '12px',
      color: '#666'
    },
    expenseAmount: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      marginRight: '15px'
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
            <span style={{...styles.navLink, ...styles.activeNavLink}}>
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
        <h1 style={styles.pageTitle}>Budget Tracker</h1>
        <p style={styles.pageSubtitle}>Manage your finances and track spending to achieve your financial goals</p>

        <div style={styles.viewToggle}>
          <button
            style={{
              ...styles.toggleBtn,
              ...(currentView === 'overview' ? styles.activeToggleBtn : {})
            }}
            onClick={() => setCurrentView('overview')}
          >
            Overview
          </button>
          <button
            style={{
              ...styles.toggleBtn,
              ...(currentView === 'expenses' ? styles.activeToggleBtn : {})
            }}
            onClick={() => setCurrentView('expenses')}
          >
            Expenses
          </button>
          <button
            style={{
              ...styles.toggleBtn,
              ...(currentView === 'manage' ? styles.activeToggleBtn : {})
            }}
            onClick={() => setCurrentView('manage')}
          >
            Manage Budget
          </button>
          <button
            style={{
              ...styles.toggleBtn,
              ...(currentView === 'analytics' ? styles.activeToggleBtn : {})
            }}
            onClick={() => setCurrentView('analytics')}
          >
            Analytics
          </button>
        </div>

        {/* Overview View */}
        {currentView === 'overview' && (
          <div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>${getTotalExpenses().toFixed(2)}</div>
                <div style={styles.statLabel}>Total Spent This Month</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{expenses.length}</div>
                <div style={styles.statLabel}>Total Transactions</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>
                  ${expenses.length > 0 ? (getTotalExpenses() / expenses.length).toFixed(2) : '0.00'}
                </div>
                <div style={styles.statLabel}>Average Transaction</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{budgets.length}</div>
                <div style={styles.statLabel}>Active Budgets</div>
              </div>
            </div>

            {(() => {
              const insights = getInsights();
              return insights.length > 0 && (
                <div style={styles.card}>
                  <h3 style={{ marginBottom: '20px', color: '#333' }}>Insights & Alerts</h3>
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      style={{
                        ...styles.insightCard,
                        ...(insight.type === 'warning' ? styles.warningInsight :
                           insight.type === 'caution' ? styles.cautionInsight : styles.infoInsight)
                      }}
                    >
                      <span>
                        {insight.type === 'warning' ? '⚠️' :
                         insight.type === 'caution' ? '💡' : 'ℹ️'}
                      </span>
                      <span>{insight.message}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {budgets.length > 0 && (
              <div style={styles.card}>
                <h3 style={{ marginBottom: '20px', color: '#333' }}>Budget Status</h3>
                {getBudgetStatus().map((budget) => (
                  <div key={budget.id} style={styles.budgetCard}>
                    <div style={styles.budgetHeader}>
                      <div style={styles.budgetTitle}>
                        {budget.category.icon} {budget.category.name}
                      </div>
                      <div style={styles.budgetAmount}>
                        ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                      </div>
                    </div>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${Math.min(budget.percentage, 100)}%`,
                          backgroundColor: budget.isOverBudget ? '#f44336' : 
                                         budget.percentage > 80 ? '#ff9800' : '#4ECDC4'
                        }}
                      />
                    </div>
                    <div style={styles.budgetStats}>
                      <span>{Math.round(budget.percentage)}% used</span>
                      <span style={{ 
                        color: budget.isOverBudget ? '#f44336' : '#4ECDC4' 
                      }}>
                        {budget.isOverBudget ? 
                          `${Math.abs(budget.remaining).toFixed(2)} over budget` :
                          `${budget.remaining.toFixed(2)} remaining`
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Expenses Calendar View */}
        {currentView === 'expenses' && (
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
                    const dayExpenses = getExpensesForDate(dateStr);
                    const totalAmount = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    
                    days.push(
                      <div
                        key={day}
                        style={{
                          ...styles.calendarDay,
                          background: isToday ? '#e0f9f7' : (dayExpenses.length > 0 ? '#f8f9fa' : 'white'),
                          border: isToday ? '2px solid #4ECDC4' : '1px solid #f0f0f0'
                        }}
                        onClick={() => handleDateClick(day)}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#f0fdfc';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = isToday ? '#e0f9f7' : (dayExpenses.length > 0 ? '#f8f9fa' : 'white');
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <div style={styles.dayNumber}>{day}</div>
                        {totalAmount > 0 && (
                          <div style={styles.dayAmount}>${totalAmount.toFixed(0)}</div>
                        )}
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
            </div>

            <button
              style={styles.addButton}
              onClick={() => {
                setNewExpense({
                  ...newExpense,
                  date: new Date().toISOString().split('T')[0]
                });
                setShowAddModal(true);
              }}
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

        {/* Manage Budget View */}
        {currentView === 'manage' && (
          <div>
            <div style={styles.card}>
              <h2 style={{ marginBottom: '20px', color: '#333' }}>Set Budget Limits</h2>
              
              <form onSubmit={handleAddBudget}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Category</label>
                    <select
                      style={styles.select}
                      value={newBudget.category}
                      onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Budget Amount</label>
                    <input
                      style={styles.input}
                      type="number"
                      step="0.01"
                      value={newBudget.amount}
                      onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Period</label>
                    <select
                      style={styles.select}
                      value={newBudget.period}
                      onChange={(e) => setNewBudget({...newBudget, period: e.target.value})}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Start Date</label>
                    <input
                      style={styles.input}
                      type="date"
                      value={newBudget.startDate}
                      onChange={(e) => setNewBudget({...newBudget, startDate: e.target.value})}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button
                    type="submit"
                    style={{...styles.btn, ...styles.primaryBtn}}
                  >
                    {budgets.find(b => b.category === newBudget.category) ? 'Update Budget' : 'Create Budget'}
                  </button>
                </div>
              </form>
            </div>

            <div style={styles.card}>
              <h3 style={{ marginBottom: '20px', color: '#333' }}>Current Budgets</h3>
              {budgets.length > 0 ? (
                getBudgetStatus().map((budget) => (
                  <div key={budget.id} style={styles.budgetCard}>
                    <div style={styles.budgetHeader}>
                      <div style={styles.budgetTitle}>
                        {budget.category.icon} {budget.category.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={styles.budgetAmount}>
                          ${budget.amount.toFixed(2)}/{budget.period}
                        </div>
                        <button
                          style={{...styles.btn, ...styles.dangerBtn, padding: '5px 10px', fontSize: '12px'}}
                          onClick={() => deleteBudget(budget.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${Math.min(budget.percentage, 100)}%`,
                          backgroundColor: budget.isOverBudget ? '#f44336' : 
                                         budget.percentage > 80 ? '#ff9800' : '#4ECDC4'
                        }}
                      />
                    </div>
                    <div style={styles.budgetStats}>
                      <span>Spent: ${budget.spent.toFixed(2)} ({Math.round(budget.percentage)}%)</span>
                      <span style={{ 
                        color: budget.isOverBudget ? '#f44336' : '#4ECDC4' 
                      }}>
                        {budget.isOverBudget ? 
                          `${Math.abs(budget.remaining).toFixed(2)} over budget` :
                          `${budget.remaining.toFixed(2)} remaining`
                        }
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>No budgets set yet. Create your first budget above!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics View */}
        {currentView === 'analytics' && (
          <div>
            <div style={styles.card}>
              <div style={{marginBottom: '15px', textAlign: 'center', fontWeight: '600', color: '#333'}}>
                Chart Type
              </div>
              <div style={styles.filterControls}>
                <button
                  style={{...styles.filterBtn, ...(analyticsView === 'category' ? styles.activeFilterBtn : {})}}
                  onClick={() => setAnalyticsView('category')}
                >
                  📊 By Category
                </button>
                <button
                  style={{...styles.filterBtn, ...(analyticsView === 'trend' ? styles.activeFilterBtn : {})}}
                  onClick={() => setAnalyticsView('trend')}
                >
                  📈 Monthly Trend
                </button>
                <button
                  style={{...styles.filterBtn, ...(analyticsView === 'budget' ? styles.activeFilterBtn : {})}}
                  onClick={() => setAnalyticsView('budget')}
                >
                  🎯 Budget Performance
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
            </div>

            {expenses.length > 0 ? (
              <div style={styles.card}>
                <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
                  {analyticsView === 'category' && '📊 Spending by Category'}
                  {analyticsView === 'trend' && '📈 Monthly Spending Trend'}
                  {analyticsView === 'budget' && '🎯 Budget Performance'}
                </h3>
                
                {(() => {
                  const data = getAnalyticsData();
                  
                  if (!data || data.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <p>No data available for the selected filters.</p>
                      </div>
                    );
                  }

                  if (analyticsView === 'category') {
                    return (
                      <div style={{ height: '400px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data}
                              cx="50%"
                              cy="50%"
                              outerRadius={120}
                              dataKey="amount"
                              label={({ name, value }) => `${name}: ${value.toFixed(2)}`}
                            >
                              {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value.toFixed(2)}`, 'Amount']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  } else if (analyticsView === 'trend') {
                    return (
                      <div style={{ height: '400px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value.toFixed(2)}`, 'Amount']} />
                            <Line 
                              type="monotone" 
                              dataKey="amount" 
                              stroke="#4ECDC4" 
                              strokeWidth={3}
                              dot={{ fill: '#4ECDC4', strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  } else if (analyticsView === 'budget') {
                    return (
                      <div style={{ height: '400px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category.name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value.toFixed(2)}`, 'Amount']} />
                            <Bar dataKey="spent" fill="#FF9800" name="Spent" />
                            <Bar dataKey="amount" fill="#4ECDC4" name="Budget" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  }
                })()}
              </div>
            ) : (
              <div style={styles.card}>
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>No expense data available for analytics.</p>
                  <button
                    style={{...styles.btn, ...styles.primaryBtn}}
                    onClick={() => setCurrentView('expenses')}
                  >
                    Add Your First Expense
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Date Modal - Shows expenses for selected date */}
      {showDateModal && selectedDate && (
        <div style={styles.modal} onClick={() => setShowDateModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
            
            {(() => {
              const dayExpenses = getExpensesForDate(selectedDate);
              
              if (dayExpenses.length > 0) {
                return (
                  <>
                    <h4 style={{ color: '#333', marginBottom: '15px' }}>
                      Expenses ({dayExpenses.length})
                    </h4>
                    {dayExpenses.map(expense => {
                      const category = categories.find(c => c.id === expense.category);
                      return (
                        <div 
                          key={expense.id} 
                          style={styles.expenseItem}
                          onClick={() => {
                            setEditingExpense({...expense});
                            setShowEditModal(true);
                            setShowDateModal(false);
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f0fdfc';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white';
                          }}
                        >
                          <span style={styles.expenseIcon}>{category?.icon}</span>
                          <div style={styles.expenseContent}>
                            <div style={styles.expenseTitle}>{expense.title}</div>
                            <div style={styles.expenseDetails}>
                              {category?.name}
                              {expense.description && ` • ${expense.description}`}
                            </div>
                          </div>
                          <div style={styles.expenseAmount}>${expense.amount.toFixed(2)}</div>
                        </div>
                      );
                    })}
                    <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                      <strong style={{ color: '#4ECDC4', fontSize: '18px' }}>
                        Total: ${dayExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                      </strong>
                    </div>
                  </>
                );
              } else {
                return (
                  <p style={{ textAlign: 'center', color: '#666', margin: '20px 0' }}>
                    No expenses for this day yet.
                  </p>
                );
              }
            })()}
            
            <div style={styles.modalBtnGroup}>
              <button
                style={{...styles.btn, ...styles.primaryBtn, flex: 1}}
                onClick={() => {
                  setNewExpense({...newExpense, date: selectedDate});
                  setShowDateModal(false);
                  setShowAddModal(true);
                }}
              >
                + Add Expense
              </button>
              <button
                style={{...styles.btn, ...styles.secondaryBtn, flex: 1}}
                onClick={() => setShowDateModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div style={styles.modal} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add New Expense</h2>
            
            <form onSubmit={handleAddExpense}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Title *</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                    placeholder="e.g., Lunch at cafe"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Amount *</label>
                  <input
                    style={styles.input}
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category</label>
                  <select
                    style={styles.select}
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Date</label>
                  <input
                    style={styles.input}
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description (Optional)</label>
                <textarea
                  style={styles.textarea}
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="Additional details about this expense..."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newExpense.isRecurring}
                  onChange={(e) => setNewExpense({...newExpense, isRecurring: e.target.checked})}
                />
                <label htmlFor="recurring" style={styles.label}>This is a recurring expense</label>
              </div>

              {newExpense.isRecurring && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Recurring Period</label>
                  <select
                    style={styles.select}
                    value={newExpense.recurringPeriod}
                    onChange={(e) => setNewExpense({...newExpense, recurringPeriod: e.target.value})}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}

              <div style={styles.modalBtnGroup}>
                <button
                  type="submit"
                  style={{...styles.btn, ...styles.primaryBtn, flex: 1}}
                >
                  Add Expense
                </button>
                <button
                  type="button"
                  style={{...styles.btn, ...styles.secondaryBtn, flex: 1}}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditModal && editingExpense && (
        <div style={styles.modal} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Edit Expense</h2>
            
            <form onSubmit={handleEditExpense}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Title *</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={editingExpense.title}
                    onChange={(e) => setEditingExpense({...editingExpense, title: e.target.value})}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Amount *</label>
                  <input
                    style={styles.input}
                    type="number"
                    step="0.01"
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({...editingExpense, amount: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category</label>
                  <select
                    style={styles.select}
                    value={editingExpense.category}
                    onChange={(e) => setEditingExpense({...editingExpense, category: e.target.value})}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Date</label>
                  <input
                    style={styles.input}
                    type="date"
                    value={editingExpense.date}
                    onChange={(e) => setEditingExpense({...editingExpense, date: e.target.value})}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description (Optional)</label>
                <textarea
                  style={styles.textarea}
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({...editingExpense, description: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="editRecurring"
                  checked={editingExpense.isRecurring}
                  onChange={(e) => setEditingExpense({...editingExpense, isRecurring: e.target.checked})}
                />
                <label htmlFor="editRecurring" style={styles.label}>This is a recurring expense</label>
              </div>

              {editingExpense.isRecurring && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Recurring Period</label>
                  <select
                    style={styles.select}
                    value={editingExpense.recurringPeriod}
                    onChange={(e) => setEditingExpense({...editingExpense, recurringPeriod: e.target.value})}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}

              <div style={styles.modalBtnGroup}>
                <button
                  type="submit"
                  style={{...styles.btn, ...styles.primaryBtn, flex: 1}}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  style={{...styles.btn, ...styles.dangerBtn}}
                  onClick={() => {
                    if (window.confirm('Delete this expense?')) {
                      deleteExpense(editingExpense.id);
                      setShowEditModal(false);
                      setEditingExpense(null);
                    }
                  }}
                >
                  Delete
                </button>
                <button
                  type="button"
                  style={{...styles.btn, ...styles.secondaryBtn, flex: 1}}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingExpense(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default BudgetTracker;