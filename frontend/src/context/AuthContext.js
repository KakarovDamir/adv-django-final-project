// src/context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async ({ username, password }) => {
    // 👇 ОБЯЗАТЕЛЬНО: получаем CSRF cookie перед логином
    await axios.get('social_network/get_csrf/');

    const response = await axios.post('social_network/auth/login/', {
      username,
      password,
    });

    setUser(response.data.user);
  };

  const logout = async () => {
    await axios.post('social_network/auth/logout/');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
