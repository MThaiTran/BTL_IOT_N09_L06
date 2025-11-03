import type { AuthResponse } from '../types';

export const setAuth = (authData: AuthResponse) => {
  localStorage.setItem('token', authData.token);
  localStorage.setItem('user', JSON.stringify(authData.payload));
};

export const getAuth = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  return {
    token,
    user: userStr ? JSON.parse(userStr) : null,
  };
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

