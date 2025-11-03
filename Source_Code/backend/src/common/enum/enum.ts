export enum UserRole {
  ADMIN = 1,
  TECHNICIAN = 2,
  ENDUSER = 3,
}

export enum Status {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
}

export enum ERole {
  ADMIN = 'Admin',
  TECHNICIAN = 'Technician',
  ENDUSER = 'User',
}

export enum EPermission {
  ADD_ONE = 'Add',
  EDIT_ONE = 'Edit',
  DELETE_ONE = 'Delete',
  GET_ONE = 'GetOne',
  GET_ALL = 'GetAll',
  TEST = 'TestAuth',
  TEST_ADMIN = 'TestAdminAuth',
  CREATE_EXAM_TEMPLATE = 'CreateResultFromExam',
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
