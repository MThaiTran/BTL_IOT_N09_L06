// src/components/dashboard/LiveMonitor.tsx
import { useMqttData } from "../../services/useMqttData";
import { SensorCard } from "./SensorCard";
import { Thermometer, Droplets, Zap, AlertCircle } from "lucide-react";

export const LiveMonitor = () => {
  const { statusData, status } = useMqttData();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mt-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Zap className="text-yellow-500" />
          Giám sát Thời gian thực
        </h2>
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${
            status === "Connected"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {status === "Connected" ? "● Live" : "○ Offline"}
        </span>
      </div>

      {/* Phần Cảm biến */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SensorCard
          label="Nhiệt độ"
          value={statusData?.sensors.temp ?? 0}
          unit="°C"
          color="red"
          icon={<Thermometer size={24} />}
        />
        <SensorCard
          label="Độ ẩm"
          value={statusData?.sensors.hum ?? 0}
          unit="%"
          color="blue"
          icon={<Droplets size={24} />}
        />
        <SensorCard
          label="Cảm biến chuyển động"
          value={statusData?.sensors.motion ? "Có" : "Không"}
          unit=""
          color={statusData?.sensors.motion ? "yellow" : "blue"}
          icon={<AlertCircle size={24} />}
        />
      </div>

      {/* Phần Trạng thái Relay (Nhỏ gọn phía dưới) */}
      {/* <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
         <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Đèn (Relay 1)</span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${relayData.relay1 === 1 ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"}`}>
               {relayData.relay1 === 1 ? "ON" : "OFF"}
            </span>
         </div>
         <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Quạt (Relay 2)</span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${relayData.relay2 === 1 ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"}`}>
               {relayData.relay2 === 1 ? "ON" : "OFF"}
            </span>
         </div>
      </div> */}
    </div>
  );
};
