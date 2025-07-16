import { useEffect } from 'react';
import { useRSS } from '@/hooks/useRSS';
import { useToastContext } from '@/contexts/ToastContext';
import type { StoredFeedItem } from '@x-community/shared';

export const FeedLoader: React.FC = () => {
  const { fetchSourcesContent } = useRSS();
  const { success, error } = useToastContext();

  useEffect(() => {
    const loadInitialFeeds = async () => {
      try {
        console.log('🚀 Chargement automatique des feeds RSS au démarrage...');

        // Récupérer les sources actives
        const sources = await window.electronAPI.storage.getSources();
        const activeSources = sources.filter(s => s.active && s.type === 'rss');

        if (activeSources.length === 0) {
          console.log('⚠️ Aucune source RSS active trouvée');
          return;
        }

        console.log(`📡 ${activeSources.length} sources actives trouvées`);

        // Récupérer le contenu des feeds
        const results = await fetchSourcesContent(activeSources);

        // Sauvegarder les feed items dans le storage
        const allFeedItems: StoredFeedItem[] = [];

        for (const [sourceId, result] of results.entries()) {
          const source = activeSources.find(s => s.id === sourceId);
          if (!source || result.error) {
            if (result.error) {
              console.error(`❌ Erreur pour ${source?.name}: ${result.error}`);
            }
            continue;
          }

          // Convertir les items RSS en StoredFeedItem
          const feedItems: StoredFeedItem[] = result.items.map(item => ({
            id: `${sourceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sourceId,
            sourceName: source.name,
            feedCategory: source.feedCategory,
            fetchedAt: new Date().toISOString(),
            isRead: false,
            ...item,
          }));

          allFeedItems.push(...feedItems);
        }

        // Sauvegarder tous les nouveaux items
        if (allFeedItems.length > 0) {
          await window.electronAPI.storage.addFeedItems(allFeedItems);
          console.log(`✅ ${allFeedItems.length} articles RSS chargés au démarrage`);
        } else {
          console.log('⚠️ Aucun article trouvé dans les feeds RSS');
        }
      } catch (err) {
        console.error('Erreur lors du chargement initial des feeds:', err);
        error('Erreur', 'Impossible de charger les feeds RSS au démarrage');
      }
    };

    // Charger les feeds après un court délai pour laisser l'app s'initialiser
    const timer = setTimeout(loadInitialFeeds, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Ce composant ne rend rien, il gère juste le chargement des feeds
  return null;
};
