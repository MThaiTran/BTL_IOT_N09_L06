import { useQuery } from '@tanstack/react-query';
import { usersAPI, devicesAPI, systemLogsAPI } from '../../services/api';
import { Users, Cpu, Activity, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

function AdminDashboardPage() {
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll().then((res) => res.data),
  });

  const { data: devices } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesAPI.getAll().then((res) => res.data),
  });

  const { data: logs } = useQuery({
    queryKey: ['system-logs'],
    queryFn: () => systemLogsAPI.getAll().then((res) => res.data),
  });

  const stats = [
    {
      title: 'Tổng Người dùng',
      value: users?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/users',
    },
    {
      title: 'Tổng Thiết bị',
      value: devices?.length || 0,
      icon: Cpu,
      color: 'bg-green-500',
      link: '/devices',
    },
    {
      title: 'Hoạt động hôm nay',
      value: (Array.isArray(logs) ? logs : []).filter((l) => {
        const today = new Date();
        const logDate = new Date(l.createdAt);
        return logDate.toDateString() === today.toDateString();
      }).length || 0,
      icon: Activity,
      color: 'bg-purple-500',
      link: '/logs',
    },
    {
      title: 'Cảnh báo',
      value: (Array.isArray(logs) ? logs : []).filter((l) => l.log === 'ERROR' || l.log === 'WARNING').length || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
      link: '/logs',
    },
  ];

  const recentUsers = Array.isArray(users) ? users.slice(0, 5) : [];
  const recentLogs = Array.isArray(logs) ? logs.slice(0, 5) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Quản lý và kiểm soát toàn bộ hệ thống
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Users & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Người dùng gần đây
            </h2>
            <Link
              to="/admin/users"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded">
                    {user.role?.name || 'User'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Chưa có người dùng
              </p>
            )}
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Logs gần đây
            </h2>
            <Link
              to="/logs"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {log.logDescription}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${log.log === 'ERROR'
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : log.log === 'WARNING'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                        : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      }`}
                  >
                    {log.log}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Chưa có logs
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

