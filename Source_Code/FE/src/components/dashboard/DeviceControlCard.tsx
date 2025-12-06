import { useState } from "react";
import toast from "react-hot-toast";
import { useMqttData } from "../../services/useMqttData";
import { devicesAPI } from "../../services/api";
import { DeviceControlCardProps } from "../../interfaces/ui-props.interface";
import { Device } from "../../interfaces/entities.interface";

function DeviceControlCard({
  title,
  icon: Icon,
  devices,
}: DeviceControlCardProps) {
  // local optimistic status per device and loading flags
  const [autoMode, setAutoMode] = useState<Record<number, boolean>>({});
  const [localStatus, setLocalStatus] = useState<Record<number, number>>({});
  const [loadingDevices, setLoadingDevices] = useState<Record<number, boolean>>({});

  //const { relayData, sendCommand } = useMqttData();

  const getDeviceLabel = (device: Device) =>
    device.location ?? device.description ?? device.name;

  // Use device.status (fallback to localStatus for optimistic update)
  const isDeviceOn = (device: Device) => {
    const status = localStatus[device.id] ?? (device as any).status ?? 0;
    return Number(status) === 1;
  };

  // helper: xác định thiết bị là đèn
  const isLightDevice = (device: Device) => {
    const check = (
      device.deviceType?.name ||
      device.name ||
      device.description ||
      device.location ||
      ""
    ).toLowerCase();
    return check.includes("đèn") || check.includes("light");
  };

  // chỉ cho Auto mode khi device là đèn và location = "cầu thang"
  const canAutoMode = (device: Device) =>
    isLightDevice(device) && (device.location ?? "").toLowerCase() === "cầu thang";

  const toggleDevice = async (device: Device) => {
    // determine current and next status
    const current = localStatus[device.id] ?? (device as any).status ?? 0;
    const next = current === 1 ? 0 : 1;
    
    // optimistic update
    setLocalStatus((prev) => ({ ...prev, [device.id]: next }));
    setLoadingDevices((prev) => ({ ...prev, [device.id]: true }));

    try {
      // call backend to update state; backend will handle MQTT publish
      await devicesAPI.update(device.id, { 
        state: Boolean(next),
        autoMode: autoMode[device.id] ?? false
      });
      toast.success("Yêu cầu gửi đến hệ thống");
      console.info("Device status updated:", device.id, "state:", Boolean(next));
    } catch (err: any) {
      // rollback on error
      setLocalStatus((prev) => ({ ...prev, [device.id]: current }));
      console.error("Update device failed:", err);
      toast.error(err?.response?.data?.message ?? "Gửi trạng thái thất bại");
    } finally {
      setLoadingDevices((prev) => ({ ...prev, [device.id]: false }));
    }
  };

  const toggleAutoMode = async (deviceId: number) => {
    // không cho toggle nếu device không đủ điều kiện
    const dev = devices.find((d) => d.id === deviceId);
    if (!dev || !canAutoMode(dev)) return;

    // optimistic update
    const newAutoMode = !autoMode[deviceId];
    setAutoMode((prev) => ({ ...prev, [deviceId]: newAutoMode }));
    setLoadingDevices((prev) => ({ ...prev, [deviceId]: true }));

    try {
      // send autoMode status to backend
      await devicesAPI.update(deviceId, {
        autoMode: newAutoMode,
        state: isDeviceOn(dev)
      });
      toast.success(`Chế độ ${newAutoMode ? 'tự động' : 'thủ công'} được bật`);
      console.info("AutoMode toggled for device:", deviceId, "autoMode:", newAutoMode);
    } catch (err: any) {
      // rollback on error
      setAutoMode((prev) => ({ ...prev, [deviceId]: !newAutoMode }));
      console.error("Update autoMode failed:", err);
      toast.error(err?.response?.data?.message ?? "Cập nhật chế độ thất bại");
    } finally {
      setLoadingDevices((prev) => ({ ...prev, [deviceId]: false }));
    }
  };

  if (!devices || devices.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500">Không có thiết bị</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="text-primary-600" />}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      </div>

      <div className="space-y-3">
        {devices.map((device) => {
          const on = isDeviceOn(device);
          const label = getDeviceLabel(device);
          return (
            <div key={device.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{device.name}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>

              <div className="flex items-center gap-3">
                {canAutoMode(device) && (
                  <button
                    onClick={() => toggleAutoMode(device.id)}
                    className="text-xs px-2 py-1 border rounded"
                  >
                    {autoMode[device.id] ? "Auto" : "Manual"}
                  </button>
                )}

                <button
                  onClick={() => toggleDevice(device)}
                  disabled={autoMode[device.id] || loadingDevices[device.id]}
                  className={`px-3 py-1 rounded ${
                    on ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {loadingDevices[device.id] ? "..." : on ? "BẬT" : "TẮT"}
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
