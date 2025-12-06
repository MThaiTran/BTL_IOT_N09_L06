import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { devicesAPI } from "../../services/api";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { getAuth } from "../../utils/auth";
import { DeviceModalProps } from "../../interfaces/ui-props.interface";
import {
  CreateDeviceDto,
  UpdateDeviceDto,
} from "../../interfaces/dtos.interface";

function DeviceModal({ device, deviceTypes, onClose }: DeviceModalProps) {
  const { user } = getAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    firebasePath: "",
    description: "",
    location: "",
    thresholdLow: 0,
    thresholdHigh: 100,
    deviceTypeId: deviceTypes[0]?.id || 0,
  });

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name,
        firebasePath: device.firebasePath,
        description: device.description,
        location: device.location,
        thresholdLow: device.thresholdLow,
        thresholdHigh: device.thresholdHigh,
        deviceTypeId: device.deviceTypeId,
      });
    }
  }, [device]);

  const createMutation = useMutation({
    mutationFn: (data: CreateDeviceDto) => devicesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Thêm thiết bị thành công");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Thêm thiết bị thất bại");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDeviceDto }) =>
      devicesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Cập nhật thiết bị thành công");
      onClose();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Cập nhật thiết bị thất bại"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (device) {
      updateMutation.mutate({
        id: device.id,
        data: formData,
      });
    } else {
      if (!user?.id) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }
      createMutation.mutate({
        ...formData,
        userId: user.id,
      } as CreateDeviceDto);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {device ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên thiết bị *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ví dụ: Đèn phòng khách"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Firebase Path *
            </label>
            <input
              type="text"
              required
              value={formData.firebasePath}
              onChange={(e) =>
                setFormData({ ...formData, firebasePath: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ví dụ: devices/room1/sensor1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vị trí *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ví dụ: Phòng khách"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Loại thiết bị *
            </label>
            <select
              required
              value={formData.deviceTypeId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deviceTypeId: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {deviceTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  {dt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ngưỡng thấp
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.thresholdLow}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    thresholdLow: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ngưỡng cao
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.thresholdHigh}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    thresholdHigh: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Mô tả thiết bị..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Đang xử lý..."
                : device
                ? "Cập nhật"
                : "Thêm mới"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeviceModal;
