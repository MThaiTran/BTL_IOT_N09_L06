import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

// Mock data - Replace with actual API data
const generateMockData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      temperature: 20 + Math.random() * 10,
      humidity: 50 + Math.random() * 30,
    });
  }
  return data;
};

const chartData = generateMockData();

function ActivityChart() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
          <Activity className="text-primary-600 dark:text-primary-400" size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Biểu đồ hoạt động</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#f97316"
            strokeWidth={2}
            name="Nhiệt độ (°C)"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="humidity"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Độ ẩm (%)"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ActivityChart;

