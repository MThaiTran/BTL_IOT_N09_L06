import { Thermometer, Droplets, Wifi, WifiOff, Sun } from 'lucide-react';
import { Device } from '../../types';
import { format } from 'date-fns';
// 1. Import Hook để lấy dữ liệu MQTT
import { useMqttData } from '../../services/useMqttData'; 

interface TemperatureHumidityCardProps {
  device?: Device;
}

function TemperatureHumidityCard({ device }: TemperatureHumidityCardProps) {
  // 2. Gọi Hook để lấy dữ liệu thực tế (Temp, Hum, Lux) và trạng thái kết nối
  const { data, status } = useMqttData();

  // Kiểm tra trạng thái Online dựa vào kết nối MQTT
  const isOnline = status === 'Connected';

  const getTempColor = (temp: number) => {
    if (temp < 20) return 'text-blue-500';
    if (temp > 30) return 'text-red-500';
    return 'text-green-500';
  };

  const getHumidityColor = (humidity: number) => {
    if (humidity < 40) return 'text-orange-500';
    if (humidity > 80) return 'text-blue-500';
    return 'text-green-500';
  };

  // Hàm màu cho ánh sáng
  const getLuxColor = (lux: number) => {
    if (lux < 300) return 'text-gray-500'; // Tối
    if (lux > 1000) return 'text-yellow-500'; // Sáng mạnh
    return 'text-orange-400'; // Bình thường
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header: Tên thiết bị và Trạng thái mạng */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {device?.name || 'Cảm biến môi trường'}
        </h3>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi size={16} className="text-green-500" />
              <span className="text-xs text-green-500">Live (MQTT)</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-gray-400" />
              <span className="text-xs text-gray-400">Connecting...</span>
            </>
          )}
        </div>
      </div>

      {/* --- PHẦN 1: NHIỆT ĐỘ --- */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Thermometer size={20} className="text-red-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Nhiệt độ</span>
          </div>
          {/* Sử dụng data.temp từ MQTT */}
          <span className={`text-2xl font-bold ${getTempColor(data.temp)}`}>
            {data.temp}°C
          </span>
        </div>
        {/* Hiển thị ngưỡng từ Database (nếu có) */}
        {device && (
          <div className="text-xs text-gray-500 dark:text-gray-500 pl-7">
            Ngưỡng: {device.thresholdLow}°C - {device.thresholdHigh}°C
          </div>
        )}
      </div>

      {/* --- PHẦN 2: ĐỘ ẨM --- */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Droplets size={20} className="text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Độ ẩm</span>
          </div>
          {/* Sử dụng data.hum từ MQTT */}
          <span className={`text-2xl font-bold ${getHumidityColor(data.hum)}`}>
            {data.hum}%
          </span>
        </div>
      </div>

      {/* --- PHẦN 3: ÁNH SÁNG  --- */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sun size={20} className="text-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Chuyển động</span>
          </div>
          {/* Sử dụng data.lux từ MQTT */}
          <span className={`text-2xl font-bold ${getLuxColor(data.motion ? 1 : 0)}`}>
            {data.motion ? 1 : 0} 
          </span>
        </div>
      </div>

      {/* Footer: Vị trí và thời gian cập nhật */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{device?.location || 'Phòng giám sát'}</span>
          <span>Cập nhật: {format(new Date(), 'HH:mm:ss')}</span>
        </div>
      </div>
    </div>
  );
}

export default TemperatureHumidityCard;