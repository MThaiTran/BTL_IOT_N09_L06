import { Thermometer, Droplets, Wifi, WifiOff } from 'lucide-react';
import { Device } from '../../../types';
import { format } from 'date-fns';

interface TemperatureHumidityCardProps {
  device?: Device;
}

// Mock real-time data - Replace with actual Firebase/WebSocket data
const getMockSensorData = () => {
  return {
    temperature: 25.5 + Math.random() * 5,
    humidity: 60 + Math.random() * 20,
    timestamp: new Date(),
  };
};

function TemperatureHumidityCard({ device }: TemperatureHumidityCardProps) {
  const sensorData = getMockSensorData();
  const isOnline = device ? new Date(device.lastestDeviceUpdate || 0).getTime() > Date.now() - 60000 : true;

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {device?.name || 'Sensor 1'}
        </h3>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi size={16} className="text-green-500" />
              <span className="text-xs text-green-500">Online</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-gray-400" />
              <span className="text-xs text-gray-400">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Temperature */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Thermometer size={20} className="text-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Nhiệt độ</span>
          </div>
          <span className={`text-2xl font-bold ${getTempColor(sensorData.temperature)}`}>
            {sensorData.temperature.toFixed(1)}°C
          </span>
        </div>
        {device && (
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Ngưỡng: {device.thresholdLow}°C - {device.thresholdHigh}°C
          </div>
        )}
      </div>

      {/* Humidity */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Droplets size={20} className="text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Độ ẩm</span>
          </div>
          <span className={`text-2xl font-bold ${getHumidityColor(sensorData.humidity)}`}>
            {sensorData.humidity.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Location & Last Update */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{device?.location || 'Phòng khách'}</span>
          <span>{format(sensorData.timestamp, 'HH:mm:ss')}</span>
        </div>
      </div>
    </div>
  );
}

export default TemperatureHumidityCard;

