export enum UserRole {
  ADMIN = 1,
  TECHNICIAN = 2,
  HOUSE_OWNER = 3,
  GUEST = 4,
}

export enum Status {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
}

export enum ERole {
  ADMIN = 'Admin',
  TECHNICIAN = 'Technician',
  HOUSE_OWNER = 'House Owner',
  GUEST = 'Guest',
}

export enum EPermission {
  // General CRUD
  CREATE = 'Create',
  READ = 'Read',
  UPDATE = 'Update',
  DELETE = 'Delete',

  // Device Specific
  CREATE_DEVICE = 'CreateDevice',
  READ_DEVICE = 'ReadDevice',
  UPDATE_DEVICE = 'UpdateDevice',
  DELETE_DEVICE = 'DeleteDevice',
  CONTROL_DEVICE = 'ControlDevice',
  VIEW_ALL_DEVICES = 'ViewAllDevices',
  VIEW_OWN_DEVICES = 'ViewOwnDevices',

  // User Specific
  CREATE_USER = 'CreateUser',
  READ_USER = 'ReadUser',
  UPDATE_USER = 'UpdateUser',
  DELETE_USER = 'DeleteUser',
  VIEW_ALL_USERS = 'ViewAllUsers',

  // Role and Permission Management
  MANAGE_ROLES = 'ManageRoles',
  MANAGE_PERMISSIONS = 'ManagePermissions',

  // System Logs
  VIEW_SYSTEM_LOGS = 'ViewSystemLogs',

  // Test Permissions (can be removed later)
  TEST_AUTH = 'TestAuth',
  TEST_ADMIN_AUTH = 'TestAdminAuth',
}

export enum EDeviceUnit {
  CELSIUS = '°C',
  FAHRENHEIT = '°F',
  VOLT = 'V',
  AMPERE = 'A',
  WATT = 'W',
  PERCENTAGE = '%',
}

export enum EDeviceLog {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  UPDATE = 'UPDATE',
  USER_ACTION = 'USER_ACTION',
}
