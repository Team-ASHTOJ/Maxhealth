import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe } from 'lucide-react';

const Navbar = ({ darkMode, setDarkMode }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="bg-streamlit-light-bg dark:bg-streamlit-dark-secondary-bg shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-streamlit-primary">
              🌆 {t('appTitle')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-streamlit-light-secondary-bg dark:hover:bg-streamlit-dark-bg transition-colors"
              aria-label={t('language')}
            >
              <Globe className="w-5 h-5 text-streamlit-light-secondary-text dark:text-streamlit-dark-secondary-text" />
              <span className="ml-2 text-sm font-medium text-streamlit-light-secondary-text dark:text-streamlit-dark-secondary-text">
                {i18n.language === 'en' ? 'हिं' : 'EN'}
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-streamlit-light-secondary-bg dark:hover:bg-streamlit-dark-bg transition-colors"
              aria-label={t('darkMode')}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-streamlit-light-secondary-text" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
