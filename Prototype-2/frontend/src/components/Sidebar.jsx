import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api/client';

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  selectedSite,
  setSelectedSite,
  selectedPollutant,
  setSelectedPollutant,
  forecastHorizon,
  setForecastHorizon,
}) => {
  const { t } = useTranslation();

  const handleDownload = async () => {
    try {
      const response = await api.downloadForecast(
        selectedSite,
        selectedPollutant,
        forecastHorizon
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `forecast_site${selectedSite}_${selectedPollutant}_${forecastHorizon}h.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const horizonOptions = [
    { value: 24, label: t('next24h') },
    { value: 48, label: t('next48h') },
    { value: 168, label: t('next7d') }
  ];

  return (
    <aside className={`bg-streamlit-light-bg dark:bg-streamlit-dark-secondary-bg shadow-lg transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between p-4 border-b border-streamlit-light-secondary-bg dark:border-streamlit-dark-bg">
        {isSidebarOpen && <h2 className="text-lg font-bold text-streamlit-light-text dark:text-streamlit-dark-text">Controls</h2>}
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-streamlit-light-secondary-bg dark:hover:bg-streamlit-dark-bg">
          {isSidebarOpen ? <ChevronLeft className="w-6 h-6 text-streamlit-light-secondary-text dark:text-streamlit-dark-secondary-text" /> : <ChevronRight className="w-6 h-6 text-streamlit-light-secondary-text dark:text-streamlit-dark-secondary-text" />}
        </button>
      </div>
      <div className="p-4 flex-grow">
        <div className="space-y-6">
          {/* Site Selection */}
          <div>
            <label className="block text-sm font-medium text-streamlit-light-secondary-text dark:text-streamlit-dark-secondary-text mb-2">
              {isSidebarOpen ? t('selectSite') : 'Site'}
            </label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-400 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(site => (
                <option key={site} value={site}>{isSidebarOpen ? `Site ${site}`: site}</option>
              ))}
            </select>
          </div>

          {/* Pollutant Selection */}
          <div>
            <label className="block text-sm font-medium text-streamlit-light-secondary-text dark:text-streamlit-dark-secondary-text mb-2">
              {isSidebarOpen ? t('selectPollutant') : 'Pollutant'}
            </label>
            <select
              value={selectedPollutant}
              onChange={(e) => setSelectedPollutant(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="O3">{isSidebarOpen ? `O₃ (${t('ozone')})` : 'O₃'}</option>
              <option value="NO2">{isSidebarOpen ? `NO₂ (${t('nitrogen_dioxide')})` : 'NO₂'}</option>
            </select>
          </div>

          {/* Forecast Horizon */}
          <div>
            <label className="block text-sm font-medium text-streamlit-light-secondary-text dark:text-streamlit-dark-secondary-text mb-2">
              {isSidebarOpen ? t('forecastHorizon') : 'Horizon'}
            </label>
            <select
              value={forecastHorizon}
              onChange={(e) => setForecastHorizon(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-400 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {horizonOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {isSidebarOpen ? option.label : `${option.value}h`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="p-4 border-t border-streamlit-light-secondary-bg dark:border-streamlit-dark-bg">
        <button
          onClick={handleDownload}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200 border border-blue-500"
        >
          <Download className="w-4 h-4" />
          {isSidebarOpen && t('download')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
