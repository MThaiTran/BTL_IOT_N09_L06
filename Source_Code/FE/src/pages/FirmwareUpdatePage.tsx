import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { devicesAPI } from '../services/api';
import { Device } from '../types';
import { UploadCloud, RefreshCcw, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface FirmwareProgress {
  [deviceId: number]: {
    status: 'idle' | 'updating' | 'success';
    percent: number;
    version: string;
  };
}

function FirmwareUpdatePage() {
  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesAPI.getAll().then((res) => res.data),
  });

  const [progress, setProgress] = useState<FirmwareProgress>({});

  const handleUpdate = (device: Device) => {
    if (!device) return;

    setProgress((prev) => ({
      ...prev,
      [device.id]: {
        status: 'updating',
        percent: 0,
        version:
          prev[device.id]?.version ||
          `v${(Math.random() * 2 + 1).toFixed(1)}`,
      },
    }));

    const updateInterval = setInterval(() => {
      setProgress((prev) => {
        const current = prev[device.id];
        if (!current) return prev;
        const newPercent = Math.min(current.percent + Math.random() * 20, 100);
        const status = newPercent >= 100 ? 'success' : 'updating';
        return {
          ...prev,
          [device.id]: {
            ...current,
            percent: newPercent,
            status,
          },
        };
      });
    }, 600);

    setTimeout(() => {
      clearInterval(updateInterval);
      setProgress((prev) => ({
        ...prev,
        [device.id]: {
          ...(prev[device.id] || {
            version: `v${(Math.random() * 2 + 1).toFixed(1)}`,
          }),
          percent: 100,
          status: 'success',
        },
      }));
      toast.success(`Cập nhật OTA cho ${device.name} thành công`);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Cập nhật Firmware OTA
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Đẩy firmware mới cho các thiết bị thông minh từ xa
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thiết bị
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vị trí
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Firmware
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tiến trình
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-gray-500">
                      <RefreshCcw className="animate-spin" size={18} />
                      Đang tải danh sách thiết bị...
                    </div>
                  </td>
                </tr>
              ) : devices && devices.length > 0 ? (
                devices.map((device) => {
                  const deviceProgress = progress[device.id];
                  return (
                    <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {device.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {device.deviceType?.name || 'Unknown type'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {device.location}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={deviceProgress?.version || 'v1.0.0'}
                            onChange={(e) =>
                              setProgress((prev) => ({
                                ...prev,
                                [device.id]: {
                                  status: 'idle',
                                  percent: 0,
                                  version: e.target.value,
                                },
                              }))
                            }
                            className="w-24 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          {deviceProgress?.status === 'success' && (
                            <span className="flex items-center gap-1 text-xs text-green-500">
                              <CheckCircle2 size={14} />
                              Mới nhất
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                deviceProgress?.status === 'success'
                                  ? 'bg-green-500'
                                  : 'bg-primary-500'
                              }`}
                              style={{
                                width: `${deviceProgress?.percent || 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {deviceProgress?.percent
                              ? `${Math.round(deviceProgress.percent)}%`
                              : '0%'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleUpdate(device)}
                          disabled={deviceProgress?.status === 'updating'}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UploadCloud size={18} />
                          {deviceProgress?.status === 'updating'
                            ? 'Đang cập nhật...'
                            : 'Cập nhật OTA'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Chưa có thiết bị nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FirmwareUpdatePage;

