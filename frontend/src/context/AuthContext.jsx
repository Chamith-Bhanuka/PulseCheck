import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getAuthToken());
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('pulsecheck_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const applyAuth = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    setAuthToken(authToken);
    if (authUser) {
      localStorage.setItem('pulsecheck_user', JSON.stringify(authUser));
    }
  };

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    applyAuth(res.token, res.user);
    return res.user;
  };

  const register = async (email, password) => {
    const res = await api.auth.register(email, password);
    applyAuth(res.token, res.user);
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('pulsecheck_user');
    localStorage.removeItem('pulsecheck_view');
    localStorage.removeItem('pulsecheck_selected_monitor');
  };

  const refreshProfile = async () => {
    const activeToken = getAuthToken();
    if (!activeToken) return;
    try {
      const profile = await api.auth.me();
      setUser(profile);
      localStorage.setItem('pulsecheck_user', JSON.stringify(profile));
    } catch (err) {
      console.error('Failed refreshing profile:', err);
      if (err.status === 401 || err.status === 403) {
        logout();
      }
    }
  };

  // Re-verify session on browser reload
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getAuthToken();
      if (savedToken) {
        try {
          const profile = await api.auth.me();
          setUser(profile);
          localStorage.setItem('pulsecheck_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Session verification failed on refresh:', err);
          if (err.status === 401 || err.status === 403) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
