// src/components/dashboard/SensorCard.tsx
import React from 'react';

interface SensorCardProps {
  label: string;
  value: number;
  unit: string;
  color: 'red' | 'blue' | 'yellow'; // Quy định màu
  icon?: React.ReactNode;
}

const colorClasses = {
  red: 'bg-red-50 text-red-600 border-red-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
};

export const SensorCard: React.FC<SensorCardProps> = ({ label, value, unit, color, icon }) => {
  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]} flex flex-col items-center justify-center shadow-sm`}>
      <div className="mb-2">{icon}</div>
      <span className="text-gray-500 text-sm font-medium">{label}</span>
      <span className="text-3xl font-bold mt-1">
        {value} <span className="text-lg">{unit}</span>
      </span>
    </div>
  );
};