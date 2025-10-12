import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const ForecastChart = ({ data, pollutant }) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        {t('noData')}
      </div>
    );
  }

  const chartData = data.map(item => ({
    timestamp: dayjs.utc(item.timestamp).local().format('MMM D, h A'),
    predicted: item[`${pollutant}_pred`],
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
        <XAxis 
          dataKey="timestamp" 
          stroke="#6B7280"
          style={{ fontSize: '12px' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          stroke="#6B7280"
          style={{ fontSize: '12px' }}
          label={{ value: `${pollutant} (µg/m³)`, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: 'none',
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
        />
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Predicted"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ForecastChart;