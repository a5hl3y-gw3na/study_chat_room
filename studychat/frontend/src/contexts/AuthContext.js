import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost/studychat/php';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('studychat_token'));

  // Set up axios interceptor for authentication
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('studychat_token');
      const savedUser = localStorage.getItem('studychat_user');
      
      if (savedToken && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(userData);
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          localStorage.removeItem('studychat_token');
          localStorage.removeItem('studychat_user');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      
      const response = await axios.post('/login.php', {
        username,
        password
      });

      if (response.data.success) {
        const { user: userData, token: userToken } = response.data;
        
        // Save to localStorage
        localStorage.setItem('studychat_token', userToken);
        localStorage.setItem('studychat_user', JSON.stringify(userData));
        
        // Update state
        setToken(userToken);
        setUser(userData);
        
        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        
        toast.success('Login successful!');
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      setLoading(true);
      
      const response = await axios.post('/register.php', {
        username,
        email,
        password
      });

      if (response.data.success) {
        const { user: userData, token: userToken } = response.data;
        
        // Save to localStorage
        localStorage.setItem('studychat_token', userToken);
        localStorage.setItem('studychat_user', JSON.stringify(userData));
        
        // Update state
        setToken(userToken);
        setUser(userData);
        
        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        
        toast.success('Registration successful!');
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('studychat_token');
    localStorage.removeItem('studychat_user');
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Remove axios header
    delete axios.defaults.headers.common['Authorization'];
    
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
