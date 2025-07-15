import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { contentCreator } from '../agents/contentCreator';

// Workflow simplifié qui utilise directement l'agent ContentCreator
const generateContentStep = createStep({
  id: 'generate-content',
  description: 'Generate content using ContentCreator agent',
  inputSchema: z.object({
    newsItems: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        link: z.string(),
        pubDate: z.string(),
        category: z.enum(['tech', 'business']),
      })
    ),
  }),
  outputSchema: z.object({
    finalPost: z.object({
      content: z.string(),
      format: z.string(),
      hashtags: z.array(z.string()),
      sourceUrl: z.string(),
      category: z.enum(['tech', 'business']),
    }),
    alternatives: z.array(
      z.object({
        content: z.string(),
        format: z.string(),
      })
    ),
  }),
  execute: async ({ inputData }) => {
    const { newsItems } = inputData;

    if (!newsItems || newsItems.length === 0) {
      throw new Error('No news items provided');
    }

    // Prendre la première actualité comme base
    const primaryNews = newsItems[0];

    // Créer un prompt structuré pour l'agent
    const prompt = `
Créez un post engageant pour X/Twitter basé sur cette actualité:

Titre: ${primaryNews.title}
Description: ${primaryNews.description}
Lien: ${primaryNews.link}
Catégorie: ${primaryNews.category}

Instructions:
1. Créez un post principal authentique et personnel (max 280 caractères)
2. Utilisez un ton professionnel mais accessible
3. Ajoutez 2-3 hashtags pertinents
4. Créez 2 alternatives dans des styles différents

Format de réponse:
POST_PRINCIPAL: [votre post principal]
HASHTAGS: #hashtag1 #hashtag2 #hashtag3
ALT1: [première alternative]
ALT2: [deuxième alternative]
`;

    // Générer le contenu avec l'agent
    const { text } = await contentCreator.generate([{ role: 'user', content: prompt }]);

    // Parser la réponse
    const result = parseAgentResponse(text, primaryNews);

    return result;
  },
});

// Workflow principal simplifié
export const simpleContentGenerationWorkflow = createWorkflow({
  id: 'simple-content-generation',
  description: 'Simple content generation using ContentCreator agent',
  inputSchema: z.object({
    newsItems: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        link: z.string(),
        pubDate: z.string(),
        category: z.enum(['tech', 'business']),
      })
    ),
  }),
  outputSchema: z.object({
    finalPost: z.object({
      content: z.string(),
      format: z.string(),
      hashtags: z.array(z.string()),
      sourceUrl: z.string(),
      category: z.enum(['tech', 'business']),
    }),
    alternatives: z.array(
      z.object({
        content: z.string(),
        format: z.string(),
      })
    ),
  }),
})
  .then(generateContentStep)
  .commit();

// Fonction utilitaire pour parser la réponse de l'agent
function parseAgentResponse(text: string, newsItem: any) {
  const lines = text.split('\n').filter(l => l.trim());

  let mainPost = '';
  let hashtags: string[] = [];
  let alt1 = '';
  let alt2 = '';

  for (const line of lines) {
    if (line.startsWith('POST_PRINCIPAL:')) {
      mainPost = line.replace('POST_PRINCIPAL:', '').trim();
    } else if (line.startsWith('HASHTAGS:')) {
      const hashtagsText = line.replace('HASHTAGS:', '').trim();
      hashtags = hashtagsText.split(' ').filter(h => h.startsWith('#'));
    } else if (line.startsWith('ALT1:')) {
      alt1 = line.replace('ALT1:', '').trim();
    } else if (line.startsWith('ALT2:')) {
      alt2 = line.replace('ALT2:', '').trim();
    }
  }

  // Fallbacks si le parsing échoue
  if (!mainPost) {
    mainPost = text.substring(0, 280);
  }

  if (hashtags.length === 0) {
    hashtags = newsItem.category === 'tech' ? ['#Tech', '#Innovation'] : ['#Business', '#Strategy'];
  }

  return {
    finalPost: {
      content: mainPost,
      format: 'social-post',
      hashtags,
      sourceUrl: newsItem.link,
      category: newsItem.category,
    },
    alternatives: [
      {
        content: alt1 || 'Alternative 1: ' + mainPost.substring(0, 100) + '...',
        format: 'alternative',
      },
      {
        content: alt2 || 'Alternative 2: ' + mainPost.substring(0, 100) + '...',
        format: 'alternative',
      },
    ],
  };
}
