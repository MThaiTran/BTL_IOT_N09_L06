import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Settings, FileText, LogOut, Menu, X, Users, Shield } from 'lucide-react';
import { useState } from 'react';
import { clearAuth, getAuth } from '../utils/auth';
import { getCurrentUserRole, getRoleDisplayName } from '../utils/roles';
import { UserRole } from '../types';
import toast from 'react-hot-toast';

function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = getAuth();
    const userRole = getCurrentUserRole();

    const handleLogout = () => {
        clearAuth();
        toast.success('Đăng xuất thành công');
        navigate('/login');
    };

    // Base navigation items
    const baseNavItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/devices', label: 'Thiết Bị', icon: Settings },
        { path: '/logs', label: 'Nhật Ký', icon: FileText },
    ];

    // Admin navigation items
    const adminNavItems = [
        { path: '/admin/dashboard', label: 'Admin Dashboard', icon: Shield },
        { path: '/admin/users', label: 'Quản lý Người dùng', icon: Users },
        ...baseNavItems,
    ];

    // Get navigation items based on role
    const getNavItems = () => {
        switch (userRole) {
            case UserRole.ADMIN:
                return adminNavItems;
            case UserRole.TECHNICIAN:
            case UserRole.ENDUSER:
            default:
                return baseNavItems;
        }
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
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
                    <nav className="flex-1 px-4 py-6 space-y-2">
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
                    ${isActive
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
            <div className="lg:ml-64">
                <main className="p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;

