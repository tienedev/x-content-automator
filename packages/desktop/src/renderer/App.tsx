import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import ContentGenerator from './pages/ContentGenerator';
import Sources from './pages/Sources';
import Settings from './pages/Settings';
import type { TabItem } from '@x-community/shared';
import { ToastProvider } from '@/contexts/ToastContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToasterWrapper } from './components/ToasterWrapper';
import { FeedLoader } from './components/FeedLoader';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'generator', label: 'Génération', icon: '✨' },
    { id: 'sources', label: 'Sources', icon: '📡' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'generator':
        return <ContentGenerator />;
      case 'sources':
        return <Sources />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <FeedLoader />
        <div style={{ display: 'flex', height: '100vh' }}>
          {/* Sidebar */}
          <div className='sidebar w-64 bg-slate-800 dark:bg-card text-white dark:text-foreground border-r dark:border-border transition-colors duration-200 flex flex-col'>
            <div className='text-xl font-bold p-5 text-center border-b border-slate-700 dark:border-border'>
              X Community Manager
            </div>

            <nav className='flex-1 p-5 overflow-hidden'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg cursor-pointer text-sm mb-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'hover:bg-slate-700/50 dark:hover:bg-muted/50 text-slate-200 dark:text-muted-foreground hover:text-white dark:hover:text-foreground'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className='flex-1 p-5 overflow-auto bg-background text-foreground transition-colors duration-200'>
            {renderActiveTab()}
          </div>
        </div>
        <ToasterWrapper />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
