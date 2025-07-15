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
export type FeedCategoryType =
  | 'tech-news'
  | 'startup'
  | 'engineering'
  | 'ai-ml'
  | 'design-ux'
  | 'marketing'
  | 'learning'
  | 'science';
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

// Types pour la configuration AI (maintenant dans .env)
export interface AIConfig {
  openaiApiKey: string;
  geminiApiKey: string;
  claudeApiKey?: string;
  defaultModel: AIModel;
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

// Types Mastra
export interface MastraContentResult {
  finalPost: {
    content: string;
    format: string;
    hashtags: string[];
    sourceUrl: string;
    category: 'tech' | 'business';
  };
  alternatives: Array<{
    content: string;
    format: string;
  }>;
}

export interface MastraResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Types RSS
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
  categories?: string[];
  author?: string;
  content?: string;
  contentSnippet?: string;
}

export interface StoredFeedItem extends RSSItem {
  id: string;
  sourceId: string;
  sourceName: string;
  feedCategory: FeedCategoryType;
  fetchedAt: string;
  isRead: boolean;
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

// API Types pour communication entre packages
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ContentGenerationAPIRequest {
  newsItems: Array<{
    title: string;
    description: string;
    link: string;
    pubDate: string;
    category: 'tech' | 'business';
  }>;
}
