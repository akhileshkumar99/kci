import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('kci_user');
      return u ? JSON.parse(u) : null;
    } catch {
      localStorage.removeItem('kci_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password, role) => {
    // Retry until server responds (handles Render cold start)
    while (true) {
      try {
        const { data } = await api.post('/auth/login', { email, password, role });
        localStorage.setItem('kci_token', data.token);
        localStorage.setItem('kci_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      } catch (err) {
        const status = err.response?.status;
        // If server error or no response (cold start) — wait and retry silently
        if (!err.response || status === 502 || status === 503 || status === 504) {
          await new Promise(r => setTimeout(r, 4000));
          continue;
        }
        // Real error (wrong password etc) — throw immediately
        throw err;
      }
    }
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('kci_token', data.token);
    localStorage.setItem('kci_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('kci_token');
    localStorage.removeItem('kci_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('kci_user', JSON.stringify(data.user));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
