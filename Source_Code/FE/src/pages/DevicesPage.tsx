import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { devicesAPI, deviceTypesAPI } from '../services/api';
import { Device, DeviceType, CreateDeviceDto } from '../types';
import { getAuth } from '../utils/auth';
import { canViewAllDevices } from '../utils/roles';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import DeviceModal from '../components/devices/DeviceModal';

function DevicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const queryClient = useQueryClient();

  const { user } = getAuth();
  const canViewAll = canViewAllDevices();

  const { data: allDevices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesAPI.getAll().then((res) => res.data),
  });

  // Filter devices based on role: House Owner only sees their devices
  const devices = canViewAll
    ? allDevices
    : allDevices?.filter((d) => d.userId === user?.id) || [];

  const { data: deviceTypes } = useQuery({
    queryKey: ['device-types'],
    queryFn: () => deviceTypesAPI.getAll().then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => devicesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Xóa thiết bị thành công');
    },
    onError: () => {
      toast.error('Xóa thiết bị thất bại');
    },
  });

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
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Thêm thiết bị
        </button>
      </div>

      {/* Devices Grid */}
      {devices && devices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              deviceType={deviceTypes?.find((dt) => dt.id === device.deviceTypeId)}
              onEdit={handleEdit}
              onDelete={(id) => {
                if (window.confirm('Bạn có chắc muốn xóa thiết bị này?')) {
                  deleteMutation.mutate(id);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Settings className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400 mb-4">Chưa có thiết bị nào</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Thêm thiết bị đầu tiên
          </button>
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

interface DeviceCardProps {
  device: Device;
  deviceType?: DeviceType;
  onEdit: (device: Device) => void;
  onDelete: (id: number) => void;
}

function DeviceCard({ device, deviceType, onEdit, onDelete }: DeviceCardProps) {
  const isOnline = device.lastestDeviceUpdate
    ? new Date(device.lastestDeviceUpdate).getTime() > Date.now() - 60000
    : false;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {device.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{device.location}</p>
        </div>
        <div
          className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      </div>

      {/* Device Info */}
      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <span className="text-gray-600 dark:text-gray-400">Loại thiết bị: </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {deviceType?.name || `ID: ${device.deviceTypeId}`}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-gray-600 dark:text-gray-400">Ngưỡng: </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {device.thresholdLow} - {device.thresholdHigh}
          </span>
        </div>
        {device.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {device.description}
          </p>
        )}
      </div>

      {/* Actions */}
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
    </div>
  );
}

export default DevicesPage;

