import { EDeviceLog } from "../interfaces/enum";

// Auth Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupDto {
  name?: string;
  email: string;
  password: string;
  passwordConfirm?: string;
}

export interface AuthResponse {
  payload: {
    id: number;
    email: string;
    name: string;
    status: string;
    roleId: number;
  } | null;
  token: string;
}

// Device Types
export interface Device {
  id: number;
  name: string;
  firebasePath: string;
  description: string;
  location: string;
  thresholdLow: number;
  thresholdHigh: number;
  lastestDeviceUpdate: Date | null;
  userId: number;
  deviceTypeId: number;
  deviceType?: DeviceType;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceType {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeviceDto {
  name: string;
  firebasePath: string;
  description: string;
  location: string;
  thresholdLow: number;
  thresholdHigh: number;
  userId: number;
  deviceTypeId: number;
}

export interface CreateUserDevicesDto {
  userId: number;
  deviceId: number;
}

export interface UpdateDeviceDto {
  name?: string;
  firebasePath?: string;
  description?: string;
  location?: string;
  thresholdLow?: number;
  thresholdHigh?: number;
}

export interface SystemLog {
  id: number;
  log: EDeviceLog;
  logDescription: string;
  logData: any;
  userId: number;
  deviceId: number;
  user?: User;
  device?: Device;
  createdAt: Date;
  updatedAt: Date;
}

// Role Types
export enum UserRole {
  ADMIN = 1,
  TECHNICIAN = 2,
  HOUSE_OWNER = 2, // Corresponds to House Owner
  GUEST = 3, // Corresponds to Guest/Family Member
}

export enum ERole {
  ADMIN = "Admin",
  TECHNICIAN = "Technician",
  HOUSE_OWNER = "House Owner",
  GUEST = "Guest",
}

export interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  role?: Role;
  permission?: Permission;
}

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  status: string;
  roleId: number;
  role?: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  roleId: number;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  roleId?: number;
  status?: string;
}

// Sensor Data (from Firebase/Real-time)
export interface SensorData {
  temperature: number;
  humidity: number;
  timestamp: Date;
}
