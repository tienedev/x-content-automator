import Parser from 'rss-parser';
import { RSSFeedResult, RSSItem, Source } from '@/types';

const parser = new Parser({
  customFields: {
    feed: ['language'],
    item: ['category', 'enclosure'],
  },
});

export class RSSService {
  private static instance: RSSService;

  private constructor() {}

  static getInstance(): RSSService {
    if (!RSSService.instance) {
      RSSService.instance = new RSSService();
    }
    return RSSService.instance;
  }

  async fetchFeed(url: string): Promise<RSSFeedResult> {
    try {
      const feed = await parser.parseURL(url);

      const items: RSSItem[] = feed.items.map(item => ({
        title: item.title || '',
        description: item.contentSnippet || item.content || '',
        link: item.link || '',
        pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
        category: item.categories?.[0] || undefined,
        author:
          (item as { creator?: string; author?: string }).creator ||
          (item as { creator?: string; author?: string }).author ||
          undefined,
      }));

      return {
        url,
        title: feed.title || 'Sans titre',
        description: feed.description || '',
        items: items.slice(0, 50), // Limiter à 50 articles
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération du flux RSS ${url}:`, error);
      return {
        url,
        title: 'Erreur',
        description: '',
        items: [],
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  async fetchMultipleFeeds(urls: string[]): Promise<RSSFeedResult[]> {
    const results = await Promise.all(urls.map(url => this.fetchFeed(url)));
    return results;
  }

  async fetchSourcesContent(sources: Source[]): Promise<Map<string, RSSFeedResult>> {
    const activeRSSSources = sources.filter(source => source.active && source.type === 'rss');

    const results = new Map<string, RSSFeedResult>();

    for (const source of activeRSSSources) {
      const feedResult = await this.fetchFeed(source.url);
      results.set(source.id, feedResult);
    }

    return results;
  }

  // Filtrer les articles par mots-clés
  filterItemsByKeywords(items: RSSItem[], keywords: string[]): RSSItem[] {
    if (keywords.length === 0) return items;

    const lowerKeywords = keywords.map(k => k.toLowerCase());

    return items.filter(item => {
      const searchableContent = [item.title, item.description, item.category]
        .join(' ')
        .toLowerCase();

      return lowerKeywords.some(keyword => searchableContent.includes(keyword));
    });
  }

  // Trier les articles par date
  sortItemsByDate(items: RSSItem[], order: 'asc' | 'desc' = 'desc'): RSSItem[] {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();

      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  // Obtenir les articles récents (dernières 24h)
  getRecentItems(items: RSSItem[], hoursAgo: number = 24): RSSItem[] {
    const cutoffTime = Date.now() - hoursAgo * 60 * 60 * 1000;

    return items.filter(item => {
      const itemTime = new Date(item.pubDate).getTime();
      return itemTime >= cutoffTime;
    });
  }
}
