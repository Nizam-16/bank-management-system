import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bank_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('bank_token'));
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('bank_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('bank_token', res.token);
        localStorage.setItem('bank_user', JSON.stringify(res.user));
        toast.success(`Welcome back, ${res.user.name} (${res.user.role})!`);
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
      throw err;
    }
  };

  const quickDemoLogin = async (role) => {
    let email = 'admin@bank.com';
    if (role === 'TELLER') email = 'teller@bank.com';
    else if (role === 'LOAN_OFFICER') email = 'loan@bank.com';
    else if (role === 'CUSTOMER') email = 'customer@bank.com';

    return await login(email, 'password123');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bank_token');
    localStorage.removeItem('bank_user');
    toast.info('Signed out successfully.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        quickDemoLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
