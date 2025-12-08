import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { systemLogsAPI, userDevicesAPI } from "../services/api";
import { SystemLog } from "../interfaces/entities.interface";
import { EDeviceLog } from "../interfaces/enum";
import { getCurrentUserId, getCurrentUserRole } from "../utils/roles";
import { UserRole } from "../interfaces/enum";
import {
  AlertCircle,
  Info,
  AlertTriangle,
  RefreshCw,
  UserCog,
} from "lucide-react";
import { format } from "date-fns";

function LogsPage() {
  const userId = getCurrentUserId();
  const userRole = getCurrentUserRole();
  const [permittedDeviceIds, setPermittedDeviceIds] = useState<number[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  // Lấy danh sách thiết bị được cấp quyền (chỉ cho Guest & House Owner)
  const { data: userDevices, isLoading: isLoadingUserDevices } = useQuery({
    queryKey: ["userDevices", userId],
    queryFn: () => userDevicesAPI.getOne(userId!).then((res) => res.data),
    enabled:
      !!userId &&
      (userRole === UserRole.GUEST || userRole === UserRole.HOUSE_OWNER),
  });

  // Set permitted device IDs khi userDevices load xong
  useEffect(() => {
    if (userRole === UserRole.ADMIN) {
      // Admin có quyền xem tất cả
      setPermittedDeviceIds([]);
      setIsLoadingPermissions(false);
    } else if (!isLoadingUserDevices) {
      // Guest/House Owner: chỉ xem thiết bị được cấp
      if (userDevices && userDevices.length > 0) {
        const deviceIds = userDevices.map((ud: any) => ud.deviceId);
        setPermittedDeviceIds(deviceIds);
      } else {
        setPermittedDeviceIds([]);
      }
      setIsLoadingPermissions(false);
    }
  }, [userDevices, isLoadingUserDevices, userRole]);

  // Lấy tất cả logs từ systemLogsAPI
  const {
    data: logs,
    isLoading: isLoadingLogs,
    refetch,
  } = useQuery({
    queryKey: ["system-logs"],
    queryFn: () => systemLogsAPI.getAll().then((res) => res.data),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Lọc logs dựa trên role
  useEffect(() => {
    if (!isLoadingPermissions && logs) {
      if (userRole === UserRole.ADMIN || userRole === UserRole.HOUSE_OWNER) {
        // Admin xem tất cả logs
        setFilteredLogs(logs);
      } else if (userRole === UserRole.GUEST) {
        // Guest/House Owner: chỉ xem logs của thiết bị được cấp
        const filtered = logs.filter((log) =>
          permittedDeviceIds.includes(log.deviceId)
        );
        setFilteredLogs(filtered);
      }
    }
  }, [logs, permittedDeviceIds, isLoadingPermissions, userRole]);

  const getLogIcon = (logType: EDeviceLog) => {
    switch (logType) {
      case EDeviceLog.ERROR:
        return <AlertCircle className="text-red-500" size={20} />;
      case EDeviceLog.WARNING:
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case EDeviceLog.UPDATE:
        return <RefreshCw className="text-blue-500" size={20} />;
      case EDeviceLog.USER_ACTION:
        return <UserCog className="text-purple-500" size={20} />;
      default:
        return <Info className="text-green-500" size={20} />;
    }
  };

  const getLogBg = (logType: EDeviceLog) => {
    switch (logType) {
      case EDeviceLog.ERROR:
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case EDeviceLog.WARNING:
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case EDeviceLog.UPDATE:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case EDeviceLog.USER_ACTION:
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
      default:
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    }
  };

  const getLogTypeLabel = (logType: EDeviceLog) => {
    switch (logType) {
      case EDeviceLog.ERROR:
        return "Lỗi";
      case EDeviceLog.WARNING:
        return "Cảnh báo";
      case EDeviceLog.UPDATE:
        return "Cập nhật";
      case EDeviceLog.USER_ACTION:
        return "Hành động người dùng";
      default:
        return "Thông tin";
    }
  };

  const isLoading = isLoadingPermissions || isLoadingLogs;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Nhật ký Hệ thống
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {userRole === UserRole.ADMIN
              ? "Theo dõi các sự kiện và cảnh báo từ hệ thống"
              : "Theo dõi các sự kiện từ các thiết bị được cấp quyền"}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
        >
          <RefreshCw size={20} />
          Làm mới
        </button>
      </div>

      {/* Thông báo cho Guest/Owner không có quyền */}
      {(userRole === UserRole.GUEST || userRole === UserRole.HOUSE_OWNER) &&
        permittedDeviceIds.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-700 dark:text-blue-300">
              Bạn chưa được cấp quyền sử dụng thiết bị nào.
            </p>
          </div>
        )}

      {/* Logs List */}
      {filteredLogs && filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((log) => (
              <LogCard
                key={log.id}
                log={log}
                getLogIcon={getLogIcon}
                getLogBg={getLogBg}
                getLogTypeLabel={getLogTypeLabel}
              />
            ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Info className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">
            Chưa có nhật ký nào
          </p>
        </div>
      )}
    </div>
  );
}

interface LogCardProps {
  log: SystemLog;
  getLogIcon: (logType: EDeviceLog) => JSX.Element;
  getLogBg: (logType: EDeviceLog) => string;
  getLogTypeLabel: (logType: EDeviceLog) => string;
}

function LogCard({ log, getLogIcon, getLogBg, getLogTypeLabel }: LogCardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border ${getLogBg(
          log.log
        )}
      `}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">{getLogIcon(log.log)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs font-semibold">
                {getLogTypeLabel(log.log)}
              </span>
              {log.device && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {log.device.name} - {log.device.location}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
            </span>
          </div>
          <p className="text-gray-900 dark:text-white mb-2">
            {log.logDescription}
          </p>
          {log.logData && (
            <details className="mt-2">
              <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
                Chi tiết dữ liệu
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                {JSON.stringify(log.logData, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogsPage;
