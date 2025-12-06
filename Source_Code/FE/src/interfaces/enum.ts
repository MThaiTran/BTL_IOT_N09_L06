export enum UserRole {
  ADMIN = 1,
  HOUSE_OWNER = 2,
  GUEST = 3,
}

export enum Status {
  INACTIVE = "inactive",
  ACTIVE = "active",
}

export enum ERole {
  ADMIN = "Admin",
  HOUSE_OWNER = "House Owner",
  GUEST = "Guest",
}

export enum EPermission {
  ADD_ONE = "Add",
  EDIT_ONE = "Edit",
  DELETE_ONE = "Delete",
  GET_ONE = "GetOne",
  GET_ALL = "GetAll",
  TEST = "TestAuth",
  TEST_ADMIN = "TestAdminAuth",
}

export enum EDeviceUnit {
  CELSIUS = "°C",
  FAHRENHEIT = "°F",
  VOLT = "V",
  AMPERE = "A",
  WATT = "W",
  PERCENTAGE = "%",
}

export enum EDeviceLog {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  UPDATE = "UPDATE",
  USER_ACTION = "USER_ACTION",
}
