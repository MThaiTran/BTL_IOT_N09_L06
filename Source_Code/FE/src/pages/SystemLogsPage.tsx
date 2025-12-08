import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { systemLogsAPI, userDevicesAPI } from "../services/api";
import { SystemLog } from "../interfaces/entities.interface";
import { EDeviceLog } from "../interfaces/enum";
import { getCurrentUserId } from "../utils/roles";
import {TrendingDown, TrendingUp } from "lucide-react";

function SystemLogsPage() {
  const userId = getCurrentUserId();
  const [permittedDeviceIds, setPermittedDeviceIds] = useState<number[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  // Lấy danh sách thiết bị được cấp quyền
  const { data: userDevices, isLoading: isLoadingUserDevices } = useQuery({
    queryKey: ["userDevices", userId],
    queryFn: () => userDevicesAPI.getOne(userId!).then((res) => res.data),
    enabled: !!userId,
  });

  // Set permitted device IDs khi userDevices load xong
  useEffect(() => {
    if (!isLoadingUserDevices) {
      if (userDevices && userDevices.length > 0) {
        const deviceIds = userDevices.map((ud: any) => ud.deviceId);
        setPermittedDeviceIds(deviceIds);
      } else {
        // Nếu không có thiết bị được cấp, set empty array
        setPermittedDeviceIds([]);
      }
      setIsLoadingPermissions(false);
    }
  }, [userDevices, isLoadingUserDevices]);

  // Lấy tất cả logs từ systemLogsAPI
  const { data: systemLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["systemLogs"],
    queryFn: () => systemLogsAPI.getAll().then((res) => res.data),
  });

  // Lọc logs: chỉ WARNING (cảnh báo ngưỡng) của thiết bị được cấp
  useEffect(() => {
    // Chỉ filter khi đã load permissions xong
    if (!isLoadingPermissions && systemLogs && permittedDeviceIds.length > 0) {
      const filtered = systemLogs.filter(
        (log) =>
          // Chỉ lấy log loại WARNING (cảnh báo ngưỡng)
          (log.log === EDeviceLog.WARNING || log.log === EDeviceLog.ERROR ||
            log.logDescription?.toLowerCase().includes("ngưỡng")) &&
          // Chỉ lấy log của thiết bị được cấp quyền
          permittedDeviceIds.includes(log.deviceId)
      );
      setFilteredLogs(filtered);
    } else if (!isLoadingPermissions && permittedDeviceIds.length === 0) {
      // Nếu không có thiết bị được cấp, không hiển thị log nào
      setFilteredLogs([]);
    }
  }, [systemLogs, permittedDeviceIds, isLoadingPermissions]);

  const getAlertIcon = (log: SystemLog) => {
    if (
      log.logDescription?.toLowerCase().includes("vượt") ||
      log.logDescription?.toLowerCase().includes("cao")
    ) {
      return <TrendingUp className="text-red-500" size={20} />;
    }
    return <TrendingDown className="text-blue-500" size={20} />;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString("vi-VN");
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Nhật Ký Cảnh báo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Cảnh báo ngưỡng của các thiết bị được cấp quyền
        </p>
      </div>

      {/* Thông báo */}
      {permittedDeviceIds.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-700 dark:text-blue-300">
            Bạn chưa được cấp quyền sử dụng thiết bị nào.
          </p>
        </div>
      )}

      {filteredLogs.length === 0 && permittedDeviceIds.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-700 dark:text-green-300">
            Không có cảnh báo ngưỡng nào.
          </p>
        </div>
      )}

      {/* Danh sách logs - chỉ hiển thị khi có logs */}
      {filteredLogs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Thiết bị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Nội dung cảnh báo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Loại
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {log.device?.name || `Device #${log.deviceId}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {log.logDescription}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(log)}
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {log.log}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemLogsPage;