import { Source, FeedCategoryType } from '@/types';

export interface FeedCategory {
  id: FeedCategoryType;
  name: string;
  description: string;
  feeds: Omit<Source, 'id' | 'active' | 'lastUpdate'>[];
}

export const DEFAULT_RSS_CATEGORIES: FeedCategory[] = [
  {
    id: 'tech-news',
    name: 'Tech News',
    description: 'Actualités technologiques et innovation',
    feeds: [
      {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        type: 'rss',
        category: 'tech',
        feedCategory: 'tech-news',
      },
      {
        name: 'The Verge',
        url: 'https://www.theverge.com/rss/index.xml',
        type: 'rss',
        category: 'tech',
        feedCategory: 'tech-news',
      },
      {
        name: 'VentureBeat',
        url: 'https://venturebeat.com/feed/',
        type: 'rss',
        category: 'tech',
        feedCategory: 'tech-news',
      },
      {
        name: 'Engadget',
        url: 'https://www.engadget.com/rss.xml',
        type: 'rss',
        category: 'tech',
        feedCategory: 'tech-news',
      },
    ],
  },
  {
    id: 'startup',
    name: 'Startup & Entrepreneuriat',
    description: 'Actualités startup, entrepreneuriat et business',
    feeds: [
      {
        name: 'Hacker News',
        url: 'https://news.ycombinator.com/rss',
        type: 'rss',
        category: 'business',
        feedCategory: 'startup',
      },
      {
        name: 'TechCrunch Startups',
        url: 'https://techcrunch.com/startups/feed/',
        type: 'rss',
        category: 'business',
        feedCategory: 'startup',
      },
      {
        name: 'Steve Blank',
        url: 'https://steveblank.com/feed/',
        type: 'rss',
        category: 'business',
        feedCategory: 'startup',
      },
      {
        name: 'Andrew Chen',
        url: 'https://andrewchen.co/feed/',
        type: 'rss',
        category: 'business',
        feedCategory: 'startup',
      },
    ],
  },
  {
    id: 'engineering',
    name: 'Engineering & Dev',
    description: "Blogs d'ingénierie et développement",
    feeds: [
      {
        name: 'The Pragmatic Engineer',
        url: 'https://blog.pragmaticengineer.com/rss/',
        type: 'rss',
        category: 'tech',
        feedCategory: 'engineering',
      },
      {
        name: 'GitHub Engineering',
        url: 'https://githubengineering.com/atom.xml',
        type: 'rss',
        category: 'tech',
        feedCategory: 'engineering',
      },
      {
        name: 'Spotify Engineering',
        url: 'https://engineering.atspotify.com/feed/',
        type: 'rss',
        category: 'tech',
        feedCategory: 'engineering',
      },
      {
        name: 'Meta Engineering',
        url: 'https://engineering.fb.com/feed/',
        type: 'rss',
        category: 'tech',
        feedCategory: 'engineering',
      },
      {
        name: 'Airbnb Engineering',
        url: 'https://medium.com/feed/airbnb-engineering',
        type: 'rss',
        category: 'tech',
        feedCategory: 'engineering',
      },
      {
        name: 'Stripe Engineering',
        url: 'https://stripe.com/blog/feed.rss',
        type: 'rss',
        category: 'tech',
        feedCategory: 'engineering',
      },
    ],
  },
  {
    id: 'ai-ml',
    name: 'IA & Machine Learning',
    description: 'Intelligence artificielle et machine learning',
    feeds: [
      {
        name: 'DeepMind',
        url: 'https://deepmind.com/blog/feed/basic/',
        type: 'rss',
        category: 'tech',
        feedCategory: 'ai-ml',
      },
      {
        name: 'The Berkeley AI Research Blog',
        url: 'https://bair.berkeley.edu/blog/feed.xml',
        type: 'rss',
        category: 'tech',
        feedCategory: 'ai-ml',
      },
      {
        name: 'ML@CMU',
        url: 'https://blog.ml.cmu.edu/feed/',
        type: 'rss',
        category: 'tech',
        feedCategory: 'ai-ml',
      },
      {
        name: 'Towards Data Science',
        url: 'https://towardsdatascience.com/feed',
        type: 'rss',
        category: 'tech',
        feedCategory: 'ai-ml',
      },
      {
        name: 'Distill',
        url: 'https://distill.pub/rss.xml',
        type: 'rss',
        category: 'tech',
        feedCategory: 'ai-ml',
      },
    ],
  },
  {
    id: 'design-ux',
    name: 'Design & UX',
    description: 'Design, UX et interfaces utilisateur',
    feeds: [
      {
        name: 'UX Planet',
        url: 'https://uxplanet.org/feed',
        type: 'rss',
        category: 'tech',
        feedCategory: 'design-ux',
      },
      {
        name: 'Nielsen Norman Group',
        url: 'https://www.nngroup.com/feed/rss/',
        type: 'rss',
        category: 'tech',
        feedCategory: 'design-ux',
      },
      {
        name: 'UX Collective',
        url: 'https://uxdesign.cc/feed',
        type: 'rss',
        category: 'tech',
        feedCategory: 'design-ux',
      },
      {
        name: 'Smashing Magazine',
        url: 'https://www.smashingmagazine.com/feed/',
        type: 'rss',
        category: 'tech',
        feedCategory: 'design-ux',
      },
      {
        name: 'CSS-Tricks',
        url: 'https://css-tricks.com/feed/',
        type: 'rss',
        category: 'tech',
        feedCategory: 'design-ux',
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing & Growth',
    description: 'Marketing digital et stratégies de croissance',
    feeds: [
      {
        name: 'Seth Godin',
        url: 'https://seths.blog/feed/',
        type: 'rss',
        category: 'business',
        feedCategory: 'marketing',
      },
      {
        name: 'HubSpot Marketing',
        url: 'https://blog.hubspot.com/marketing/rss.xml',
        type: 'rss',
        category: 'business',
        feedCategory: 'marketing',
      },
      {
        name: 'Moz Blog',
        url: 'https://moz.com/blog/feed',
        type: 'rss',
        category: 'business',
        feedCategory: 'marketing',
      },
    ],
  },
  {
    id: 'learning',
    name: 'Apprentissage & Développement Personnel',
    description: 'Apprentissage, productivité et développement personnel',
    feeds: [
      {
        name: 'Farnam Street',
        url: 'https://fs.blog/feed/',
        type: 'rss',
        category: 'personal',
        feedCategory: 'learning',
      },
      {
        name: 'Ness Labs',
        url: 'https://nesslabs.com/feed',
        type: 'rss',
        category: 'personal',
        feedCategory: 'learning',
      },
      {
        name: 'Big Think',
        url: 'https://bigthink.com/feed/',
        type: 'rss',
        category: 'personal',
        feedCategory: 'learning',
      },
    ],
  },
  {
    id: 'science',
    name: 'Science & Innovation',
    description: 'Sciences, recherche et innovation',
    feeds: [
      {
        name: 'Quanta Magazine',
        url: 'https://www.quantamagazine.org/feed/',
        type: 'rss',
        category: 'tech',
        feedCategory: 'science',
      },
      {
        name: 'MIT News',
        url: 'https://news.mit.edu/rss/research',
        type: 'rss',
        category: 'tech',
        feedCategory: 'science',
      },
      {
        name: 'Nature News',
        url: 'https://www.nature.com/nature.rss',
        type: 'rss',
        category: 'tech',
        feedCategory: 'science',
      },
      {
        name: 'ScienceAlert',
        url: 'https://www.sciencealert.com/rss',
        type: 'rss',
        category: 'tech',
        feedCategory: 'science',
      },
      {
        name: 'Singularity Hub',
        url: 'https://singularityhub.com/feed/',
        type: 'rss',
        category: 'tech',
        feedCategory: 'science',
      },
    ],
  },
];
