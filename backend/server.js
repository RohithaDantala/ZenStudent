const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zenstudent', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));


// ============= SCHEMAS =============

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  university: { type: String, default: '' },
  major: { type: String, default: '' },
  year: { type: String, default: '' },
  bio: { type: String, default: '' },
  joinDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const moodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: Number, required: true },
  note: { type: String, default: '' },
  date: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, required: true },
  priority: { type: String, required: true },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  unit: { type: String, default: '%' },
  dueDate: { type: String, default: '' },
  createdDate: { type: String, required: true },
  completed: { type: Boolean, default: false },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, default: '' },
  isRecurring: { type: Boolean, default: false },
  recurringPeriod: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  period: { type: String, required: true },
  startDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const customMoodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emoji: { type: String, required: true },
  name: { type: String, required: true },
  value: { type: Number, required: true },
  color: { type: String, default: '#9C27B0' },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Mood = mongoose.model('Mood', moodSchema);
const Goal = mongoose.model('Goal', goalSchema);
const Expense = mongoose.model('Expense', expenseSchema);
const Budget = mongoose.model('Budget', budgetSchema);
const CustomMood = mongoose.model('CustomMood', customMoodSchema);

// ============= AUTH MIDDLEWARE =============

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.userId = user.userId;
    next();
  });
};

// ============= AUTH ROUTES =============

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      joinDate: new Date()
    });

    await user.save();
    console.log('✅ New user registered:', email);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ User logged in:', email);

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        joinDate: user.joinDate
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ============= USER ROUTES =============

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true }
    ).select('-password');

    console.log('✅ Profile updated for user:', user.email);
    res.json(user);
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/user/stats', authenticateToken, async (req, res) => {
  try {
    const [moodCount, goals, expenses] = await Promise.all([
      Mood.countDocuments({ userId: req.userId }),
      Goal.find({ userId: req.userId }),
      Expense.find({ userId: req.userId })
    ]);

    const activeGoals = goals.filter(g => !g.completed).length;
    const completedGoals = goals.filter(g => g.completed).length;
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const user = await User.findById(req.userId);
    const daysActive = Math.floor((new Date() - new Date(user.joinDate)) / (1000 * 60 * 60 * 24));

    res.json({
      moodEntries: moodCount,
      activeGoals,
      completedGoals,
      totalSpent,
      daysActive: Math.max(daysActive, 0)
    });
  } catch (error) {
    console.error('❌ Stats fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= MOOD ROUTES =============

app.get('/api/moods', authenticateToken, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.userId }).sort({ timestamp: -1 });
    res.json(moods);
  } catch (error) {
    console.error('❌ Mood fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/moods', authenticateToken, async (req, res) => {
  try {
    const mood = new Mood({
      ...req.body,
      userId: req.userId
    });
    await mood.save();
    console.log('✅ Mood entry created');
    res.status(201).json(mood);
  } catch (error) {
    console.error('❌ Mood creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/moods/:id', authenticateToken, async (req, res) => {
  try {
    await Mood.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    console.log('✅ Mood entry deleted');
    res.json({ message: 'Mood deleted' });
  } catch (error) {
    console.error('❌ Mood deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= CUSTOM MOOD ROUTES =============

app.get('/api/custom-moods', authenticateToken, async (req, res) => {
  try {
    const customMoods = await CustomMood.find({ userId: req.userId });
    res.json(customMoods);
  } catch (error) {
    console.error('❌ Custom mood fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/custom-moods', authenticateToken, async (req, res) => {
  try {
    const customMood = new CustomMood({
      ...req.body,
      userId: req.userId
    });
    await customMood.save();
    console.log('✅ Custom mood created');
    res.status(201).json(customMood);
  } catch (error) {
    console.error('❌ Custom mood creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= GOAL ROUTES =============

app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error('❌ Goal fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/goals', authenticateToken, async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      userId: req.userId
    });
    await goal.save();
    console.log('✅ Goal created:', goal.title);
    res.status(201).json(goal);
  } catch (error) {
    console.error('❌ Goal creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    console.log('✅ Goal updated:', goal.title);
    res.json(goal);
  } catch (error) {
    console.error('❌ Goal update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    console.log('✅ Goal deleted');
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('❌ Goal deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= EXPENSE ROUTES =============

app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId }).sort({ timestamp: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('❌ Expense fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      userId: req.userId
    });
    await expense.save();
    console.log('✅ Expense created:', expense.title);
    res.status(201).json(expense);
  } catch (error) {
    console.error('❌ Expense creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    console.log('✅ Expense updated:', expense.title);
    res.json(expense);
  } catch (error) {
    console.error('❌ Expense update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    console.log('✅ Expense deleted');
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('❌ Expense deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= BUDGET ROUTES =============

app.get('/api/budgets', authenticateToken, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.userId });
    res.json(budgets);
  } catch (error) {
    console.error('❌ Budget fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/budgets', authenticateToken, async (req, res) => {
  try {
    const existingBudget = await Budget.findOne({
      userId: req.userId,
      category: req.body.category
    });

    if (existingBudget) {
      const updated = await Budget.findByIdAndUpdate(
        existingBudget._id,
        req.body,
        { new: true }
      );
      console.log('✅ Budget updated:', updated.category);
      res.json(updated);
    } else {
      const budget = new Budget({
        ...req.body,
        userId: req.userId
      });
      await budget.save();
      console.log('✅ Budget created:', budget.category);
      res.status(201).json(budget);
    }
  } catch (error) {
    console.error('❌ Budget creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/budgets/:id', authenticateToken, async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    console.log('✅ Budget deleted');
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    console.error('❌ Budget deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= START SERVER =============

const PORT = process.env.PORT || 5000;

// Root route to test Render deployment
app.get("/", (req, res) => {
  res.send("✅ ZenStudent Backend is running successfully!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
