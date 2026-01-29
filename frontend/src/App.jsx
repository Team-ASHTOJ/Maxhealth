import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedSite, setSelectedSite] = useState(1);
  const [selectedPollutant, setSelectedPollutant] = useState('O3');
  const [forecastHorizon, setForecastHorizon] = useState(24);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <div className={`flex h-screen bg-streamlit-light-bg dark:bg-streamlit-dark-bg text-streamlit-light-text dark:text-streamlit-dark-text ${darkMode ? 'dark' : ''}`}>
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            selectedSite={selectedSite}
            setSelectedSite={setSelectedSite}
            selectedPollutant={selectedPollutant}
            setSelectedPollutant={setSelectedPollutant}
            forecastHorizon={forecastHorizon}
            setForecastHorizon={setForecastHorizon}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-streamlit-light-secondary-bg dark:bg-streamlit-dark-bg">
              <Dashboard
                selectedSite={selectedSite}
                selectedPollutant={selectedPollutant}
                forecastHorizon={forecastHorizon}
              />
            </main>
          </div>
        </div>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
