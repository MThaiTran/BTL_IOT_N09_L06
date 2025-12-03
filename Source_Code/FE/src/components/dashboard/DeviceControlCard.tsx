import { useState } from 'react';
import { Device } from '../../types';
import { LucideIcon, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeviceControlCardProps {
  title: string;
  icon: LucideIcon;
  devices: Device[];
}

function DeviceControlCard({ title, icon: Icon, devices }: DeviceControlCardProps) {
  const [autoMode, setAutoMode] = useState<Record<number, boolean>>({});

  // Mock device states - Replace with actual API calls
  const [deviceStates, setDeviceStates] = useState<Record<number, boolean>>(
    devices.reduce((acc, d) => ({ ...acc, [d.id]: false }), {})
  );

  const toggleDevice = (deviceId: number) => {
    setDeviceStates((prev) => {
      const newState = !prev[deviceId];
      toast.success(newState ? 'Đã bật thiết bị' : 'Đã tắt thiết bị');
      // TODO: Call API to update device state
      return { ...prev, [deviceId]: newState };
    });
  };

  const toggleAutoMode = (deviceId: number) => {
    setAutoMode((prev) => {
      const newMode = !prev[deviceId];
      toast.success(newMode ? 'Đã bật chế độ tự động' : 'Đã tắt chế độ tự động');
      // TODO: Call API to update auto mode
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
          Chưa có thiết bị nào được thêm. Vui lòng thêm thiết bị trong trang Quản lý thiết bị.
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
          const isOn = deviceStates[device.id] || false;
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
                  {isOn ? 'Đang bật' : 'Đang tắt'}
                </span>
                <button
                  onClick={() => toggleDevice(device.id)}
                  disabled={isAuto}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${isOn ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}
                    ${isAuto ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${isOn ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
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

