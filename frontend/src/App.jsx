import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignup from "./LoginSignup";
import ZenStudentDashboard from "./Dashboard"; 
import MoodTracker from "./Mood"; 
import GoalTracker from "./Goals";
import BudgetTracker from "./Budget";
import ProfilePage from "./Profile";  // ✅ Add this import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/dashboard" element={<ZenStudentDashboard />} />
        <Route path="/mood" element={<MoodTracker />} />
        <Route path="/goals" element={<GoalTracker />} />
        <Route path="/budget" element={<BudgetTracker />} />
        <Route path="/profile" element={<ProfilePage />} />  {/* ✅ Add this route */}
      </Routes>
    </Router>
  );
}

export default App;