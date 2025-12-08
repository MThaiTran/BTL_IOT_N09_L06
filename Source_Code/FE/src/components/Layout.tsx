import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  Users,
  Shield,
  UploadCloud,
  Mic,
  KeyRound,
} from "lucide-react";
import { useState } from "react";
import { clearAuth, getAuth } from "../utils/auth";
import { getCurrentUserRole, getRoleDisplayName } from "../utils/roles";
import toast from "react-hot-toast";
import { UserRole } from "../interfaces/enum";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = getAuth();
  const userRole = getCurrentUserRole();

  const handleLogout = () => {
    clearAuth();
    toast.success("Đăng xuất thành công");
    navigate("/login");
  };

  type NavItem = { path: string; label: string; icon: LucideIcon };

  const baseNavItems: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/devices", label: "Thiết Bị", icon: Settings },
    { path: "/logs", label: "Nhật Ký", icon: FileText },
  ];

  const adminNavItems: NavItem[] = [
    { path: "/admin/dashboard", label: "Admin Dashboard", icon: Shield },
    { path: "/admin/users", label: "Quản lý Người dùng", icon: Users },
  ];

  const firmwareNavItem: NavItem = {
    path: "/firmware",
    label: "Cập nhật OTA",
    icon: UploadCloud,
  };

  const voiceControlNavItem: NavItem = {
    path: "/voice-control",
    label: "Giọng nói",
    icon: Mic,
  };

  const permissionsNavItem: NavItem = {
    path: "/permissions",
    label: "Phân quyền",
    icon: KeyRound,
  };

  // Get navigation items based on role
  const getNavItems = () => {
    const nav: NavItem[] = [];

    switch (userRole) {
      case UserRole.ADMIN:
        nav.push(
          ...adminNavItems,
          permissionsNavItem,
          firmwareNavItem,
          voiceControlNavItem,
          ...baseNavItems
        );
        break;
      case UserRole.HOUSE_OWNER:
        nav.push(permissionsNavItem, voiceControlNavItem, ...baseNavItems);
        break;
      case UserRole.GUEST:
        // Guest: chỉ dashboard, giọng nói, nhật ký (không có thiết bị)
        nav.push(
          voiceControlNavItem,
          { path: "/dashboard", label: "Dashboard", icon: Home },
          { path: "/logs", label: "Nhật Ký", icon: FileText }
        );
        break;
      default:
        nav.push(...baseNavItems);
    }

    // Remove potential duplicates by path
    const unique = nav.filter(
      (item, index, self) =>
        index === self.findIndex((navItem) => navItem.path === item.path)
    );

    return unique;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:flex">
      {/* Mobile header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-primary-600">Smart Home</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-auto lg:shadow-none lg:flex lg:flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo & User Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Smart Home IoT
              </h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            {user && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getRoleDisplayName(user.roleId)}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-0 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        <main className="px-4 py-4 lg:px-10 lg:py-6 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
