// src/components/dashboard/LiveMonitor.tsx
import { useMqttData } from '../../services/useMqttData';
import { SensorCard } from './SensorCard';
import { Thermometer, Droplets, Sun } from 'lucide-react'; // Icon từ thư viện lucide-react

export const LiveMonitor = () => {
  // Gọi hook để lấy dữ liệu, không cần quan tâm logic kết nối ra sao
  const { data, status } = useMqttData();
  console.log('LiveMonitor data:', data, 'status:', status);    
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Giám sát thiết bị</h2>
        <span className={`text-xs px-2 py-1 rounded-full ${status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          MQTT: {status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SensorCard 
          label="Nhiệt độ" 
          value={data.temp} 
          unit="°C" 
          color="red" 
          icon={<Thermometer size={24}/>} 
        />
        <SensorCard 
          label="Độ ẩm" 
          value={data.hum} 
          unit="%" 
          color="blue" 
          icon={<Droplets size={24}/>} 
        />
        <SensorCard 
          label="Chuyển động" 
          value={data.motion ? 1 : 0} 
          unit="" 
          color="yellow" 
          icon={<Sun size={24}/>} 
        />
      </div>
    </div>
  );
};