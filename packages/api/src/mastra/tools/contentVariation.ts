import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const generateContentVariations = createTool({
  id: 'generate-content-variations',
  description: 'Generates multiple content variations for A/B testing',
  inputSchema: z.object({
    newsItem: z.object({
      title: z.string(),
      description: z.string(),
      link: z.string(),
      category: z.enum(['tech', 'business']),
      engagementAngle: z.string(),
      emotionalApproach: z.string(),
      suggestedHotTake: z.string(),
    }),
    postFormat: z.enum(['hot-take', 'question', 'mini-story', 'analysis', 'comparison']),
  }),
  outputSchema: z.object({
    variations: z.array(
      z.object({
        content: z.string(),
        format: z.string(),
        tone: z.string(),
        estimatedEngagement: z.enum(['high', 'medium', 'low']),
        hashtags: z.array(z.string()),
      })
    ),
  }),
  execute: async ({ context, runtimeContext: _runtimeContext }) => {
    const { newsItem, postFormat } = context;
    const variations = [];

    // Génère différentes variations selon le format
    switch (postFormat) {
      case 'hot-take':
        variations.push(
          {
            content: `Unpopular opinion: ${newsItem.suggestedHotTake}\n\n${truncateForTwitter(
              newsItem.engagementAngle
            )}\n\nQu'est-ce que vous en pensez?`,
            format: 'hot-take',
            tone: 'provocateur-constructif',
            estimatedEngagement: 'high' as const,
            hashtags: generateHashtags(newsItem),
          },
          {
            content: `${newsItem.suggestedHotTake}\n\nJe sais que c'est controversé, mais laissez-moi vous expliquer...`,
            format: 'hot-take',
            tone: 'nuancé',
            estimatedEngagement: 'medium' as const,
            hashtags: generateHashtags(newsItem).slice(0, 2),
          }
        );
        break;

      case 'question':
        variations.push(
          {
            content: `Est-ce que je suis le seul à penser que ${newsItem.title
              .toLowerCase()
              .replace(
                /[.!?]$/,
                ''
              )} ${generateQuestionEnding(newsItem)}?\n\nCurieux d'avoir vos avis 👇`,
            format: 'question',
            tone: 'curieux',
            estimatedEngagement: 'high' as const,
            hashtags: generateHashtags(newsItem),
          },
          {
            content: `Question sérieuse: ${generateThoughtfulQuestion(
              newsItem
            )}\n\nPartagez vos expériences!`,
            format: 'question',
            tone: 'réflexif',
            estimatedEngagement: 'medium' as const,
            hashtags: generateHashtags(newsItem).slice(0, 3),
          }
        );
        break;

      case 'mini-story':
        variations.push({
          content: `Ce matin, en lisant sur ${extractMainTopic(
            newsItem
          )}, j'ai eu une révélation...\n\n${newsItem.emotionalApproach}\n\nVous avez déjà ressenti ça?`,
          format: 'mini-story',
          tone: 'personnel',
          estimatedEngagement: 'high' as const,
          hashtags: generateHashtags(newsItem),
        });
        break;

      case 'analysis':
        variations.push({
          content: `3 implications de ${extractMainTopic(newsItem)} que personne ne mentionne:\n\n1. ${generateImplication(
            newsItem,
            1
          )}\n2. ${generateImplication(newsItem, 2)}\n3. ${generateImplication(
            newsItem,
            3
          )}\n\nLequel vous impacte le plus?`,
          format: 'analysis',
          tone: 'analytique',
          estimatedEngagement: 'medium' as const,
          hashtags: generateHashtags(newsItem),
        });
        break;

      case 'comparison':
        variations.push({
          content: `${newsItem.title} me rappelle ${generateAnalogy(
            newsItem
          )}.\n\n${newsItem.engagementAngle}\n\nVous voyez d'autres parallèles?`,
          format: 'comparison',
          tone: 'accessible',
          estimatedEngagement: 'medium' as const,
          hashtags: generateHashtags(newsItem),
        });
        break;
    }

    return { variations };
  },
});

function truncateForTwitter(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

function generateHashtags(newsItem: {
  title: string;
  description: string;
  category: string;
}): string[] {
  const hashtags = [];
  const content = `${newsItem.title} ${newsItem.description}`.toLowerCase();

  if (newsItem.category === 'tech') {
    hashtags.push('#Tech');
    if (content.includes('ai')) hashtags.push('#AI', '#ArtificialIntelligence');
    if (content.includes('startup')) hashtags.push('#Startup');
    if (content.includes('dev')) hashtags.push('#DevCommunity');
  }

  if (newsItem.category === 'business') {
    hashtags.push('#Business');
    if (content.includes('strategy')) hashtags.push('#Strategy');
    if (content.includes('growth')) hashtags.push('#Growth');
    if (content.includes('entrepreneur')) hashtags.push('#Entrepreneur');
  }

  return hashtags.slice(0, 4);
}

function generateQuestionEnding(_newsItem: { title: string; description: string }): string {
  const endings = [
    'change tout pour notre industrie',
    "n'est pas la vraie innovation",
    'va créer plus de problèmes que de solutions',
    'est exactement ce dont on avait besoin',
  ];
  return endings[Math.floor(Math.random() * endings.length)];
}

function generateThoughtfulQuestion(newsItem: { category: string; title: string }): string {
  if (newsItem.category === 'tech') {
    return `Comment ${extractMainTopic(newsItem)} va-t-il impacter votre workflow quotidien?`;
  }
  return `Quelle stratégie adopteriez-vous face à ${extractMainTopic(newsItem)}?`;
}

function extractMainTopic(newsItem: { title: string }): string {
  // Extrait le sujet principal du titre
  return newsItem.title.split(':')[0].split('-')[0].trim();
}

function generateImplication(newsItem: { category: string }, index: number): string {
  const implications: Record<string, string[]> = {
    tech: [
      'Impact sur les compétences requises',
      "Changement des standards de l'industrie",
      'Nouvelles opportunités de marché',
    ],
    business: [
      'Évolution des modèles économiques',
      'Redistribution des parts de marché',
      'Transformation des relations clients',
    ],
  };

  const categoryImplications = implications[newsItem.category as string];
  return categoryImplications?.[index - 1] || 'Impact à définir';
}

function generateAnalogy(_newsItem: unknown): string {
  const analogies = [
    "l'arrivée d'Internet dans les années 90",
    'la transition du desktop au mobile',
    "l'émergence des réseaux sociaux",
    'la révolution du cloud computing',
  ];
  return analogies[Math.floor(Math.random() * analogies.length)];
}
