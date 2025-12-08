import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { logsAPI, userDevicesAPI } from "../services/api";
import { SystemLog } from "../interfaces/entities.interface";
import { getCurrentUserId } from "../utils/roles";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";

function SystemLogsPage() {
  const userId = getCurrentUserId();
  const [permittedDeviceIds, setPermittedDeviceIds] = useState<number[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);

  // Lấy danh sách thiết bị được cấp quyền
  const { data: userDevices } = useQuery({
    queryKey: ["userDevices", userId],
    queryFn: () => userDevicesAPI.getOne(userId!).then((res) => res.data),
    enabled: !!userId,
  });

  useEffect(() => {
    if (userDevices) {
      const deviceIds = userDevices.map((ud: any) => ud.deviceId);
      setPermittedDeviceIds(deviceIds);
    }
  }, [userDevices]);

  // Lấy tất cả logs
  const { data: allLogs, isLoading } = useQuery({
    queryKey: ["systemLogs"],
    queryFn: () => logsAPI.getAll().then((res) => res.data),
  });

  // Lọc logs: chỉ cảnh báo ngưỡng của thiết bị được cấp
  useEffect(() => {
    if (allLogs && permittedDeviceIds.length > 0) {
      const filtered = allLogs.filter(
        (log) =>
          // Chỉ lấy log về cảnh báo ngưỡng
          (log.type === "threshold_alert" ||
            log.type === "cảnh báo ngưỡng" ||
            log.description?.toLowerCase().includes("ngưỡng")) &&
          // Chỉ lấy log của thiết bị được cấp quyền
          permittedDeviceIds.includes(log.deviceId)
      );
      setFilteredLogs(filtered);
    }
  }, [allLogs, permittedDeviceIds]);

  const getAlertIcon = (log: SystemLog) => {
    if (
      log.description?.toLowerCase().includes("vượt") ||
      log.description?.toLowerCase().includes("cao")
    ) {
      return <TrendingUp className="text-red-500" size={20} />;
    }
    return <TrendingDown className="text-blue-500" size={20} />;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString("vi-VN");
  };

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

      {/* Danh sách logs */}
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
                    {log.deviceName || `Device #${log.deviceId}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {log.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(log)}
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Cảnh báo
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SystemLogsPage;