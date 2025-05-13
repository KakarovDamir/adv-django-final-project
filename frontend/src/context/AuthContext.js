import React, { createContext, useContext, useState } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async ({ username, password }) => {
    // 1. Получаем CSRF токен
    await axios.get('social_network/get_csrf/');

    // 2. Отправляем запрос логина
    const response = await axios.post('social_network/auth/login/', {
      username,
      password,
    });

    setUser(response.data.user); // сохраняем пользователя
  };

  const logout = async () => {
    await axios.post('social_network/auth/logout/'); // если реализуешь logout
    setUser(null);
  };

  const value = { user, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
