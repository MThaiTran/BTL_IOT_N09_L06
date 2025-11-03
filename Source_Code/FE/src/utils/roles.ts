import { UserRole, ERole } from '../types';
import { getAuth } from './auth';

/**
 * Check if user has a specific role
 */
export const hasRole = (userRoleId: number | undefined, requiredRole: UserRole): boolean => {
  if (!userRoleId) return false;
  return userRoleId === requiredRole;
};

/**
 * Check if user has one of the required roles
 */
export const hasAnyRole = (userRoleId: number | undefined, requiredRoles: UserRole[]): boolean => {
  if (!userRoleId) return false;
  return requiredRoles.includes(userRoleId as UserRole);
};

/**
 * Get current user role
 */
export const getCurrentUserRole = (): UserRole | null => {
  const { user } = getAuth();
  return user?.roleId ? (user.roleId as UserRole) : null;
};

/**
 * Check if current user is Admin
 */
export const isAdmin = (): boolean => {
  return hasRole(getCurrentUserRole() || 0, UserRole.ADMIN);
};

/**
 * Check if current user is House Owner (ENDUSER)
 */
export const isHouseOwner = (): boolean => {
  return hasRole(getCurrentUserRole() || 0, UserRole.ENDUSER);
};

/**
 * Check if current user is Technician
 */
export const isTechnician = (): boolean => {
  return hasRole(getCurrentUserRole() || 0, UserRole.TECHNICIAN);
};

/**
 * Get role name from role ID
 */
export const getRoleName = (roleId: number): string => {
  switch (roleId) {
    case UserRole.ADMIN:
      return ERole.ADMIN;
    case UserRole.TECHNICIAN:
      return ERole.TECHNICIAN;
    case UserRole.ENDUSER:
      return ERole.ENDUSER;
    default:
      return 'Unknown';
  }
};

/**
 * Get role display name (Vietnamese)
 */
export const getRoleDisplayName = (roleId: number): string => {
  switch (roleId) {
    case UserRole.ADMIN:
      return 'Quản trị viên';
    case UserRole.TECHNICIAN:
      return 'Kỹ thuật viên';
    case UserRole.ENDUSER:
      return 'Chủ nhà';
    default:
      return 'Người dùng';
  }
};

/**
 * Check if user can access admin features
 */
export const canAccessAdmin = (): boolean => {
  const role = getCurrentUserRole();
  return role === UserRole.ADMIN;
};

/**
 * Check if user can manage devices
 */
export const canManageDevices = (): boolean => {
  const role = getCurrentUserRole();
  return role === UserRole.ADMIN || role === UserRole.ENDUSER || role === UserRole.TECHNICIAN;
};

/**
 * Check if user can manage users
 */
export const canManageUsers = (): boolean => {
  const role = getCurrentUserRole();
  return role === UserRole.ADMIN;
};

/**
 * Check if user can view all devices (not just their own)
 */
export const canViewAllDevices = (): boolean => {
  const role = getCurrentUserRole();
  return role === UserRole.ADMIN || role === UserRole.TECHNICIAN;
};

