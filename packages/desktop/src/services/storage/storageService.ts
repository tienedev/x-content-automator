import { Conf } from 'electron-conf/main';
import { Source, AppSettings, StoredFeedItem } from '@x-community/shared';
import { DEFAULT_RSS_CATEGORIES, FeedCategory } from '@/config/rssFeeds';

interface StoreSchema {
  sources: Source[];
  settings: AppSettings;
  categories: FeedCategory[];
  feedItems: StoredFeedItem[];
}

const defaultSettings: AppSettings = {
  defaultCategory: 'tech',
  includeHashtags: true,
  threadFormat: false,
  maxPostsPerDay: 5,
  rssUpdateInterval: 60,
  autoCollectContent: false,
  theme: 'light',
  notifications: true,
  autoSave: true,
  language: 'fr',
};

const defaultStoreValues: StoreSchema = {
  sources: [],
  settings: defaultSettings,
  categories: DEFAULT_RSS_CATEGORIES,
  feedItems: [],
};

export class StorageService {
  private static instance: StorageService;
  private store: Conf<StoreSchema>;

  private constructor() {
    this.store = new Conf<StoreSchema>({
      defaults: defaultStoreValues,
    });

    // Nettoyer les sources cassées au démarrage
    this.removeBrokenSources();

    // Initialiser les sources par défaut au premier lancement
    this.initializeDefaultSources();
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private initializeDefaultSources(): void {
    const existingSources = this.store.get('sources');
    const categories = this.store.get('categories');

    // Créer toutes les sources des 3 catégories principales
    const defaultSources: Source[] = [];
    let sourceId = Date.now();

    categories.forEach(category => {
      category.feeds.forEach(feed => {
        // Vérifier si cette source n'existe pas déjà
        const exists = existingSources.some(s => s.url === feed.url);
        if (!exists) {
          defaultSources.push({
            id: sourceId.toString(),
            ...feed,
            active: true,
            lastUpdate: new Date().toISOString(),
          });
          sourceId++;
        }
      });
    });

    // Ajouter les nouvelles sources aux existantes
    if (defaultSources.length > 0) {
      const updatedSources = [...existingSources, ...defaultSources];
      this.store.set('sources', updatedSources);
      console.log(`✅ Ajouté ${defaultSources.length} nouvelles sources par défaut`);
    }
  }

  // Sources CRUD
  getSources(): Source[] {
    return this.store.get('sources');
  }

  addSource(source: Omit<Source, 'id'>): Source {
    const sources = this.getSources();
    const newSource: Source = {
      ...source,
      id: Date.now().toString(),
    };
    const updatedSources = [...sources, newSource];
    this.store.set('sources', updatedSources);
    return newSource;
  }

  updateSource(id: string, updates: Partial<Source>): void {
    const sources = this.getSources();
    const index = sources.findIndex(s => s.id === id);
    if (index !== -1) {
      const updatedSources = sources.map((source, i) =>
        i === index ? { ...source, ...updates } : source
      );
      this.store.set('sources', updatedSources);
    }
  }

  deleteSource(id: string): void {
    const sources = this.getSources().filter(s => s.id !== id);
    this.store.set('sources', sources);
  }

  toggleSourceActive(id: string): void {
    const sources = this.getSources();
    const updatedSources = sources.map(source =>
      source.id === id
        ? { ...source, active: !source.active, lastUpdate: new Date().toISOString() }
        : source
    );
    this.store.set('sources', updatedSources);
  }

  // Catégories
  getCategories(): FeedCategory[] {
    return this.store.get('categories');
  }

  addSourcesFromCategory(categoryId: string, selectedFeedUrls?: string[]): void {
    const categories = this.getCategories();
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const existingSources = this.getSources();
    const newSources: Source[] = [];

    // Si des URLs spécifiques sont sélectionnées, n'ajouter que celles-ci
    const feedsToAdd = selectedFeedUrls
      ? category.feeds.filter(feed => selectedFeedUrls.includes(feed.url))
      : category.feeds;

    feedsToAdd.forEach(feed => {
      // Vérifier si la source n'existe pas déjà
      const exists = existingSources.some(s => s.url === feed.url);
      if (!exists) {
        newSources.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          ...feed,
          active: true,
          lastUpdate: new Date().toISOString(),
        });
      }
    });

    if (newSources.length > 0) {
      const updatedSources = [...existingSources, ...newSources];
      this.store.set('sources', updatedSources);
    }
  }

  // Paramètres
  getSettings(): AppSettings {
    return this.store.get('settings');
  }

  updateSettings(settings: Partial<AppSettings>): void {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    this.store.set('settings', updatedSettings);
  }

  // Utilitaires
  exportSources(): Source[] {
    return this.getSources();
  }

  importSources(sources: Source[]): void {
    // Valider les sources avant import
    const validSources = sources.filter(
      source => source.name && source.url && source.type && source.category
    );
    this.store.set('sources', validSources);
  }

  resetToDefaults(): void {
    this.store.clear();
    this.initializeDefaultSources();
  }

  // Méthode pour nettoyer les sources cassées identifiées lors des tests
  removeBrokenSources(): void {
    const brokenUrls = [
      'https://feeds.slashgear.com/slashgear',
      'https://firstround.com/review/feed.xml',
      'https://bothsidesofthetable.com/feed',
      'https://www.uber.com/blog/engineering/rss/',
      'https://openai.com/blog/rss/',
      'https://ai.googleblog.com/feeds/posts/default',
      'https://airbnb.design/feed/',
      'https://contentmarketinginstitute.com/feed/',
      'https://www.socialmediaexaminer.com/feed/',
      'https://thedecisionlab.com/feed/',
      'https://www.scotthyoung.com/feed/',
    ];

    const sources = this.getSources();
    const cleanedSources = sources.filter(source => !brokenUrls.includes(source.url));

    this.store.set('sources', cleanedSources);
  }

  // Feed Items CRUD
  getFeedItems(): StoredFeedItem[] {
    return this.store.get('feedItems');
  }

  addFeedItems(items: StoredFeedItem[]): void {
    const existingItems = this.getFeedItems();
    const newItems = items.filter(
      item => !existingItems.some(existing => existing.link === item.link)
    );

    if (newItems.length > 0) {
      const allItems = [...existingItems, ...newItems];
      // Garder seulement les 1000 items les plus récents
      const sortedItems = allItems
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .slice(0, 1000);

      this.store.set('feedItems', sortedItems);
    }
  }

  markFeedItemAsRead(itemId: string): void {
    const items = this.getFeedItems();
    const updatedItems = items.map(item => (item.id === itemId ? { ...item, isRead: true } : item));
    this.store.set('feedItems', updatedItems);
  }

  clearOldFeedItems(daysOld: number = 7): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const items = this.getFeedItems();
    const recentItems = items.filter(item => new Date(item.pubDate) > cutoffDate);

    this.store.set('feedItems', recentItems);
  }

  // Stats
  getSourceStats() {
    const sources = this.getSources();
    return {
      total: sources.length,
      active: sources.filter(s => s.active).length,
      byCategory: sources.reduce(
        (acc, source) => {
          acc[source.category] = (acc[source.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byType: sources.reduce(
        (acc, source) => {
          acc[source.type] = (acc[source.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }

  getFeedItemsStats() {
    const items = this.getFeedItems();
    return {
      total: items.length,
      unread: items.filter(item => !item.isRead).length,
      byCategory: items.reduce(
        (acc, item) => {
          acc[item.feedCategory] = (acc[item.feedCategory] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      recent: items.filter(item => {
        const itemDate = new Date(item.pubDate);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return itemDate > oneDayAgo;
      }).length,
    };
  }
}
