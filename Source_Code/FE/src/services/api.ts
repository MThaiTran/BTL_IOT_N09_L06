import axios from "axios";
import type {
  LoginDto,
  SignupDto,
  AuthResponse,
  Device,
  CreateDeviceDto,
  UpdateDeviceDto,
  DeviceType,
  SystemLog,
  User,
  Role,
  CreateUserDto,
  UpdateUserDto,
} from "../types";
import { USE_MOCK_DATA } from "../config/config";
import {
  mockAuthAPI,
  mockDevicesAPI,
  mockDeviceTypesAPI,
  mockSystemLogsAPI,
  mockUsersAPI,
  mockRolesAPI,
} from "./mockData";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL + ":" + import.meta.env.VITE_API_BASE_PORT;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API - Switch between mock and real API
export const authAPI = {
  signin: (data: LoginDto) =>
    USE_MOCK_DATA
      ? mockAuthAPI.signin(data)
      : api.post(import.meta.env.VITE_AUTH_SIGNIN_API_URL, data),

  signup: (data: SignupDto): Promise<{ data: any }> =>
    USE_MOCK_DATA
      ? mockAuthAPI.signup(data)
      : api.post(import.meta.env.VITE_AUTH_SIGNUP_API_URL, data),

  getProfile: (): Promise<{ data: any }> =>
    USE_MOCK_DATA
      ? mockAuthAPI.getProfile()
      : api.get(import.meta.env.VITE_AUTH_PROFILE_API_URL),
};

// Devices API - Switch between mock and real API
export const devicesAPI = {
  getAll: (): Promise<{ data: Device[] }> =>
    USE_MOCK_DATA
      ? mockDevicesAPI.getAll()
      : api.get(import.meta.env.VITE_DEVICE_API_URL),

  getOne: (id: number): Promise<{ data: Device }> =>
    USE_MOCK_DATA
      ? mockDevicesAPI.getOne(id)
      : api.get(`${import.meta.env.VITE_DEVICE_API_URL}/${id}`),

  create: (data: CreateDeviceDto): Promise<{ data: Device }> =>
    USE_MOCK_DATA
      ? mockDevicesAPI.create(data)
      : api.post(import.meta.env.VITE_DEVICE_API_URL, data),

  update: (id: number, data: UpdateDeviceDto): Promise<{ data: Device }> =>
    USE_MOCK_DATA
      ? mockDevicesAPI.update(id, data)
      : api.patch(`${import.meta.env.VITE_DEVICE_API_URL}/${id}`, data),

  delete: (id: number): Promise<void> =>
    USE_MOCK_DATA
      ? mockDevicesAPI.delete(id)
      : api.delete(`${import.meta.env.VITE_DEVICE_API_URL}/${id}`),
};
//userDevicesAPI
export const userDevicesAPI = {
  getOne: (id: number): Promise<{ data: Device[] }> =>
    USE_MOCK_DATA
      ? mockDevicesAPI.getAll()
      : api.get(`${import.meta.env.VITE_USER_DEVICE_API_URL}/${id}`),
  
  createOne: (data: CreateDeviceDto): Promise<{ data: Device }> =>
    USE_MOCK_DATA
      ? mockDevicesAPI.create(data)
      : api.post(import.meta.env.VITE_USER_DEVICE_API_URL, data),
};


// Device Types API - Switch between mock and real API
export const deviceTypesAPI = {
  getAll: (): Promise<{ data: DeviceType[] }> =>
    USE_MOCK_DATA
      ? mockDeviceTypesAPI.getAll()
      : api.get(`${import.meta.env.VITE_DEVICE_TYPE_API_URL}`),

  getOne: (id: number): Promise<{ data: DeviceType }> =>
    USE_MOCK_DATA
      ? mockDeviceTypesAPI.getOne(id)
      : api.get(`${import.meta.env.VITE_DEVICE_TYPE_API_URL}/${id}`),
};

// System Logs API - Switch between mock and real API
export const systemLogsAPI = {
  getAll: (): Promise<{ data: SystemLog[] }> =>
    USE_MOCK_DATA
      ? mockSystemLogsAPI.getAll()
      : api.get(`${import.meta.env.VITE_SYSTEM_LOG_API_URL}`),

  getOne: (id: number): Promise<{ data: SystemLog }> =>
    USE_MOCK_DATA
      ? mockSystemLogsAPI.getOne(id)
      : api.get(`${import.meta.env.VITE_SYSTEM_LOG_API_URL}/${id}`),
};

// Users API - Switch between mock and real API
export const usersAPI = {
  getAll: () =>
    USE_MOCK_DATA
      ? mockUsersAPI.getAll()
      : api.get(`${import.meta.env.VITE_USER_API_URL}`),

  getOne: (id: number) =>
    USE_MOCK_DATA
      ? mockUsersAPI.getOne(id)
      : api.get(`${import.meta.env.VITE_USER_API_URL}/${id}`),

  create: (data: CreateUserDto) =>
    USE_MOCK_DATA
      ? mockUsersAPI.create(data)
      : api.post(`${import.meta.env.VITE_USER_API_URL}`, data),

  update: (id: number, data: UpdateUserDto) =>
    USE_MOCK_DATA
      ? mockUsersAPI.update(id, data)
      : api.patch(`${import.meta.env.VITE_USER_API_URL}/${id}`, data),

  delete: (id: number): Promise<void> =>
    USE_MOCK_DATA
      ? mockUsersAPI.delete(id)
      : api.delete(`${import.meta.env.VITE_USER_API_URL}/${id}`),
};

// Roles API - Switch between mock and real API
export const rolesAPI = {
  getAll: (): Promise<{ data: Role[] }> =>
    USE_MOCK_DATA
      ? mockRolesAPI.getAll()
      : api.get(`${import.meta.env.VITE_ROLE_API_URL}`),

  getOne: (id: number): Promise<{ data: Role }> =>
    USE_MOCK_DATA
      ? mockRolesAPI.getOne(id)
      : api.get(`${import.meta.env.VITE_ROLE_API_URL}/${id}`),
};

export default api;
