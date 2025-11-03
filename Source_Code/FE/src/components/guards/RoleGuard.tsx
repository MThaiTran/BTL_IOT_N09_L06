import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { getCurrentUserRole } from '../../utils/roles';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * Guard component to protect routes based on user roles
 */
function RoleGuard({ children, allowedRoles, redirectTo = '/dashboard' }: RoleGuardProps) {
  const userRole = getCurrentUserRole();

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

export default RoleGuard;

