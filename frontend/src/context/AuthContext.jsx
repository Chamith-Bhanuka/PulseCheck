import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // SECURITY ARCHITECTURE NOTE:
  // We explicitly store the JWT in memory (React component state) rather than in
  // localStorage or sessionStorage. Browser storage is vulnerable to JavaScript
  // extraction via Cross-Site Scripting (XSS). Keeping the short-lived token in
  // memory ensures malicious third-party scripts cannot exfiltrate persistent sessions.
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyAuth = (authToken, authUser) => {
    setToken(authToken);
    setUser(authUser);
    setAuthToken(authToken);
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
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profile = await api.auth.me();
      setUser(profile);
    } catch (err) {
      console.error('Failed refreshing profile:', err);
    }
  };

  useEffect(() => {
    // Initial load state completes immediately with clean memory state
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token,
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
