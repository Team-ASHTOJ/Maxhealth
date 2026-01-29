import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import LiveAQI from './LiveAQI';
import MetricsCard from './MetricsCard';
import ForecastChart from './ForecastChart';
import HeatmapChart from './HeatmapChart';
import HealthRecommendations from './HealthRecommendations';
import FeedbackSection from './FeedbackSection';
import LoadingSpinner from './LoadingSpinner';

const Dashboard = ({ selectedSite, selectedPollutant, forecastHorizon }) => {
  const { t } = useTranslation();
  // The userProfile state is no longer needed here
  // const [userProfile, setUserProfile] = useState({
  //   age_group: 'adult',
  //   conditions: []
  // });

  // Fetch site data
  const { data: siteData, isLoading: loadingSite } = useQuery({
    queryKey: ['siteData', selectedSite, forecastHorizon],
    queryFn: () => api.getSiteData(selectedSite, forecastHorizon),
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  // Fetch metrics
  const { data: metricsData, isLoading: loadingMetrics } = useQuery({
    queryKey: ['metrics', selectedSite, selectedPollutant],
    queryFn: () => api.getSiteMetrics(selectedSite, selectedPollutant),
  });

  // Fetch live AQI
  const { data: aqiData, isLoading: loadingAQI } = useQuery({
    queryKey: ['aqi'],
    queryFn: () => api.getCurrentAQI(28.6139, 77.2090),
    refetchInterval: 600000, // Refetch every 10 minutes
  });

  const isLoading = loadingSite || loadingMetrics || loadingAQI;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Top Row: Live AQI and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <LiveAQI aqiData={aqiData?.data} />
        <MetricsCard 
          metricsData={metricsData?.data} 
          pollutant={selectedPollutant}
          site={selectedSite}
        />
      </div>

      {/* Health Recommendations */}
      <HealthRecommendations 
        aqi={aqiData?.data?.aqi} 
      />

      {/* Forecast Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('forecastGraph')}
        </h2>
        <ForecastChart 
          data={siteData?.data?.data} 
          pollutant={selectedPollutant}
        />
      </div>

      {/* Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('heatmap')}
        </h2>
        <HeatmapChart 
          data={siteData?.data?.data} 
          pollutant={selectedPollutant}
        />
      </div>

      {/* Community Feedback */}
      <FeedbackSection selectedSite={selectedSite} />
    </div>
  );
};

export default Dashboard;