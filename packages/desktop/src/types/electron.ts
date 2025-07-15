import type {
  ContentGenerationRequest,
  ContentGenerationResponse,
  RSSFeedResult,
  Source,
  FeedCategory,
  AppSettings,
  SourceStats,
  StoredFeedItem,
} from '@x-community/shared';

// Types pour l'API Electron
export interface ElectronAPI {
  // Contenu
  generateContent: (request: ContentGenerationRequest) => Promise<ContentGenerationResponse>;

  // RSS
  fetchRSSFeeds: (urls: string[]) => Promise<RSSFeedResult[]>;

  // Clipboard
  copyToClipboard: (text: string) => Promise<void>;

  // Fichiers
  openFile: () => Promise<string | null>;
  saveFile: (content: string) => Promise<void>;

  // App
  getVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;

  // Storage operations
  storage: {
    // Sources
    getSources: () => Promise<Source[]>;
    addSource: (source: Omit<Source, 'id'>) => Promise<Source>;
    updateSource: (id: string, updates: Partial<Source>) => Promise<void>;
    deleteSource: (id: string) => Promise<void>;
    toggleSource: (id: string) => Promise<void>;

    // Categories
    getCategories: () => Promise<FeedCategory[]>;
    addSourcesFromCategory: (categoryId: string, selectedUrls?: string[]) => Promise<void>;

    // Settings
    getSettings: () => Promise<AppSettings>;
    updateSettings: (settings: Partial<AppSettings>) => Promise<void>;

    // Import/Export
    exportSources: () => Promise<Source[]>;
    importSources: (sources: Source[]) => Promise<void>;

    // Stats
    getStats: () => Promise<SourceStats>;

    // Feed Items
    getFeedItems: () => Promise<StoredFeedItem[]>;
    addFeedItems: (items: StoredFeedItem[]) => Promise<void>;
    markFeedItemAsRead: (itemId: string) => Promise<void>;
    clearOldFeedItems: (daysOld?: number) => Promise<void>;
    getFeedItemsStats: () => Promise<{
      total: number;
      unread: number;
      byCategory: Record<string, number>;
      recent: number;
    }>;

    // Utilities
    resetDefaults: () => Promise<void>;
  };

  // Événements
  onMenuAction: (callback: (action: string) => void) => void;
  removeAllListeners: (channel: string) => void;
}

// Extensions globales
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
