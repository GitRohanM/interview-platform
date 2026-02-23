// frontend/src/context/AuthContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // True on first load

  // Check if user is already logged in (has valid token)
  useEffect(() => {
    const checkAuth = async () => {
      const token = authAPI.getToken();
      if (token) {
        try {
          const data = await authAPI.getMe();
          setUser(data.user);
        } catch {
          authAPI.setToken(null);
        }
      }
      setLoading(false);
    };
    checkAuth();

    // Listen for forced logout events (token expired)
    const handleLogout = () => { setUser(null); };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authAPI.login({ email, password });
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await authAPI.register(formData);
    authAPI.setToken(data.accessToken);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
