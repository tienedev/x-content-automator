import React, { useState, useEffect } from 'react';
import type { AppSettings, PostCategory } from '@x-community/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@x-community/ui';
import { useToastContext } from '@/contexts/ToastContext';
import { useThemeContext } from '@/contexts/ThemeContext';

const Settings: React.FC = () => {
  const { success, error } = useToastContext();
  const { setTheme } = useThemeContext();
  const [settings, setSettings] = useState<AppSettings>({
    // Paramètres de contenu
    defaultCategory: 'tech' as PostCategory,
    includeHashtags: true,
    threadFormat: false,

    // Paramètres de collecte
    rssUpdateInterval: 60, // minutes
    maxPostsPerDay: 5,

    // Paramètres d'interface
    theme: 'light' as 'light' | 'dark' | 'auto',
    notifications: true,
    autoSave: true,
    language: 'fr' as 'fr' | 'en',
    autoCollectContent: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await window.electronAPI.storage.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): void => {
    const newSettings = {
      ...settings,
      [key]: value,
    };
    
    setSettings(newSettings);

    // Appliquer immédiatement le changement de thème
    if (key === 'theme') {
      setTheme(value as 'light' | 'dark' | 'auto');
    }

    // Sauvegarde en temps réel
    saveSettingsRealTime(newSettings);
  };

  const saveSettingsRealTime = async (newSettings: AppSettings): Promise<void> => {
    try {
      await window.electronAPI.storage.updateSettings(newSettings);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde automatique:', err);
      error('Erreur', 'Impossible de sauvegarder automatiquement les paramètres');
    }
  };


  if (loading) {
    return (
      <div className='h-screen bg-gray-50/30 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-muted-foreground'>Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen bg-gray-50/30 dark:bg-background'>
      <div className='max-w-4xl mx-auto p-6'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-semibold text-gray-900 dark:text-foreground'>Paramètres</h1>
          <p className='text-gray-600 dark:text-muted-foreground mt-1'>
            Configurez votre expérience et vos préférences
          </p>
        </div>

        <div className='space-y-6'>

          {/* Sources RSS */}
          <Card className="bg-white dark:bg-card">
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>📡 Sources RSS</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  Intervalle de mise à jour (minutes)
                </label>
                <input
                  type='number'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  value={settings.rssUpdateInterval}
                  onChange={e => handleSettingChange('rssUpdateInterval', parseInt(e.target.value))}
                  min='15'
                  max='1440'
                />
                <p className='text-xs text-gray-500 dark:text-muted-foreground mt-1'>
                  Fréquence de vérification des nouveaux articles
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Interface */}
          <Card className="bg-white dark:bg-card">
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>🎨 Interface & Préférences</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='text-sm font-medium mb-2 block'>Thème</label>
                <select
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  value={settings.theme}
                  onChange={e =>
                    handleSettingChange('theme', e.target.value as 'light' | 'dark' | 'auto')
                  }
                >
                  <option value='light'>Clair</option>
                  <option value='dark'>Sombre</option>
                  <option value='auto'>Automatique</option>
                </select>
              </div>
              <div className='space-y-3'>
                <p className='text-sm font-medium'>Préférences</p>
                <div className='space-y-2'>
                  <label className='flex items-center gap-3 cursor-pointer'>
                    <input
                      type='checkbox'
                      className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                      checked={settings.notifications}
                      onChange={e => handleSettingChange('notifications', e.target.checked)}
                    />
                    <span className='text-sm text-gray-700 dark:text-foreground'>
                      Activer les notifications
                    </span>
                  </label>
                  <label className='flex items-center gap-3 cursor-pointer'>
                    <input
                      type='checkbox'
                      className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                      checked={settings.autoSave}
                      onChange={e => handleSettingChange('autoSave', e.target.checked)}
                    />
                    <span className='text-sm text-gray-700 dark:text-foreground'>
                      Sauvegarde automatique
                    </span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Settings;
