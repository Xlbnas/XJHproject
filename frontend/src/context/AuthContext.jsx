import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('smartorder_token');
    if (token) {
      fetchUserInfo(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get('http://localhost:964/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      localStorage.removeItem('smartorder_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone, password) => {
    try {
      const response = await axios.post('http://localhost:964/api/auth/login', {
        phone,
        password
      });
      const { user, token } = response.data;
      localStorage.setItem('smartorder_token', token);
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (phone, password, nickname) => {
    try {
      const response = await axios.post('http://localhost:964/api/auth/register', {
        phone,
        password,
        nickname
      });
      const { user, token } = response.data;
      localStorage.setItem('smartorder_token', token);
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Register failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('smartorder_token');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;