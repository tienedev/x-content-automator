import { PostCategory, FeedCategoryType } from '@x-community/shared';

// Catégories principales simplifiées
export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  tech: 'Tech',
  business: 'Business',
  personal: 'Personnel',
};

export const POST_CATEGORY_ICONS: Record<PostCategory, string> = {
  tech: '💻',
  business: '💼',
  personal: '👤',
};

export const POST_CATEGORY_DESCRIPTIONS: Record<PostCategory, string> = {
  tech: 'Actualités technologiques, développement et innovation',
  business: 'Startup, entrepreneuriat, marketing et business',
  personal: 'Développement personnel, apprentissage et productivité',
};

// Mapping des sous-catégories vers les catégories principales
export const FEED_CATEGORY_LABELS: Record<FeedCategoryType, string> = {
  'tech-news': 'Tech News',
  startup: 'Startup & Entrepreneuriat',
  engineering: 'Engineering & Dev',
  'ai-ml': 'IA & Machine Learning',
  'design-ux': 'Design & UX',
  marketing: 'Marketing & Growth',
  learning: 'Apprentissage & Dev Personnel',
  science: 'Science & Innovation',
};

export const FEED_CATEGORY_ICONS: Record<FeedCategoryType, string> = {
  'tech-news': '📱',
  startup: '🚀',
  engineering: '⚙️',
  'ai-ml': '🤖',
  'design-ux': '🎨',
  marketing: '📈',
  learning: '📚',
  science: '🔬',
};

// Mapping entre les catégories de feed et les catégories de post
export const FEED_TO_POST_CATEGORY: Record<FeedCategoryType, PostCategory> = {
  'tech-news': 'tech',
  startup: 'business',
  engineering: 'tech',
  'ai-ml': 'tech',
  'design-ux': 'tech',
  marketing: 'business',
  learning: 'personal',
  science: 'tech',
};
