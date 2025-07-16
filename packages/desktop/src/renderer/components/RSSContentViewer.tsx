import React, { useState, useEffect } from 'react';
import { RSSFeedResult, RSSItem, Source } from '@x-community/shared';
import { useRSS } from '@/hooks/useRSS';

interface RSSContentViewerProps {
  sources: Source[];
}

const RSSContentViewer: React.FC<RSSContentViewerProps> = ({ sources }) => {
  const [feedResults, setFeedResults] = useState<Map<string, RSSFeedResult>>(new Map());
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchSourcesContent } = useRSS();

  // Charger le contenu RSS au montage et quand les sources changent
  useEffect(() => {
    loadRSSContent();
  }, [sources]);

  const loadRSSContent = async () => {
    const activeSources = sources.filter(s => s.active && s.type === 'rss');
    if (activeSources.length === 0) return;

    setIsLoading(true);
    try {
      const results = await fetchSourcesContent(activeSources);
      setFeedResults(results);

      // Sélectionner automatiquement la première source si aucune n'est sélectionnée
      if (!selectedSource && activeSources.length > 0) {
        setSelectedSource(activeSources[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des flux RSS:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedFeed = (): RSSFeedResult | null => {
    if (!selectedSource) return null;
    return feedResults.get(selectedSource) || null;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopyContent = async (item: RSSItem) => {
    const content = `${item.title}\n\n${item.description}\n\nSource: ${item.link}`;
    await window.electronAPI.copyToClipboard(content);
    // TODO: Afficher une notification
  };

  const activeSources = sources.filter(s => s.active && s.type === 'rss');
  const selectedFeed = getSelectedFeed();

  if (activeSources.length === 0) {
    return (
      <div className='text-center p-10 text-gray-500 dark:text-muted-foreground'>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📡</div>
        <p className='text-gray-500 dark:text-muted-foreground'>Aucune source RSS active</p>
        <p className='text-sm text-gray-500 dark:text-muted-foreground'>
          Activez des sources RSS pour voir leur contenu ici
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sélecteur de source */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}
      >
        {activeSources.map(source => {
          const feed = feedResults.get(source.id);
          const hasError = feed?.error;

          return (
            <button
              key={source.id}
              onClick={() => setSelectedSource(source.id)}
              className={`px-4 py-2 rounded-md text-sm whitespace-nowrap cursor-pointer transition-colors ${
                selectedSource === source.id
                  ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              {source.name}
              {feed && !hasError && (
                <span
                  style={{
                    marginLeft: '8px',
                    fontSize: '12px',
                    color: '#6b7280',
                  }}
                  className='text-gray-500 dark:text-muted-foreground'
                >
                  ({feed.items.length})
                </span>
              )}
              {hasError && (
                <span
                  style={{
                    marginLeft: '8px',
                    color: '#dc2626',
                  }}
                >
                  ⚠️
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenu du flux sélectionné */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className='loading'></div>
            <p className='mt-4 text-gray-600 dark:text-muted-foreground'>
              Chargement des flux RSS...
            </p>
          </div>
        ) : selectedFeed ? (
          <div>
            {/* En-tête du flux */}
            <div className='p-4 bg-gray-50 dark:bg-muted rounded-lg mb-4'>
              <h3 className='text-lg font-semibold mb-1 text-gray-900 dark:text-foreground'>
                {selectedFeed.title}
              </h3>
              {selectedFeed.description && (
                <p className='text-sm text-gray-600 dark:text-muted-foreground'>
                  {selectedFeed.description}
                </p>
              )}
            </div>

            {/* Articles */}
            {selectedFeed.error ? (
              <div className='text-center p-5 text-red-600 dark:text-red-400'>
                <p className='text-red-600 dark:text-red-400'>Erreur lors du chargement du flux:</p>
                <p className='text-sm text-red-500 dark:text-red-300'>{selectedFeed.error}</p>
              </div>
            ) : selectedFeed.items.length === 0 ? (
              <div className='text-center p-5 text-gray-500 dark:text-muted-foreground'>
                <p className='text-gray-500 dark:text-muted-foreground'>
                  Aucun article dans ce flux
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedFeed.items.map((item, index) => (
                  <div
                    key={index}
                    className='p-4 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card transition-shadow'
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <h4 className='text-base font-semibold mb-1 text-gray-900 dark:text-foreground'>
                        {item.title}
                      </h4>
                      <div className='text-xs text-gray-500 dark:text-muted-foreground flex items-center gap-2'>
                        <span>{formatDate(item.pubDate)}</span>
                        {item.author && (
                          <>
                            <span>•</span>
                            <span>{item.author}</span>
                          </>
                        )}
                        {item.category && (
                          <>
                            <span>•</span>
                            <span>{item.category}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <p className='text-sm text-gray-700 dark:text-foreground mb-3 leading-relaxed'>
                      {item.description}
                    </p>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className='btn btn-outline'
                        onClick={() => window.electronAPI.openExternal(item.link)}
                        style={{ fontSize: '12px', padding: '4px 12px' }}
                      >
                        🔗 Lire l'article
                      </button>
                      <button
                        className='btn btn-primary'
                        onClick={() => handleCopyContent(item)}
                        style={{ fontSize: '12px', padding: '4px 12px' }}
                      >
                        📋 Copier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className='text-center p-10 text-gray-500 dark:text-muted-foreground'>
            <p className='text-gray-500 dark:text-muted-foreground'>
              Sélectionnez une source pour voir son contenu
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RSSContentViewer;
