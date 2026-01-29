import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, AlertTriangle, CheckCircle, Calendar, Loader2 } from 'lucide-react';
import { api } from '../api/client';

const HealthRecommendations = ({ aqi }) => {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    // The 'aqi' prop should be a number passed from Dashboard
    if (typeof aqi === 'number' && !isNaN(aqi)) {
      fetchRecommendations(aqi);
    } else {
      // If aqi is not a valid number, don't attempt to fetch
      setLoading(false);
    }
  }, [aqi]);

  const fetchRecommendations = async (aqiValue) => {
    setLoading(true);
    setError(null);
    // We send a default/dummy profile now
    const dummyProfile = { age_group: 'adult', conditions: [] };
    try {
      // Pass the number and profile object to the API client
      const response = await api.getHealthRecommendations(aqiValue, dummyProfile);
      setRecommendations(response.data.recommendations);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError('Could not load health recommendations.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <Loader2 className="w-6 h-6 mr-2 animate-spin text-gray-500" />
        <p className="text-gray-700 dark:text-gray-300">{t('loadingHealthRecs')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 mb-8 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg shadow-lg">
        <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
        <p className="text-red-700 dark:text-red-200">{t('errorHealthRecs')}</p>
      </div>
    );
  }

  if (!recommendations) {
    // This will show if AQI is not available or if there are no recommendations
    return (
        <div className="flex items-center justify-center p-6 mb-8 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg">
            <p className="text-gray-500 dark:text-gray-400">{t('noHealthRecs')}</p>
        </div>
    );
  }

  const getSeverityIcon = () => {
    switch (recommendations.severity) {
      case 'good':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'moderate':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'unhealthy_sensitive':
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
    }
  };

  const getSeverityColor = () => {
    switch (recommendations.severity) {
      case 'good':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'moderate':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'unhealthy_sensitive':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    }
  };

  const addToCalendar = () => {
    // Create a simple iCal event
    const event = {
      title: `Air Quality Alert - AQI: ${aqi}`,
      description: recommendations.outdoor_advice,
      start: new Date(),
      duration: 1 // hour
    };

    // For demo purposes, show alert
    alert(`Calendar reminder set for AQI monitoring!\n\nAQI: ${aqi}\nAdvice: ${recommendations.outdoor_advice}`);
    setShowCalendar(false);
  };

  return (
    <div className={`rounded-lg border-l-4 p-6 mb-8 ${getSeverityColor()}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {getSeverityIcon()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5" />
              {t('healthRecommendations')}
            </h2>
            
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 
                       text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Calendar className="w-4 h-4" />
              {t('addToPlanner')}
            </button>
          </div>

          {/* Activity Level */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('activityLevel')}
            </h3>
            <p className="text-gray-900 dark:text-white font-medium">
              {t(recommendations.activity_level_key)}
            </p>
          </div>

          {/* Outdoor Advice */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('outdoorGuidance')}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {t(recommendations.outdoor_advice_key)}
            </p>
          </div>

          {/* Health Tips */}
          {recommendations.health_tips && recommendations.health_tips.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('healthTips')}
              </h3>
              <ul className="space-y-2">
                {recommendations.health_tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{t(tip.key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Potential Risks */}
          {recommendations.risks && recommendations.risks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('potentialRisks')}
              </h3>
              <ul className="space-y-2">
                {recommendations.risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{t(risk.key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Calendar Integration Modal */}
          {showCalendar && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('setDailyReminder')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('getNotifiedDaily')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={addToCalendar}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                           rounded-lg font-medium transition-colors"
                >
                  {t('confirm')}
                </button>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 
                           dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 
                           rounded-lg font-medium transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthRecommendations;