import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const MetricsCard = ({ metricsData, pollutant, site }) => {
  const { t } = useTranslation();
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!metricsData) return null;

  const { combined_score, metrics, normalized_scores } = metricsData;
  const scorePercentage = (combined_score * 100).toFixed(1);

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreGradient = (score) => {
    if (score >= 0.8) return 'from-green-400 to-green-600';
    if (score >= 0.6) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {t('modelPerformance')}
        </h2>
      </div>

      {/* Main Score Display */}
      <div className={`bg-gradient-to-br ${getScoreGradient(combined_score)} rounded-lg p-6 text-white mb-4`}>
        <div className="text-center">
          <div className="text-5xl font-bold mb-2">{scorePercentage}%</div>
          <div className="text-lg font-semibold">
            {pollutant} {t('accuracy')} - {t('site')} {site}
          </div>
          <div className="text-sm opacity-90 mt-2">
            {t('overallScore')}
          </div>
        </div>
      </div>

      {/* Toggle Breakdown Button */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="w-full flex items-center justify-between px-4 py-3 
                   bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 
                   dark:hover:bg-gray-600 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('viewBreakdown')}
        </span>
        {showBreakdown ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Detailed Breakdown */}
      {showBreakdown && (
        <div className="mt-4 space-y-3">
          {Object.entries(normalized_scores).map(([metric, score]) => (
            <div key={metric} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t(metric.toLowerCase())}
                </span>
                <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                  {(score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Raw Value: {metrics[metric]?.toFixed(3)}</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    score >= 0.8 ? 'bg-green-500' :
                    score >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${score * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetricsCard;