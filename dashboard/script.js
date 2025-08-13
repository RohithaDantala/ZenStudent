function openMoodTracker() {
    alert('Mood tracker feature coming soon! 😊\n\nThis will allow you to:\n• Log daily mood\n• Track emotional patterns\n• View mood analytics');
}

function openGoalTracker() {
    alert('Goal tracker feature coming soon! 🎯\n\nThis will allow you to:\n• Set SMART goals\n• Track progress\n• Celebrate achievements');
}

function openBudgetTracker() {
    alert('Budget tracker feature coming soon! 💰\n\nThis will allow you to:\n• Track expenses\n• Set budget limits\n• View spending analytics');
}

function updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    const welcomeTitle = document.querySelector('.welcome-title');
    
    let greeting = 'Welcome back';
    if (hour < 12) {
        greeting = 'Good morning';
    } else if (hour < 17) {
        greeting = 'Good afternoon';
    } else {
        greeting = 'Good evening';
    }
    
    welcomeTitle.textContent = `${greeting}, User!`;
}

document.addEventListener('DOMContentLoaded', function() {
    updateGreeting();

    document.getElementById('mood-btn').addEventListener('click', openMoodTracker);
    document.getElementById('goals-btn').addEventListener('click', openGoalTracker);
    document.getElementById('budget-btn').addEventListener('click', openBudgetTracker);
});
