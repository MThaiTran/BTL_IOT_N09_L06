import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { SystemLog} from '../interfaces/entities.interface';
import { EDeviceLog } from '../interfaces/enum';

interface ThresholdAlertProps {
  logs: SystemLog[];
  permittedDeviceIds?: number[];
}

interface DisplayAlert {
  id: number;
  deviceName: string;
  location: string;
  description: string;
  timestamp: Date;
}

export const ThresholdAlert: React.FC<ThresholdAlertProps> = ({
  logs,
  permittedDeviceIds = [],
}) => {
  const [alerts, setAlerts] = useState<DisplayAlert[]>([]);

  useEffect(() => {
    if (!logs || logs.length === 0) return;

    // Lọc chỉ những logs là WARNING (cảnh báo vượt ngưỡng)
    const thresholdWarnings = logs.filter(
      (log) =>
        log.log === EDeviceLog.WARNING &&
        (permittedDeviceIds.length === 0 ||
          permittedDeviceIds.includes(log.deviceId))
    );

    // Chuyển đổi logs thành alerts để hiển thị
    const newAlerts: DisplayAlert[] = thresholdWarnings
      .slice(-5) // Chỉ lấy 5 cảnh báo gần nhất
      .map((log) => ({
        id: log.id,
        deviceName: log.device?.name || `Device #${log.deviceId}`,
        location: log.device?.location || 'Unknown',
        description: log.logDescription,
        timestamp: new Date(log.createdAt),
      }));

    setAlerts(newAlerts);
  }, [logs, permittedDeviceIds]);

  // Xóa cảnh báo từ danh sách
  const dismissAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // Nếu không có cảnh báo, không hiển thị gì
  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-50 max-w-md">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-yellow-500 p-4 animate-slideIn"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle className="text-yellow-500" size={20} />
            </div>

            {/* Nội dung */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {alert.deviceName}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                📍 {alert.location}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                {alert.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {alert.timestamp.toLocaleTimeString('vi-VN')}
              </p>
            </div>

            {/* Nút đóng */}
            <button
              onClick={() => dismissAlert(alert.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThresholdAlert;

