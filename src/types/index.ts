// Types pour l'application X Community Manager

export interface Post {
  id: string;
  content: string;
  category: PostCategory;
  status: PostStatus;
  createdAt: string;
  scheduledFor?: string;
  publishedAt?: string;
  source?: string;
  hashtags?: string[];
  metadata?: {
    wordCount: number;
    characterCount: number;
    estimatedReadTime: number;
  };
}

export type PostCategory = 'tech' | 'business' | 'personal';
export type FeedCategoryType = 'tech-news' | 'startup' | 'engineering' | 'ai-ml' | 'design-ux' | 'marketing' | 'learning' | 'science';
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'pending';

export interface Source {
  id: string;
  name: string;
  url: string;
  type: SourceType;
  category: PostCategory;
  feedCategory: FeedCategoryType;
  active: boolean;
  lastUpdate: string;
  totalPosts?: number;
  errorCount?: number;
  settings?: {
    updateInterval: number;
    maxPostsPerUpdate: number;
    keywords: string[];
  };
}

export type SourceType = 'rss' | 'website' | 'api';

export interface ContentGenerationRequest {
  prompt: string;
  category: PostCategory;
  options: {
    includeHashtags: boolean;
    threadFormat: boolean;
    addCallToAction: boolean;
    maxLength?: number;
  };
  model?: AIModel;
}

export interface ContentGenerationResponse {
  content: string;
  hashtags: string[];
  metadata: {
    model: AIModel;
    tokensUsed: number;
    generationTime: number;
  };
}

export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro' | 'claude-3-sonnet';

export interface AppSettings {
  // IA & APIs
  openaiApiKey: string;
  geminiApiKey: string;
  claudeApiKey?: string;
  defaultModel: AIModel;
  
  // Contenu
  defaultCategory: PostCategory;
  includeHashtags: boolean;
  threadFormat: boolean;
  maxPostsPerDay: number;
  
  // Sources
  rssUpdateInterval: number;
  autoCollectContent: boolean;
  
  // Interface
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  autoSave: boolean;
  language: 'fr' | 'en';
}

export interface DashboardStats {
  totalPosts: number;
  todayPosts: number;
  pendingPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  sources: number;
  activeSources: number;
}

export interface CalendarEvent {
  id: string;
  postId: string;
  title: string;
  description: string;
  category: PostCategory;
  scheduledFor: string;
  status: PostStatus;
}

export interface FeedCategory {
  id: string;
  name: string;
  description: string;
  feeds: Omit<Source, 'id' | 'active' | 'lastUpdate'>[];
}

export interface SourceStats {
  total: number;
  active: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
}

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

export interface RSSFeedResult {
  url: string;
  title: string;
  description: string;
  items: RSSItem[];
  error?: string;
}

export interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category?: string;
  author?: string;
}

export interface StoredFeedItem extends RSSItem {
  id: string;
  sourceId: string;
  sourceName: string;
  feedCategory: FeedCategoryType;
  fetchedAt: string;
  isRead: boolean;
}

// Extensions globales
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Types pour les composants React
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface TabItem {
  id: string;
  label: string;
  icon: string;
  disabled?: boolean;
}