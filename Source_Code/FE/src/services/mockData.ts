import { EDeviceLog, ERole, UserRole } from "../interfaces/enum";
import type * as types from "../types";

// Mock delay to simulate network request
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Roles
const mockRoles: types.Role[] = [
  {
    id: UserRole.ADMIN,
    name: ERole.ADMIN,
    description: "Quản trị viên - Quyền truy cập đầy đủ",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: UserRole.GUEST,
    name: ERole.GUEST,
    description: "Kỹ thuật viên - Quản lý thiết bị và hệ thống",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: UserRole.HOUSE_OWNER,
    name: ERole.HOUSE_OWNER,
    description: "Chủ nhà - Quản lý thiết bị của mình",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: UserRole.GUEST,
    name: ERole.GUEST,
    description: "Thành viên gia đình - Điều khiển thiết bị được cấp quyền",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Mock Users - stored in memory
let mockUsers: types.User[] = [
  {
    id: 1,
    email: "admin@test.com",
    name: "Admin User",
    status: "active",
    roleId: UserRole.ADMIN,
    role: mockRoles[0],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 2,
    email: "owner@test.com",
    name: "House Owner",
    status: "active",
    roleId: UserRole.HOUSE_OWNER,
    role: mockRoles[2],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 3,
    email: "tech@test.com",
    name: "Technician",
    status: "active",
    roleId: UserRole.GUEST,
    role: mockRoles[1],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 4,
    email: "guest@test.com",
    name: "Guest User",
    status: "active",
    roleId: UserRole.GUEST,
    role: mockRoles[3],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Mock Device Types
const mockDeviceTypes: types.DeviceType[] = [
  {
    id: 1,
    name: "Temperature Sensor",
    description: "Cảm biến nhiệt độ và độ ẩm",
    createdAt: new Date("2025-01-11"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 2,
    name: "Light",
    description: "Đèn LED thông minh",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 3,
    name: "Fan",
    description: "Quạt thông minh",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Mock Devices - stored in memory to simulate database
let mockDevices: types.Device[] = [
  {
    id: 1,
    name: "Sensor Phòng Khách",
    firebasePath: "devices/room1/sensor1",
    description: "Cảm biến nhiệt độ và độ ẩm phòng khách",
    location: "Phòng khách",
    thresholdLow: 20,
    thresholdHigh: 30,
    lastestDeviceUpdate: new Date(),
    userId: 1,
    deviceTypeId: 1,
    deviceType: mockDeviceTypes[0],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 2,
    name: "Đèn Phòng Khách",
    firebasePath: "devices/room1/light1",
    description: "Đèn LED thông minh phòng khách",
    location: "Phòng khách",
    thresholdLow: 0,
    thresholdHigh: 100,
    lastestDeviceUpdate: new Date(),
    userId: 1,
    deviceTypeId: 2,
    deviceType: mockDeviceTypes[1],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 3,
    name: "Quạt Phòng Ngủ",
    firebasePath: "devices/room2/fan1",
    description: "Quạt thông minh phòng ngủ",
    location: "Phòng ngủ",
    thresholdLow: 0,
    thresholdHigh: 100,
    lastestDeviceUpdate: new Date(),
    userId: 1,
    deviceTypeId: 3,
    deviceType: mockDeviceTypes[2],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 4,
    name: "Sensor Phòng Ngủ",
    firebasePath: "devices/room2/sensor2",
    description: "Cảm biến nhiệt độ và độ ẩm phòng ngủ",
    location: "Phòng ngủ",
    thresholdLow: 18,
    thresholdHigh: 28,
    lastestDeviceUpdate: new Date(Date.now() - 120000), // 2 minutes ago - offline
    userId: 1,
    deviceTypeId: 1,
    deviceType: mockDeviceTypes[0],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Mock System Logs
let mockLogs: types.SystemLog[] = [
  {
    id: 1,
    log: EDeviceLog.INFO,
    logDescription: "Hệ thống khởi động thành công",
    logData: { status: "running", uptime: 3600 },
    userId: 1,
    deviceId: 1,
    device: mockDevices[0],
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 2,
    log: EDeviceLog.WARNING,
    logDescription: "Nhiệt độ vượt ngưỡng cho phép",
    logData: { temperature: 32, threshold: 30, device: "Sensor Phòng Khách" },
    userId: 1,
    deviceId: 1,
    device: mockDevices[0],
    createdAt: new Date(Date.now() - 1800000),
    updatedAt: new Date(Date.now() - 1800000),
  },
  {
    id: 3,
    log: EDeviceLog.USER_ACTION,
    logDescription: "Người dùng bật đèn phòng khách",
    logData: { action: "turn_on", device: "Đèn Phòng Khách" },
    userId: 1,
    deviceId: 2,
    device: mockDevices[1],
    createdAt: new Date(Date.now() - 900000),
    updatedAt: new Date(Date.now() - 900000),
  },
  {
    id: 4,
    log: EDeviceLog.UPDATE,
    logDescription: "Cập nhật firmware thiết bị",
    logData: { version: "1.2.0", device: "Quạt Phòng Ngủ" },
    userId: 1,
    deviceId: 3,
    device: mockDevices[2],
    createdAt: new Date(Date.now() - 600000),
    updatedAt: new Date(Date.now() - 600000),
  },
  {
    id: 5,
    log: EDeviceLog.ERROR,
    logDescription: "Mất kết nối với thiết bị",
    logData: { device: "Sensor Phòng Ngủ", error: "connection_timeout" },
    userId: 1,
    deviceId: 4,
    device: mockDevices[3],
    createdAt: new Date(Date.now() - 300000),
    updatedAt: new Date(Date.now() - 300000),
  },
];

// Mock Auth API
export const mockAuthAPI = {
  signin: async (
    data: types.LoginDto
  ): Promise<{ data: types.AuthResponse }> => {
    await delay(800);

    // Mock validation with multiple users
    const mockCredentials: Record<
      string,
      { user: types.User; password: string }
    > = {
      "admin@test.com": { user: mockUsers[0], password: "admin123" },
      "owner@test.com": { user: mockUsers[1], password: "owner123" },
      "tech@test.com": { user: mockUsers[2], password: "tech123" },
      "guest@test.com": { user: mockUsers[3], password: "guest123" }, // New Guest user
      "user@test.com": { user: mockUsers[1], password: "password123" }, // Legacy support
    };

    const credential = mockCredentials[data.email];

    if (credential && credential.password === data.password) {
      const response: types.AuthResponse = {
        payload: {
          id: credential.user.id,
          email: credential.user.email,
          name: credential.user.name,
          status: credential.user.status,
          roleId: credential.user.roleId,
        },
        token: "mock-jwt-token-" + Date.now(),
      };
      return { data: response };
    } else {
      throw {
        response: { data: { message: "Email hoặc mật khẩu không đúng" } },
      };
    }
  },

  signup: async (data: types.SignupDto): Promise<{ data: any }> => {
    await delay(1000);

    if (data.email && data.password) {
      return {
        data: {
          id: Date.now(),
          email: data.email,
          name: data.name || "User",
          status: "active",
        },
      };
    } else {
      throw {
        response: { data: { message: "Vui lòng điền đầy đủ thông tin" } },
      };
    }
  },

  getProfile: async (): Promise<{ data: any }> => {
    await delay(500);
    return {
      data: {
        id: 1,
        email: "user@test.com",
        name: "Test User",
        status: "active",
        roleId: 1,
      },
    };
  },
};

// Mock Devices API
export const mockDevicesAPI = {
  getAll: async (): Promise<{ data: types.Device[] }> => {
    await delay(600);
    // Simulate real-time updates for some devices
    mockDevices = mockDevices.map((device) => {
      if (device.id === 1 || device.id === 2) {
        // Update these devices to show as online
        return {
          ...device,
          lastestDeviceUpdate: new Date(),
        };
      }
      return device;
    });
    return { data: [...mockDevices] };
  },

  getOne: async (id: number): Promise<{ data: types.Device }> => {
    await delay(400);
    const device = mockDevices.find((d) => d.id === id);
    if (!device) {
      throw {
        response: { status: 404, data: { message: "Device not found" } },
      };
    }
    return { data: device };
  },

  create: async (
    data: types.CreateDeviceDto
  ): Promise<{ data: types.Device }> => {
    await delay(800);
    const deviceType = mockDeviceTypes.find(
      (dt) => dt.id === data.deviceTypeId
    );
    const newDevice: types.Device = {
      id: Math.max(...mockDevices.map((d) => d.id), 0) + 1,
      ...data,
      lastestDeviceUpdate: new Date(),
      deviceType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDevices.push(newDevice);
    return { data: newDevice };
  },

  update: async (
    id: number,
    data: types.UpdateDeviceDto
  ): Promise<{ data: types.Device }> => {
    await delay(700);
    const index = mockDevices.findIndex((d) => d.id === id);
    if (index === -1) {
      throw {
        response: { status: 404, data: { message: "Device not found" } },
      };
    }
    // deviceTypeId is not in UpdateDeviceDto, so use the existing one
    const deviceType = mockDeviceTypes.find(
      (dt) => dt.id === mockDevices[index].deviceTypeId
    );
    mockDevices[index] = {
      ...mockDevices[index],
      ...data,
      deviceType,
      updatedAt: new Date(),
    };
    return { data: mockDevices[index] };
  },

  delete: async (id: number): Promise<void> => {
    await delay(500);
    const index = mockDevices.findIndex((d) => d.id === id);
    if (index === -1) {
      throw {
        response: { status: 404, data: { message: "Device not found" } },
      };
    }
    mockDevices.splice(index, 1);
  },
};

// Mock Device Types API
export const mockDeviceTypesAPI = {
  getAll: async (): Promise<{ data: types.DeviceType[] }> => {
    await delay(400);
    return { data: [...mockDeviceTypes] };
  },

  getOne: async (id: number): Promise<{ data: types.DeviceType }> => {
    await delay(300);
    const deviceType = mockDeviceTypes.find((dt) => dt.id === id);
    if (!deviceType) {
      throw {
        response: { status: 404, data: { message: "Device type not found" } },
      };
    }
    return { data: deviceType };
  },
};

// Mock System Logs API
export const mockSystemLogsAPI = {
  getAll: async (): Promise<{ data: types.SystemLog[] }> => {
    await delay(500);
    // Add a new log occasionally to simulate real-time logs
    if (Math.random() > 0.7) {
      const newLog: types.SystemLog = {
        id: Math.max(...mockLogs.map((l) => l.id), 0) + 1,
        log: EDeviceLog.INFO,
        logDescription: "Hoạt động bình thường",
        logData: { status: "ok", timestamp: new Date().toISOString() },
        userId: 1,
        deviceId: 1,
        device: mockDevices[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockLogs.unshift(newLog);
      // Keep only last 50 logs
      if (mockLogs.length > 50) {
        mockLogs = mockLogs.slice(0, 50);
      }
    }
    return { data: [...mockLogs] };
  },

  getOne: async (id: number): Promise<{ data: types.SystemLog }> => {
    await delay(300);
    const log = mockLogs.find((l) => l.id === id);
    if (!log) {
      throw { response: { status: 404, data: { message: "Log not found" } } };
    }
    return { data: log };
  },
};

// Mock Users API
export const mockUsersAPI = {
  getAll: async (): Promise<{ data: types.User[] }> => {
    await delay(600);
    return { data: [...mockUsers] };
  },

  getOne: async (id: number): Promise<{ data: types.User }> => {
    await delay(400);
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      throw { response: { status: 404, data: { message: "User not found" } } };
    }
    return { data: user };
  },

  create: async (data: types.CreateUserDto): Promise<{ data: types.User }> => {
    await delay(800);
    const role = mockRoles.find((r) => r.id === data.roleId);
    const newUser: types.User = {
      id: Math.max(...mockUsers.map((u) => u.id), 0) + 1,
      email: data.email,
      name: data.name,
      status: "active",
      roleId: data.roleId,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUsers.push(newUser);
    return { data: newUser };
  },

  update: async (
    id: number,
    data: types.UpdateUserDto
  ): Promise<{ data: types.User }> => {
    await delay(700);
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      throw { response: { status: 404, data: { message: "User not found" } } };
    }
    const role = data.roleId
      ? mockRoles.find((r) => r.id === data.roleId)
      : mockUsers[index].role;
    mockUsers[index] = {
      ...mockUsers[index],
      ...data,
      role,
      updatedAt: new Date(),
    };
    return { data: mockUsers[index] };
  },

  delete: async (id: number): Promise<void> => {
    await delay(500);
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      throw { response: { status: 404, data: { message: "User not found" } } };
    }
    // Don't allow deleting yourself
    const { user } = await import("../utils/auth").then((m) => m.getAuth());
    if (user?.id === id) {
      throw {
        response: { status: 400, data: { message: "Cannot delete yourself" } },
      };
    }
    mockUsers.splice(index, 1);
  },
};

// Mock Roles API
export const mockRolesAPI = {
  getAll: async (): Promise<{ data: types.Role[] }> => {
    await delay(400);
    return { data: [...mockRoles] };
  },

  getOne: async (id: number): Promise<{ data: types.Role }> => {
    await delay(300);
    const role = mockRoles.find((r) => r.id === id);
    if (!role) {
      throw { response: { status: 404, data: { message: "Role not found" } } };
    }
    return { data: role };
  },
};
