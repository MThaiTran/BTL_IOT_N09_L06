import { LucideIcon } from "lucide-react";
import { Device, DeviceType, Role, User } from "./entities.interface";
import { UserRole } from "./enum";

export interface UserModalProps {
  user: User | null;
  roles: Role[];
  onClose: () => void;
}

export interface DeviceControlCardProps {
  title: string;
  icon: LucideIcon;
  devices: Device[];
}

export interface SensorCardProps {
  label: string;
  value: number;
  unit: string;
  color: "red" | "blue" | "yellow"; // Quy định màu
  icon?: React.ReactNode;
  
}

export interface SystemStatusCardProps {
  devices: Device[];
}

export interface TemperatureHumidityCardProps {
  device?: Device;
}

export interface DeviceModalProps {
  device: Device | null;
  deviceTypes: DeviceType[];
  onClose: () => void;
}

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}
