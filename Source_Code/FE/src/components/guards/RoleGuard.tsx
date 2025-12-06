import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUserRole } from "../../utils/roles";
import { RoleGuardProps } from "../../interfaces/ui-props.interface";

/**
 * Guard component to protect routes based on user roles
 */
function RoleGuard({
  children,
  allowedRoles,
  redirectTo = "/dashboard",
}: RoleGuardProps) {
  const userRole = getCurrentUserRole();

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

export default RoleGuard;
