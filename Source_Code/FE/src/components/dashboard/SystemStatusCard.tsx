import { Status } from "../../interfaces/enum";
import { SystemStatusCardProps } from "../../interfaces/ui-props.interface";
import { CheckCircle, XCircle, AlertCircle, Activity } from "lucide-react";

function SystemStatusCard({ devices }: SystemStatusCardProps) {
  const onlineDevices = devices.filter(
    (device) => device.status === Status.ACTIVE
  ).length;

  const offlineDevices = devices.length - onlineDevices;
  const totalDevices = devices.length;

  const getStatusColor = (status: "good" | "warning" | "error") => {
    switch (status) {
      case "good":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
    }
  };

  const getStatusBg = (status: "good" | "warning" | "error") => {
    switch (status) {
      case "good":
        return "bg-green-100 dark:bg-green-900/20";
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-900/20";
      case "error":
        return "bg-red-100 dark:bg-red-900/20";
    }
  };

  const systemHealth =
    offlineDevices === 0
      ? "good"
      : offlineDevices / totalDevices > 0.5
      ? "error"
      : "warning";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${getStatusBg(systemHealth)}`}>
          <Activity className={getStatusColor(systemHealth)} size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Trạng thái hệ thống
        </h3>
      </div>

      <div className="space-y-4">
        {/* System Health */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Tình trạng hệ thống
            </span>
            <span
              className={`text-sm font-semibold ${getStatusColor(
                systemHealth
              )}`}
            >
              {systemHealth === "good"
                ? "Bình thường"
                : systemHealth === "warning"
                ? "Cảnh báo"
                : "Lỗi"}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                systemHealth === "good"
                  ? "bg-green-500"
                  : systemHealth === "warning"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{
                width: `${(onlineDevices / Math.max(totalDevices, 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Device Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={20} />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {onlineDevices}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Thiết bị online
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="text-red-500" size={20} />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {offlineDevices}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Thiết bị offline
              </div>
            </div>
          </div>
        </div>

        {/* Total Devices */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Tổng số thiết bị
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {totalDevices}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemStatusCard;
