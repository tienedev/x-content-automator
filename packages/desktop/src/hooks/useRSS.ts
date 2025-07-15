import { useState, useCallback } from 'react';
import { RSSFeedResult, Source } from '@/types';

export const useRSS = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeeds = useCallback(async (urls: string[]): Promise<RSSFeedResult[]> => {
    setLoading(true);
    setError(null);

    try {
      const results = await window.electronAPI.fetchRSSFeeds(urls);
      return results;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erreur lors de la récupération des flux RSS';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSourcesContent = useCallback(
    async (sources: Source[]): Promise<Map<string, RSSFeedResult>> => {
      const activeRSSSources = sources.filter(source => source.active && source.type === 'rss');

      const urls = activeRSSSources.map(source => source.url);
      const results = await fetchFeeds(urls);

      const resultsMap = new Map<string, RSSFeedResult>();
      activeRSSSources.forEach((source, index) => {
        if (results[index]) {
          resultsMap.set(source.id, results[index]);
        }
      });

      return resultsMap;
    },
    [fetchFeeds]
  );

  const testRSSUrl = useCallback(
    async (url: string): Promise<{ valid: boolean; error?: string }> => {
      try {
        const results = await window.electronAPI.fetchRSSFeeds([url]);
        const result = results[0];

        return {
          valid: !result.error && result.items.length > 0,
          error: result.error,
        };
      } catch (err) {
        return {
          valid: false,
          error: err instanceof Error ? err.message : 'URL invalide',
        };
      }
    },
    []
  );

  return {
    loading,
    error,
    fetchFeeds,
    fetchSourcesContent,
    testRSSUrl,
  };
};
