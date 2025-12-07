import { Navigate } from "react-router-dom";
import { devicesAPI, userDevicesAPI } from "../services/api";
import { Device } from "../interfaces/entities.interface";
import { getCurrentUserRole } from "../utils/roles";
import TemperatureHumidityCard from "../components/dashboard/TemperatureHumidityCard";
import DeviceControlCard from "../components/dashboard/DeviceControlCard";
import SystemStatusCard from "../components/dashboard/SystemStatusCard";
import ActivityChart from "../components/dashboard/ActivityChart";
import { Zap, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { LiveMonitor } from "../components/dashboard/LiveMonitor";
import { UserRole } from "../interfaces/enum";
import MotionCard from "../components/dashboard/MotionCard";

function DashboardPage() {
  // Redirect admin to admin dashboard
  const userRole = getCurrentUserRole();
  if (userRole === UserRole.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDevices() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await devicesAPI.getAll();
        const userDevicesRes = await userDevicesAPI.getOne(
          JSON.parse(localStorage.getItem("user") || "{}").id
        );
        const userDeviceIds = userDevicesRes.data.map((ud: any) => ud.deviceId);
        // Filter devices to only those assigned to the user
        const filteredDevices = res.data.filter((device) =>
          userDeviceIds.includes(device.id)
        );
        console.log("User devices:", filteredDevices);
        if (!cancelled) {
          setDevices(filteredDevices);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Fetch failed");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchDevices();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter devices by type (assuming deviceType.name or similar)
  const sensorDevices =
    devices?.filter(
      (d: Device) =>
        d.name?.toLowerCase().includes("cảm biến") ||
        d.deviceType?.name?.toLowerCase().includes("cảm biến") ||
        d.description?.toLowerCase().includes("temperature")
    ) || [];

  const isMotionSensor = (name: string) => {
    return (
      name.toLowerCase().includes("motion") ||
      name.toLowerCase().includes("chuyển động")
    );
  };

  const isTempHumSensor = (name: string) => {
    return (
      name.toLowerCase().includes("nhiệt độ") ||
      name.toLowerCase().includes("độ ẩm") ||
      name.toLowerCase().includes("temperature") ||
      name.toLowerCase().includes("humidity")
    );
  };

  const lightDevices =
    (Array.isArray(devices) ? devices : []).filter(
      (d: Device) =>
        d.deviceType?.name?.toLowerCase().includes("light") ||
        d.description?.toLowerCase().includes("đèn") ||
        d.location?.toLowerCase().includes("đèn") ||
        d.location?.toLowerCase().includes("light")
    ) || [];

  const fanDevices =
    (Array.isArray(devices) ? devices : []).filter(
      (d: Device) =>
        d.deviceType?.name?.toLowerCase().includes("fan") ||
        d.description?.toLowerCase().includes("quạt") ||
        d.location?.toLowerCase().includes("quạt") ||
        d.location?.toLowerCase().includes("fan")
    ) || [];

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Quản lý và theo dõi hệ thống nhà thông minh
        </p>
      </div>

      {/* --- PHẦN MỚI: Màn hình giám sát thời gian thực qua MQTT --- */}
      {/* <LiveMonitor /> */}
      {/* -------------------------------------------------------- */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensorDevices.length > 0 ? (
          sensorDevices.map((device: Device) =>
            isMotionSensor(device.name || "") ? (
              <MotionCard key={device.id} device={device} />
            ) : isTempHumSensor(device.name || "") ? (
              <TemperatureHumidityCard key={device.id} device={device} />
            ) : null
          )
        ) : (
          <div className="col-span-full text-center text-gray-500">
            Không có cảm biến để hiển thị
          </div>
        )}
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensorDevices.length}
      </div> */}

      {/* System Status & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SystemStatusCard devices={Array.isArray(devices) ? devices : []} />
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
      </div>

      {/* Device Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceControlCard
          title="Điều khiển Đèn"
          icon={Zap}
          devices={lightDevices}
        />
        <DeviceControlCard
          title="Điều khiển Quạt"
          icon={Wind}
          devices={fanDevices}
        />
      </div>
    </div>
  );
}

export default DashboardPage;
