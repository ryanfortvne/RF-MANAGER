import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Dashboard } from './components/Dashboard';
import { Pepperstone } from './components/Pepperstone';
import { Tradify } from './components/Tradify';
import { Goals } from './components/Goals';
import { Ledger } from './components/Ledger';
import { Settings } from './components/Settings';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

type Tab = 'dashboard' | 'pepperstone' | 'tradify' | 'goals' | 'ledger';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const { undoActions, dismissUndo } = useApp();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pepperstone', label: 'Pepperstone' },
    { id: 'tradify', label: 'Tradify' },
    { id: 'goals', label: 'Goals' },
    { id: 'ledger', label: 'Ledger' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div
                  className="text-3xl font-bold"
                  style={{ color: '#007BFF', fontFamily: 'Arial, sans-serif' }}
                >
                  RF
                </div>
                <div className="text-xs text-gray-500">Manager</div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowSettings(false);
                    }}
                    className={`px-4 py-2 font-medium transition-colors relative ${
                      activeTab === tab.id && !showSettings
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && !showSettings && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: '#007BFF' }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-4 py-2 font-medium transition-colors ${
                showSettings ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={showSettings ? 'settings' : activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {showSettings ? (
              <Settings />
            ) : activeTab === 'dashboard' ? (
              <Dashboard />
            ) : activeTab === 'pepperstone' ? (
              <Pepperstone />
            ) : activeTab === 'tradify' ? (
              <Tradify />
            ) : activeTab === 'goals' ? (
              <Goals />
            ) : activeTab === 'ledger' ? (
              <Ledger />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Undo Snackbars */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {undoActions.map((action) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]"
            >
              <span className="flex-1 text-sm">{action.description}</span>
              <button
                onClick={action.restore}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
              >
                Undo
              </button>
              <button
                onClick={() => dismissUndo(action.id)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}