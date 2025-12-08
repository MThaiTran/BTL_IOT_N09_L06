import { FileHandler } from "./../../../backend/src/modules/file-handler/entities/file-handler.entity";
import axios from "axios";
import { USE_MOCK_DATA } from "../config/config";
import {
  mockAuthAPI,
  mockDevicesAPI,
  mockDeviceTypesAPI,
  mockSystemLogsAPI,
  mockUsersAPI,
  mockRolesAPI,
} from "./mockData";
import {
  CreateDeviceDto,
  CreateUserDevicesDto,
  CreateUserDto,
  LoginDto,
  SignupDto,
  UpdateDeviceDto,
  UpdateUserDto,
} from "../interfaces/dtos.interface";
import {
  Device,
  DeviceType,
  Role,
  SystemLog,
} from "../interfaces/entities.interface";

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
    api.post(import.meta.env.VITE_AUTH_SIGNIN_API_URL, data),

  signup: (data: SignupDto): Promise<{ data: any }> =>
    api.post(import.meta.env.VITE_AUTH_SIGNUP_API_URL, data),

  getProfile: (): Promise<{ data: any }> =>
    api.get(import.meta.env.VITE_AUTH_PROFILE_API_URL),
};

// Devices API - Switch between mock and real API
export const devicesAPI = {
  getAll: (): Promise<{ data: Device[] }> =>
    api.get(import.meta.env.VITE_DEVICE_API_URL),

  getOne: (id: number): Promise<{ data: Device }> =>
    api.get(`${import.meta.env.VITE_DEVICE_API_URL}/${id}`),

  create: (data: CreateDeviceDto): Promise<{ data: Device }> =>
    api.post(import.meta.env.VITE_DEVICE_API_URL, data),

  update: (id: number, data: UpdateDeviceDto): Promise<{ data: Device }> =>
    api.patch(`${import.meta.env.VITE_DEVICE_API_URL}/${id}`, data),

  delete: (id: number): Promise<void> =>
    api.delete(`${import.meta.env.VITE_DEVICE_API_URL}/${id}`),
};

//userDevicesAPI
export const userDevicesAPI = {
  // Get all devices by user ID
  getOne: (id: number) =>
    api.get(`${import.meta.env.VITE_USER_DEVICE_API_URL}/${id}`),

  createOne: (data: CreateUserDevicesDto) =>
    api.post(import.meta.env.VITE_USER_DEVICE_API_URL, data),

  delete: (userId: number, deviceId: number) =>
    api.delete(
      `${import.meta.env.VITE_USER_DEVICE_API_URL}/${userId}/${deviceId}`
    ),
};

// Device Types API - Switch between mock and real API
export const deviceTypesAPI = {
  getAll: (): Promise<{ data: DeviceType[] }> =>
    api.get(`${import.meta.env.VITE_DEVICE_TYPE_API_URL}`),

  getOne: (id: number): Promise<{ data: DeviceType }> =>
    api.get(`${import.meta.env.VITE_DEVICE_TYPE_API_URL}/${id}`),
};

// System Logs API - Switch between mock and real API
export const systemLogsAPI = {
  getAll: (): Promise<{ data: SystemLog[] }> =>
    api.get(`${import.meta.env.VITE_SYSTEM_LOG_API_URL}`),

  getOne: (id: number): Promise<{ data: SystemLog }> =>
    api.get(`${import.meta.env.VITE_SYSTEM_LOG_API_URL}/${id}`),
};

// Users API - Switch between mock and real API
export const usersAPI = {
  getAll: () => api.get(`${import.meta.env.VITE_USER_API_URL}`),

  getOne: (id: number) => api.get(`${import.meta.env.VITE_USER_API_URL}/${id}`),

  create: (data: CreateUserDto) =>
    api.post(`${import.meta.env.VITE_USER_API_URL}`, data),

  update: (id: number, data: UpdateUserDto) =>
    api.patch(`${import.meta.env.VITE_USER_API_URL}/${id}`, data),

  delete: (id: number): Promise<void> =>
    api.delete(`${import.meta.env.VITE_USER_API_URL}/${id}`),
};

// Roles API - Switch between mock and real API
export const rolesAPI = {
  getAll: (): Promise<{ data: Role[] }> =>
    api.get(`${import.meta.env.VITE_ROLE_API_URL}`),

  getOne: (id: number): Promise<{ data: Role }> =>
    api.get(`${import.meta.env.VITE_ROLE_API_URL}/${id}`),
};
export const filehandler = {
  upload: (data: FormData): Promise<{ data: Device }> =>
    api.post(`${import.meta.env.VITE_UPLOAD_API_URL}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default api;
