import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./utils/auth";
import { getCurrentUserRole } from "./utils/roles";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import DevicesPage from "./pages/DevicesPage";
import LogsPage from "./pages/LogsPage";
import FirmwareUpdatePage from "./pages/FirmwareUpdatePage";
import VoiceControlPage from "./pages/VoiceControlPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import UsersManagementPage from "./pages/admin/UsersManagementPage";
import PermissionsPage from "./pages/admin/PermissionsPage";
import Layout from "./components/Layout";
import RoleGuard from "./components/guards/RoleGuard";
import MockDataIndicator from "./components/MockDataIndicator";
import { UserRole } from "./interfaces/enum";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  if (isAuthenticated()) {
    return <RoleBasedRedirect />;
  }
  return <>{children}</>;
}

function RoleBasedRedirect() {
  const userRole = getCurrentUserRole();

  if (userRole === UserRole.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (userRole === UserRole.HOUSE_OWNER || userRole === UserRole.GUEST) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleBasedRedirect />} />
          <Route
            path="dashboard"
            element={
              <RoleGuard
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.HOUSE_OWNER,
                  UserRole.GUEST,
                ]}
              >
                <DashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="devices"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.HOUSE_OWNER]}>
                <DevicesPage />
              </RoleGuard>
            }
          />
          <Route
            path="logs"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.HOUSE_OWNER]}>
                <LogsPage />
              </RoleGuard>
            }
          />
          <Route
            path="firmware"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <FirmwareUpdatePage />
              </RoleGuard>
            }
          />
          <Route
            path="voice-control"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.HOUSE_OWNER]}>
                <VoiceControlPage />
              </RoleGuard>
            }
          />
          <Route
            path="permissions"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.HOUSE_OWNER]}>
                <PermissionsPage />
              </RoleGuard>
            }
          />

          {/* Admin Routes */}
          <Route
            path="admin/dashboard"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <AdminDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="admin/users"
            element={
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <UsersManagementPage />
              </RoleGuard>
            }
          />
        </Route>
      </Routes>
      <MockDataIndicator />
    </>
  );
}

export default App;
