import React from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

const HeatmapChart = ({ data, pollutant }) => {
  const { t } = useTranslation();

  dayjs.extend(utc);
  dayjs.extend(timezone);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        {t('noData')}
      </div>
    );
  }

  // Organize data by date and hour
  const heatmapData = {};
  data.forEach(item => {
    const date = dayjs.utc(item.timestamp).local();
    const dateKey = date.format('YYYY-MM-DD');
    const hour = date.hour();
    
    if (!heatmapData[dateKey]) {
      heatmapData[dateKey] = {};
    }
    heatmapData[dateKey][hour] = item[`${pollutant}_pred`];
  });

  const dates = Object.keys(heatmapData).sort();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get color based on value
  const getColor = (value) => {
    if (!value) return 'bg-gray-100 dark:bg-gray-700';
    if (value <= 50) return 'bg-green-200 dark:bg-green-800';
    if (value <= 100) return 'bg-yellow-200 dark:bg-yellow-700';
    if (value <= 150) return 'bg-orange-300 dark:bg-orange-700';
    if (value <= 200) return 'bg-red-400 dark:bg-red-700';
    return 'bg-purple-500 dark:bg-purple-800';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="flex">
          {/* Hour labels */}
          <div className="flex flex-col">
            <div className="h-8"></div>
            {dates.map(date => (
              <div
                key={date}
                className="h-8 flex items-center px-2 text-xs font-medium 
                         text-gray-700 dark:text-gray-300"
              >
                {dayjs(date).format('MMM D, YYYY')}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div>
            <div className="flex">
              {hours.map(hour => (
                <div
                  key={hour}
                  className="w-8 h-8 flex items-center justify-center text-xs 
                           text-gray-700 dark:text-gray-300 font-medium"
                >
                  {hour}
                </div>
              ))}
            </div>
            {dates.map(date => (
              <div key={date} className="flex">
                {hours.map(hour => {
                  const value = heatmapData[date][hour];
                  return (
                    <div
                      key={`${date}-${hour}`}
                      className={`w-8 h-8 m-0.5 rounded ${getColor(value)} 
                                flex items-center justify-center text-xs 
                                hover:ring-2 hover:ring-blue-500 cursor-pointer
                                transition-all duration-200`}
                      title={`${dayjs(date).format('MMM D, YYYY')} ${hour}:00 - ${value ? value.toFixed(1) : 'N/A'} µg/m³`}
                    >
                      {value ? (
                        <span className="text-[10px] font-semibold">
                          {value.toFixed(0)}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-xs">
          <span className="text-gray-600 dark:text-gray-400">Concentration:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 dark:bg-green-800 rounded"></div>
            <span>{t('good_range')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-700 rounded"></div>
            <span>{t('moderate_range')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-300 dark:bg-orange-700 rounded"></div>
            <span>{t('unhealthy_range')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 dark:bg-red-700 rounded"></div>
            <span>{t('very_unhealthy_range')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 dark:bg-purple-800 rounded"></div>
            <span>{t('hazardous_range')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;