import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Charger le thème depuis les settings
    const loadTheme = async () => {
      try {
        const settings = await window.electronAPI.storage.getSettings();
        setTheme(settings.theme || 'light');
      } catch (error) {
        console.error('Erreur lors du chargement du thème:', error);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    // Supprimer les classes existantes
    root.classList.remove('light', 'dark');

    if (theme === 'auto') {
      // Utiliser les préférences système
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }

      // Écouter les changements de préférences système
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Appliquer le thème choisi
      root.classList.add(theme);
    }
  }, [theme]);

  return { theme, setTheme };
};
