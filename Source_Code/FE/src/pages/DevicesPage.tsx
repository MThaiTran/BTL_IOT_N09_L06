import { useState, useEffect } from 'react';
import { devicesAPI, deviceTypesAPI } from '../services/api';
import { Device, DeviceType } from '../types';
import { getAuth } from '../utils/auth';
import { canViewAllDevices, canManageDevices } from '../utils/roles';
import { Plus, Edit, Trash2, Settings, Power } from 'lucide-react'; // Thêm icon Power
import toast from 'react-hot-toast';
import DeviceModal from '../components/devices/DeviceModal';
import { useMqttData } from '../services/useMqttData'; // 1. Import Hook MQTT

function DevicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Lấy dữ liệu Relay từ MQTT
  const { relayData } = useMqttData();
  console.log("Relay Data in DevicesPage:", relayData);
  const { user } = getAuth();
  const canViewAll = canViewAllDevices();
  const canManipulateDevices = canManageDevices();

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [devicesRes, deviceTypesRes] = await Promise.all([
          devicesAPI.getAll(),
          deviceTypesAPI.getAll(),
        ]);
        if (!cancelled) {
          setAllDevices(devicesRes.data);
          setDeviceTypes(deviceTypesRes.data);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Fetch failed");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const devices = canViewAll
    ? allDevices
    : (Array.isArray(allDevices) ? allDevices : []).filter((d) => {
      return true; // Logic filter theo user
    }) || [];

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa thiết bị này?')) {
      return;
    }
    try {
      await devicesAPI.delete(id);
      toast.success('Xóa thiết bị thành công');
      const devicesRes = await devicesAPI.getAll();
      setAllDevices(devicesRes.data);
    } catch (err: any) {
      toast.error(err.message ?? 'Xóa thiết bị thất bại');
      setError(err.message ?? 'Xóa thiết bị thất bại');
    }
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingDevice(null);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingDevice(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quản lý Thiết bị
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Thêm, chỉnh sửa và quản lý các thiết bị IoT
          </p>
        </div>
        {canManipulateDevices && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Thêm thiết bị
          </button>
        )}
      </div>

      {/* Devices Grid */}
      {(Array.isArray(devices) && devices.length > 0) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              deviceType={(Array.isArray(deviceTypes) ? deviceTypes : []).find((dt) => dt.id === device.deviceTypeId)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canManipulate={canManipulateDevices}
              relayData={relayData} // 3. Truyền dữ liệu Relay xuống card
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Settings className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400 mb-4">Chưa có thiết bị nào</p>
          {canManipulateDevices && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <Plus size={20} />
              Thêm thiết bị đầu tiên
            </button>
          )}
        </div>
      )}

      {/* Device Modal */}
      {isModalOpen && (
        <DeviceModal
          device={editingDevice}
          deviceTypes={deviceTypes || []}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

// 4. Cập nhật Interface Props
interface DeviceCardProps {
  device: Device;
  deviceType?: DeviceType;
  onEdit: (device: Device) => void;
  onDelete: (id: number) => void;
  canManipulate: boolean;
  relayData: { relay1: number, relay2: number }; // Thêm kiểu dữ liệu relay
}

function DeviceCard({ device, deviceType, onEdit, onDelete, canManipulate, relayData }: DeviceCardProps) {
  const isOnline = device.lastestDeviceUpdate
    ? new Date(device.lastestDeviceUpdate).getTime() > Date.now() - 60000
    : false;

  // 5. Logic xác định trạng thái thật (ON/OFF) dựa trên tên thiết bị
  const getDeviceRealStatus = () => {
    const name = device.name.toLowerCase();
    // Logic map tên -> relay
    if (name.includes('đèn') || name.includes('light')) return relayData.relay1 === 1;
    if (name.includes('quạt') || name.includes('fan')) return relayData.relay2 === 1;
    return null; // Không phải thiết bị điều khiển (ví dụ cảm biến)
  };

  const isOn = getDeviceRealStatus();
  // Nếu isOn là null (cảm biến) thì không hiện badge ON/OFF

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {device.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{device.location}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
            {/* Chấm tròn Online/Offline (Database connection) */}
            <div
                className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                title={isOnline ? 'Database Connected' : 'Lost Connection'}
            />
        </div>
      </div>

      {/* 6. Hiển thị trạng thái ON/OFF thật */}
      {isOn !== null && (
          <div className={`absolute top-6 right-6 px-2 py-1 rounded text-xs font-bold border ${
              isOn 
              ? 'bg-green-100 text-green-700 border-green-200' 
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
              {isOn ? 'ĐANG BẬT' : 'ĐANG TẮT'}
          </div>
      )}

      {/* Device Info */}
      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <span className="text-gray-600 dark:text-gray-400">Loại thiết bị: </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {deviceType?.name || `ID: ${device.deviceTypeId}`}
          </span>
        </div>
        
        {/* Chỉ hiện ngưỡng nếu là cảm biến */}
        {isOn === null && (
            <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Ngưỡng: </span>
            <span className="font-medium text-gray-900 dark:text-white">
                {device.thresholdLow} - {device.thresholdHigh}
            </span>
            </div>
        )}

        {device.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {device.description}
          </p>
        )}
      </div>

      {/* Actions */}
      {canManipulate && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onEdit(device)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <Edit size={16} />
            Chỉnh sửa
          </button>
          <button
            onClick={() => onDelete(device.id)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default DevicesPage;