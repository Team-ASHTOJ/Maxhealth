import React from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Wind, MapPin, Clock } from 'lucide-react';

dayjs.extend(utc);
dayjs.extend(timezone);

const LiveAQI = ({ aqiData }) => {
  const { t } = useTranslation();

  if (!aqiData) return null;

  const { aqi, category, timestamp, components, mock } = aqiData;

  const getAQIGradient = (aqi) => {
    if (aqi <= 50) return 'from-green-400 to-green-600';
    if (aqi <= 100) return 'from-yellow-400 to-yellow-600';
    if (aqi <= 150) return 'from-orange-400 to-orange-600';
    if (aqi <= 200) return 'from-red-400 to-red-600';
    if (aqi <= 300) return 'from-purple-400 to-purple-600';
    return 'from-red-700 to-red-900';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Wind className="w-5 h-5" />
          {t('liveAQI')}
        </h2>
        {mock && (
          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
            Demo Data
          </span>
        )}
      </div>

      {/* AQI Display */}
      <div className={`bg-gradient-to-br ${getAQIGradient(aqi)} rounded-lg p-6 text-white mb-4`}>
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">{aqi}</div>
          <div className="text-xl font-semibold">{t(category.levelKey)}</div>
          <div className="text-sm opacity-90 mt-2">{t(category.descriptionKey)}</div>
        </div>
      </div>

      {/* Location and Time */}
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{t('delhiIndia')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>
            {dayjs.utc(timestamp).tz('Asia/Kolkata').format('h:mm:ss A')}
          </span>
        </div>
      </div>

      {/* Components Breakdown */}
      {components && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">PM2.5</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {components.pm2_5?.toFixed(1)}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">PM10</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {components.pm10?.toFixed(1)}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">O₃</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {components.o3?.toFixed(1)}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">NO₂</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {components.no2?.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAQI;