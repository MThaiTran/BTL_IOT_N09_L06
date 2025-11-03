import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import { getCurrentUserRole } from './utils/roles';
import { UserRole } from './types';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import DevicesPage from './pages/DevicesPage';
import LogsPage from './pages/LogsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UsersManagementPage from './pages/admin/UsersManagementPage';
import Layout from './components/Layout';
import RoleGuard from './components/guards/RoleGuard';
import MockDataIndicator from './components/MockDataIndicator';

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
  
  return <Navigate to="/dashboard" replace />;
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
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="logs" element={<LogsPage />} />
        
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

