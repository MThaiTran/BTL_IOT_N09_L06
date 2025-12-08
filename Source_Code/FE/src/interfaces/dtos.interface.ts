import { EMQTTThresholdType, Status } from "./enum";

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
  status?: number;
  deviceTypeId?: number;
  state: boolean;
  autoMode: boolean;
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

export interface FileDto {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  downloadUrl: string;
  thirdPartyUrl?: string;
  version?: number;
}
// ========== MQTT DTOs ==========

export interface StatusTopicDto {
  sensors: SensorDataDto;
  devices: DeviceDataDto[];
}

export interface SensorDataDto {
  temp: number;
  hum: number;
  motion: boolean;
}

export interface DeviceDataDto {
  id: number;
  state: boolean;
  autoMode: boolean;
  status: Status;
}

export interface LogTopicDto {
  sensors: SensorDataDto;
  devices: DeviceDataDto[];
}

export interface WarningTopicDto {
  id: number;
  threshold: EMQTTThresholdType;
  thresholdValue: number;
  currentValue: number;
}

export interface AvaialbilityTopicDto {
  availability: boolean;
}
