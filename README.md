# 🧘 ZenStudent

**Track, Plan, Thrive — the Zen Way**

A comprehensive student wellness and productivity platform that helps students manage their mental health, academic goals, and finances all in one place.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://zenstudent.vercel.app/)
[![Backend](https://img.shields.io/badge/backend-render-blue)](https://zenstudent-1rpf.onrender.com)


## 🌟 Features

### 😊 Mood Tracker
- **Daily Mood Logging**: Track your emotional wellbeing with intuitive emoji-based mood selection
- **Custom Moods**: Create personalized mood entries with custom emojis and intensity levels
- **Calendar View**: Visual calendar showing mood patterns at a glance
- **Advanced Analytics**: 
  - Mood distribution charts
  - Weekly/monthly/yearly trend analysis
  - Streak tracking for consistent logging
  - AI-powered motivational quotes based on mood patterns
- **Insights & Suggestions**: Personalized wellness tips and trend analysis

### 🎯 Goal Tracker
- **Comprehensive Goal Management**: Set and track academic, fitness, personal, career, financial, and social goals
- **Progress Visualization**: Interactive progress bars with drag-to-update functionality
- **Priority Levels**: Organize goals by urgency (Low, Medium, High, Urgent)
- **Calendar Integration**: View goals on a monthly calendar with visual indicators
- **Analytics Dashboard**:
  - Progress distribution (Completed, In Progress, Not Started)
  - Category performance charts
  - Priority-based goal analysis
  - Radar chart showing performance across categories
- **Due Date Alerts**: Automatic overdue goal notifications

### 💰 Budget Tracker
- **Expense Management**: Log and categorize all your expenses
- **Budget Limits**: Set category-specific budgets with period tracking (weekly/monthly/yearly)
- **Visual Analytics**:
  - Pie charts for category spending
  - Monthly spending trends
  - Budget vs. actual spending comparisons
- **Calendar View**: See expenses organized by date
- **Smart Insights**: Automatic alerts when nearing or exceeding budget limits
- **Recurring Expenses**: Track subscription and regular payments

### 👤 User Profile
- **Personal Information Management**: Update name, email, phone, university details
- **Academic Profile**: Track major, year, and bio
- **Statistics Dashboard**: View comprehensive stats across all features
- **Account Settings**: Password management and account controls

## 🚀 Technology Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Recharts** - Data visualization library
- **Lucide React** - Icon library
- **Vanilla CSS** - Custom styling
- **Deployed on Vercel** ⚡

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Deployed on Render** 🔵

## 🌐 Live Demo

- **Frontend**: [https://zenstudent.vercel.app/](https://zenstudent.vercel.app/)
- **Backend API**: [https://zenstudent-1rpf.onrender.com](https://zenstudent-1rpf.onrender.com)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/zenstudent.git
cd zenstudent
```

2. Install backend dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

4. Start the backend server:
```bash
node server.js
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory (or use the same directory if combined):
```bash
cd frontend  # if separate
```

2. Install frontend dependencies:
```bash
npm install
```

3. Update the API URL in `api.js`:
```javascript
const API_URL = 'http://localhost:5000/api';  // For local development
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or your configured port)

## 🗂️ Project Structure

```
zenstudent/
├── server.js                 # Backend server and API routes
├── package.json              # Backend dependencies
├── .env                      # Environment variables (not in repo)
├── src/
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles
│   ├── api.js               # API client functions
│   ├── LoginSignup.jsx      # Authentication page
│   ├── Dashboard.jsx        # Main dashboard
│   ├── Mood.jsx             # Mood tracker component
│   ├── Goals.jsx            # Goals tracker component
│   ├── Budget.jsx           # Budget tracker component
│   ├── Profile.jsx          # User profile component
│   └── assets/
│       ├── logo.png         # App logo
│       └── profileIcon.png  # Profile icon
└── README.md                # Project documentation
```

## 🔐 Authentication

ZenStudent uses JWT (JSON Web Tokens) for secure authentication:
- Tokens are stored in localStorage
- All protected routes require authentication
- Tokens expire after 7 days
- Password hashing using bcryptjs

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/stats` - Get user statistics

### Mood
- `GET /api/moods` - Get all mood entries
- `POST /api/moods` - Create mood entry
- `DELETE /api/moods/:id` - Delete mood entry
- `GET /api/custom-moods` - Get custom moods
- `POST /api/custom-moods` - Create custom mood

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Budget
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create/update budget
- `DELETE /api/budgets/:id` - Delete budget

## 🎨 Design Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Intuitive UI**: Clean, modern interface with smooth animations
- **Color-Coded Categories**: Visual organization across all features
- **Interactive Charts**: Real-time data visualization
- **Notification System**: Toast notifications for user feedback
- **Modal Dialogs**: Contextual information and editing capabilities

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- CORS configuration
- Input validation
- XSS protection

## 🌱 Future Enhancements

- [ ] Email notifications for goal deadlines
- [ ] Social sharing features
- [ ] Export data to CSV/PDF
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Integration with calendar apps
- [ ] AI-powered mood predictions
- [ ] Collaborative goals
- [ ] Spending recommendations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.



## 🙏 Acknowledgments

- Icons by [Lucide React](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- Emoji support from Unicode Standard

---

**Made with ❤️ for students, by students**