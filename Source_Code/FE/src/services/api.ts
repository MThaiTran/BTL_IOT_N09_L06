import axios from 'axios';
import type {
  LoginDto,
  SignupDto,
  AuthResponse,
  Device,
  CreateDeviceDto,
  UpdateDeviceDto,
  DeviceType,
  SystemLog,
} from '../types';
import { USE_MOCK_DATA } from '../config';
import {
  mockAuthAPI,
  mockDevicesAPI,
  mockDeviceTypesAPI,
  mockSystemLogsAPI,
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API - Switch between mock and real API
export const authAPI = {
  signin: (data: LoginDto): Promise<{ data: AuthResponse }> =>
    USE_MOCK_DATA ? mockAuthAPI.signin(data) : api.post('/auth/signin', data),

  signup: (data: SignupDto): Promise<{ data: any }> =>
    USE_MOCK_DATA ? mockAuthAPI.signup(data) : api.post('/auth/signup', data),

  getProfile: (): Promise<{ data: any }> =>
    USE_MOCK_DATA ? mockAuthAPI.getProfile() : api.get('/auth/profile'),
};

// Devices API - Switch between mock and real API
export const devicesAPI = {
  getAll: (): Promise<{ data: Device[] }> =>
    USE_MOCK_DATA ? mockDevicesAPI.getAll() : api.get('/devices'),

  getOne: (id: number): Promise<{ data: Device }> =>
    USE_MOCK_DATA ? mockDevicesAPI.getOne(id) : api.get(`/devices/${id}`),

  create: (data: CreateDeviceDto): Promise<{ data: Device }> =>
    USE_MOCK_DATA ? mockDevicesAPI.create(data) : api.post('/devices', data),

  update: (id: number, data: UpdateDeviceDto): Promise<{ data: Device }> =>
    USE_MOCK_DATA ? mockDevicesAPI.update(id, data) : api.patch(`/devices/${id}`, data),

  delete: (id: number): Promise<void> =>
    USE_MOCK_DATA ? mockDevicesAPI.delete(id) : api.delete(`/devices/${id}`),
};

// Device Types API - Switch between mock and real API
export const deviceTypesAPI = {
  getAll: (): Promise<{ data: DeviceType[] }> =>
    USE_MOCK_DATA ? mockDeviceTypesAPI.getAll() : api.get('/device-types'),

  getOne: (id: number): Promise<{ data: DeviceType }> =>
    USE_MOCK_DATA ? mockDeviceTypesAPI.getOne(id) : api.get(`/device-types/${id}`),
};

// System Logs API - Switch between mock and real API
export const systemLogsAPI = {
  getAll: (): Promise<{ data: SystemLog[] }> =>
    USE_MOCK_DATA ? mockSystemLogsAPI.getAll() : api.get('/system-logs'),

  getOne: (id: number): Promise<{ data: SystemLog }> =>
    USE_MOCK_DATA ? mockSystemLogsAPI.getOne(id) : api.get(`/system-logs/${id}`),
};

export default api;

