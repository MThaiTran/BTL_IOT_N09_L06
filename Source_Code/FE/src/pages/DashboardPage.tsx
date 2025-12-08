import { Navigate } from "react-router-dom";
import { devicesAPI, userDevicesAPI, systemLogsAPI } from "../services/api";
import { Device } from "../interfaces/entities.interface";
import { getCurrentUserRole, getCurrentUserId } from "../utils/roles";
import TemperatureHumidityCard from "../components/dashboard/TemperatureHumidityCard";
import DeviceControlCard from "../components/dashboard/DeviceControlCard";
import SystemStatusCard from "../components/dashboard/SystemStatusCard";
import ActivityChart from "../components/dashboard/ActivityChart";
import ThresholdAlert from "../components/ThresholdAlert";
import { Zap, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { LiveMonitor } from "../components/dashboard/LiveMonitor";
import { UserRole } from "../interfaces/enum";
import MotionCard from "../components/dashboard/MotionCard";
import { SystemLog } from "../interfaces/entities.interface";

function DashboardPage() {
  // Redirect admin to admin dashboard
  const userRole = getCurrentUserRole();
  if (userRole === UserRole.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }
 
  const [devices, setDevices] = useState<Device[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [permittedDeviceIds, setPermittedDeviceIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDevices() {
      setIsLoading(true);
      setError(null);
      try {
        const userId = getCurrentUserId();
        
        if (!userId) {
          setError("Không thể xác định người dùng");
          setIsLoading(false);
          return;
        }

        // Lấy danh sách tất cả devices
        const res = await devicesAPI.getAll();
        
        // Lấy danh sách thiết bị được cấp quyền cho user
        const userDevicesRes = await userDevicesAPI.getOne(userId);
        const userDeviceIds = userDevicesRes.data.map((ud: any) => ud.deviceId);
       
        // Lọc chỉ những device được cấp quyền
        const filteredDevices = res.data.filter((device) =>
          userDeviceIds.includes(device.id)
        );

        // Lấy system logs
        const logsRes = await systemLogsAPI.getAll();
        if (!cancelled) {
          setSystemLogs(logsRes.data || []);
          setPermittedDeviceIds(userDeviceIds);
        }
       
         if (!cancelled) {
           setDevices(filteredDevices);
         }
       } catch (err: any) {
         if (!cancelled) {
           console.error("Fetch devices error:", err);
          setError(err?.response?.data?.message ?? err.message ?? "Không thể tải danh sách thiết bị");
         }
       } finally {
         if (!cancelled) setIsLoading(false);
       }
     }

     fetchDevices();

    // Refresh logs mỗi 10 giây
    const logsInterval = setInterval(async () => {
      try {
        const logsRes = await systemLogsAPI.getAll();
        if (!cancelled) {
          setSystemLogs(logsRes.data || []);
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    }, 10000);

     return () => {
       cancelled = true;
      clearInterval(logsInterval);
     };
   }, []);

   // Phân loại cảm biến theo tên
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

  // Phân loại thiết bị điều khiển - Đèn
   const lightDevices =
     (Array.isArray(devices) ? devices : []).filter(
       (d: Device) =>
         (d.deviceType?.name?.toLowerCase().includes("light") ||
          d.name?.toLowerCase().includes("đèn") ||
          d.description?.toLowerCase().includes("đèn") ||
          d.location?.toLowerCase().includes("đèn") ||
          d.location?.toLowerCase().includes("light")) &&
        !d.name?.toLowerCase().includes("cảm biến")
     ) || [];

  // Phân loại thiết bị điều khiển - Quạt
   const fanDevices =
     (Array.isArray(devices) ? devices : []).filter(
       (d: Device) =>
         (d.deviceType?.name?.toLowerCase().includes("fan") ||
          d.name?.toLowerCase().includes("quạt") ||
          d.description?.toLowerCase().includes("quạt") ||
          d.location?.toLowerCase().includes("quạt") ||
          d.location?.toLowerCase().includes("fan")) &&
        !d.name?.toLowerCase().includes("cảm biến")
     ) || [];

   if (isLoading) {
     return (
       <div className="flex items-center justify-center h-64">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
       </div>
     );
   }

   if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-2">Lỗi</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
   }

   return (
     <div className="space-y-6">
+      {/* Threshold Alert Notifications */}
+      <ThresholdAlert logs={systemLogs} permittedDeviceIds={permittedDeviceIds} />

       {/* Header */}
       <div className="mb-6">
         <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
           Dashboard
         </h1>
         <p className="text-gray-600 dark:text-gray-400">
          Theo dõi và điều khiển các thiết bị được cấp quyền
         </p>
       </div>

      {/* Thông báo khi không có thiết bị */}
      {devices.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-700 dark:text-blue-300">
            Bạn chưa được cấp quyền sử dụng thiết bị nào. Vui lòng liên hệ quản trị viên.
          </p>
        </div>
      )}

       {/* Phần Cảm biến */}
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

       {/* System Status & Activity */}
       {devices.length > 0 && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <SystemStatusCard devices={Array.isArray(devices) ? devices : []} />
           <div className="lg:col-span-2">
             <ActivityChart />
           </div>
         </div>
       )}

       {/* Device Controls */}
       {(lightDevices.length > 0 || fanDevices.length > 0) && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {lightDevices.length > 0 && (
             <DeviceControlCard
               title="Điều khiển Đèn"
               icon={Zap}
               devices={lightDevices}
             />
           )}
           {fanDevices.length > 0 && (
             <DeviceControlCard
               title="Điều khiển Quạt"
               icon={Wind}
               devices={fanDevices}
             />
           )}
         </div>
       )}
     </div>
   );
 }

 export default DashboardPage;
