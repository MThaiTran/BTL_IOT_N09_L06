import { useState, useEffect } from 'react';
import { Device } from '../../types';
import { LucideIcon, Settings, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMqttData } from '../../services/useMqttData'; // 1. Import Hook
import { MQTT_CONFIG } from '../../config/mqttConfig';   // 2. Import Config

interface DeviceControlCardProps {
  title: string;
  icon: LucideIcon;
  devices: Device[];
}

function DeviceControlCard({ title, icon: Icon, devices }: DeviceControlCardProps) {
  const [autoMode, setAutoMode] = useState<Record<number, boolean>>({});
  
  // 3. Lấy hàm gửi lệnh và dữ liệu relay từ MQTT
  const { relayData, sendCommand } = useMqttData();

  // Hàm xác định trạng thái On/Off dựa trên dữ liệu thật từ MQTT
  const isDeviceOn = (device: Device) => {
    const name = device.name.toLowerCase();
    // Logic map tên thiết bị vào Relay
    if (name.includes('đèn') || name.includes('light')) return relayData.relay1 === 1;
    if (name.includes('quạt') || name.includes('fan')) return relayData.relay2 === 1;
    return false; 
  };

  const toggleDevice = (device: Device) => {
    const name = device.name.toLowerCase();
    let topic = '';
    let message = '';
    
    // 4. Logic gửi lệnh MQTT
    if (name.includes('đèn') || name.includes('light')) {
      // Nếu đang bật (relay1=1) thì gửi 0 để tắt, và ngược lại
      topic = 'smarthome/controls/light'; // Topic điều khiển đèn
      message = relayData.relay1 === 1 ? '0' : '1';
    } 
    else if (name.includes('quạt') || name.includes('fan')) {
      topic = 'smarthome/controls/fan'; // Topic điều khiển quạt
      message = relayData.relay2 === 1 ? '0' : '1';
    }

    if (topic) {
      sendCommand(topic, message); // Gửi lệnh đi
      toast.success(`Đã gửi lệnh ${message === '1' ? 'Bật' : 'Tắt'} tới ${device.name}`);
    } else {
      toast.error('Không tìm thấy topic điều khiển cho thiết bị này');
    }
  };

  const toggleAutoMode = (deviceId: number) => {
    setAutoMode((prev) => {
      const newMode = !prev[deviceId];
      toast.success(newMode ? 'Đã bật chế độ tự động' : 'Đã tắt chế độ tự động');
      return { ...prev, [deviceId]: newMode };
    });
  };

  if (devices.length === 0) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Icon className="text-primary-600 dark:text-primary-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Chưa có thiết bị nào.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
          <Icon className="text-primary-600 dark:text-primary-400" size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>

      {/* Device List */}
      <div className="space-y-4">
        {devices.map((device) => {
          // Lấy trạng thái thật từ hàm check
          const isOn = isDeviceOn(device);
          const isAuto = autoMode[device.id] || false;

          return (
            <div
              key={device.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{device.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{device.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAutoMode(device.id)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${isAuto
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }
                    `}
                  >
                    <Settings size={14} className="inline mr-1" />
                    {isAuto ? 'Tự động' : 'Thủ công'}
                  </button>
                </div>
              </div>

              {/* Control Switch */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isOn ? 'Đang hoạt động' : 'Đã tắt'}
                </span>
                
                <button
                  onClick={() => toggleDevice(device)} // Gọi hàm điều khiển thật
                  disabled={isAuto}
                  className={`
                    relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                    ${isOn ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}
                    ${isAuto ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                      ${isOn ? 'translate-x-7' : 'translate-x-1'}
                    `}
                  />
                  <Power size={12} className={`absolute ${isOn ? 'left-2 text-white' : 'right-2 text-gray-400'}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DeviceControlCard;