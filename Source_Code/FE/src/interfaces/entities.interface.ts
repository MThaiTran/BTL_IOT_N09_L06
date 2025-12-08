import { EDeviceLog } from "./enum";

export interface BaseEntity {
  id: number;
  status: string;
  createdAt: Date;
  latestUpdate?: Date;
  latestUpdateBy?: number;
}

export interface DeviceType extends BaseEntity {
  name: string;
  description: string;
  unit: string;
  minValue: number;
  maxValue: number;
  defaultThresholdLow: number;
  defaultThresholdHigh: number;
  isActuator: boolean;
}

export interface Device extends BaseEntity {
  name: string;
  firebasePath: string;
  description: string;
  location: string;
  thresholdLow: number;
  thresholdHigh: number;
  deltaRange: number;
  lastestDeviceUpdate: Date | null;
  autoMode: boolean;
  state: boolean;
  userId: number;
  deviceTypeId: number;
  deviceType?: DeviceType;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  rawPassword: string;
  hashPassword: string;
  roleId: number;
  role?: Role;
}

export interface UserDevice {
  userId: number;
  deviceId: number;
  status: string;
  createdAt: Date;
  latestUpdate?: Date;
  latestUpdateBy?: number;
}

export interface SystemLog extends BaseEntity {
  log: EDeviceLog;
  logDescription: string;
  logData: any;
  userId: number;
  deviceId: number;
  user?: User;
  device?: Device;
}
// export enum EDeviceLog {
//   INFO = "INFO",
//   WARNING = "WARNING",
//   ERROR = "ERROR",
//   UPDATE = "UPDATE",
//   USER_ACTION = "USER_ACTION",
// }

export interface Role extends BaseEntity {
  name: string;
  description: string;
}

export interface Permission extends BaseEntity {
  name: string;
  description: string;
}

export interface RolePermission {
  roleId: number;
  permissionId: number;
  status: string;
  createdAt: Date;
  latestUpdate?: Date;
  latestUpdateBy?: number;
  role?: Role;
  permission?: Permission;
}
