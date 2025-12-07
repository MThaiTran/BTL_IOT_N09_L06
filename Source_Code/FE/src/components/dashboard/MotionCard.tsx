import { Wifi, WifiOff, Sun } from "lucide-react";
import { format } from "date-fns";
// 1. Import Hook để lấy dữ liệu MQTT
import { useMqttData } from "../../services/useMqttData";
import { TemperatureHumidityCardProps } from "../../interfaces/ui-props.interface";

function MotionCard({ device }: TemperatureHumidityCardProps) {
  // 2. Gọi Hook để lấy dữ liệu thực tế (Temp, Hum, Lux) và trạng thái kết nối
  const { statusData, status } = useMqttData();

  // Kiểm tra trạng thái Online dựa vào kết nối MQTT
  const isOnline = status === "Connected";

  // Hàm màu cho ánh sáng
  const getLuxColor = (lux: number) => {
    if (lux < 300) return "text-gray-500"; // Tối
    if (lux > 1000) return "text-yellow-500"; // Sáng mạnh
    return "text-orange-400"; // Bình thường
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header: Tên thiết bị và Trạng thái mạng */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {device?.name || "Cảm biến môi trường"}
        </h3>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi size={16} className="text-green-500" />
              <span className="text-xs text-green-500">Live</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-gray-400" />
              <span className="text-xs text-gray-400">Connecting...</span>
            </>
          )}
        </div>
      </div>

      {/* --- PHẦN 3: ÁNH SÁNG  --- */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sun size={20} className="text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Chuyển động
            </span>
          </div>
          {/* Sử dụng data.lux từ MQTT */}
          <span
            className={`text-2xl font-bold ${getLuxColor(
              statusData?.sensors.motion ? 1 : 0
            )}`}
          >
            {statusData?.sensors.motion ? 1 : 0}
          </span>
        </div>
      </div>

      {/* Footer: Vị trí và thời gian cập nhật */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{device?.location || "Phòng giám sát"}</span>
          <span>Cập nhật: {format(new Date(), "HH:mm:ss")}</span>
        </div>
      </div>
    </div>
  );
}

export default MotionCard;
