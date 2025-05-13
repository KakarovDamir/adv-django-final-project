// src/api/auth.js
import api from './axios';

// Сначала получаем CSRF, потом логинимся
export const loginUser = async (username, password) => {
  await api.get('get_csrf/');  // 👈 обязательно перед логином
  return api.post('auth/login/', { username, password });
};
