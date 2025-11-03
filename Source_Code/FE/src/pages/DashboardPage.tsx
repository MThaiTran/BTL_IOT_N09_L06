import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { devicesAPI } from '../services/api';
import { Device } from '../types';
import TemperatureHumidityCard from '../components/dashboard/TemperatureHumidityCard';
import DeviceControlCard from '../components/dashboard/DeviceControlCard';
import SystemStatusCard from '../components/dashboard/SystemStatusCard';
import ActivityChart from '../components/dashboard/ActivityChart';
import { Zap, Wind } from 'lucide-react';

function DashboardPage() {
    const { data: devices, isLoading } = useQuery({
        queryKey: ['devices'],
        queryFn: () => devicesAPI.getAll().then((res) => res.data),
        refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    });

    // Filter devices by type (assuming deviceType.name or similar)
    const sensorDevices = devices?.filter((d: Device) =>
        d.deviceType?.name?.toLowerCase().includes('sensor') ||
        d.description?.toLowerCase().includes('temperature')
    ) || [];

    const lightDevices = devices?.filter((d: Device) =>
        d.deviceType?.name?.toLowerCase().includes('light') ||
        d.description?.toLowerCase().includes('đèn')
    ) || [];

    const fanDevices = devices?.filter((d: Device) =>
        d.deviceType?.name?.toLowerCase().includes('fan') ||
        d.description?.toLowerCase().includes('quạt')
    ) || [];

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
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Quản lý và theo dõi hệ thống nhà thông minh
                </p>
            </div>

            {/* Real-time Sensor Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sensorDevices.length > 0 ? (
                    sensorDevices.map((device: Device) => (
                        <TemperatureHumidityCard key={device.id} device={device} />
                    ))
                ) : (
                    <>
                        <TemperatureHumidityCard />
                        <TemperatureHumidityCard />
                    </>
                )}
            </div>

            {/* Device Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Light Control */}
                <DeviceControlCard
                    title="Điều khiển Đèn"
                    icon={Zap}
                    devices={lightDevices}
                    deviceType="light"
                />

                {/* Fan Control */}
                <DeviceControlCard
                    title="Điều khiển Quạt"
                    icon={Wind}
                    devices={fanDevices}
                    deviceType="fan"
                />
            </div>

            {/* System Status & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SystemStatusCard devices={devices || []} />
                <div className="lg:col-span-2">
                    <ActivityChart />
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;

