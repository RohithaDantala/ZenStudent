const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// ============= AUTH API =============

export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.fullName);
      localStorage.setItem('joinDate', data.user.joinDate);
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('joinDate');
  }
};

// ============= USER API =============

export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  updateProfile: async (userData) => {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_URL}/user/stats`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  }
};

// ============= MOOD API =============

export const moodAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/moods`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  create: async (moodData) => {
    const response = await fetch(`${API_URL}/moods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(moodData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/moods/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  }
};

// ============= CUSTOM MOOD API =============

export const customMoodAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/custom-moods`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  create: async (customMoodData) => {
    const response = await fetch(`${API_URL}/custom-moods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(customMoodData)
    });
    return handleResponse(response);
  }
};

// ============= GOAL API =============

export const goalAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/goals`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  create: async (goalData) => {
    const response = await fetch(`${API_URL}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(goalData)
    });
    return handleResponse(response);
  },

  update: async (id, goalData) => {
    const response = await fetch(`${API_URL}/goals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(goalData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/goals/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  }
};

// ============= EXPENSE API =============

export const expenseAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/expenses`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  create: async (expenseData) => {
    const response = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(expenseData)
    });
    return handleResponse(response);
  },

  update: async (id, expenseData) => {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(expenseData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  }
};

// ============= BUDGET API =============

export const budgetAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/budgets`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  createOrUpdate: async (budgetData) => {
    const response = await fetch(`${API_URL}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(budgetData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  }
};