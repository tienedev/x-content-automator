import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const analyzeViralPotential = createTool({
  id: 'analyze-viral-potential',
  description: 'Analyzes news items for viral potential on social media',
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
    rankedNews: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        link: z.string(),
        pubDate: z.string(),
        category: z.enum(['tech', 'business']),
        viralScore: z.number().min(0).max(10),
        engagementAngle: z.string(),
        emotionalApproach: z.string(),
        suggestedHotTake: z.string(),
        reasoning: z.string(),
      })
    ),
  }),
  execute: async ({ context, runtimeContext: _runtimeContext }) => {
    const { newsItems } = context;

    // Cette logique pourrait être remplacée par un appel à l'agent NewsAnalyzer
    // Pour l'instant, on fait une analyse simplifiée
    const rankedNews = newsItems.map(item => {
      // Facteurs de viralité
      let viralScore = 5; // Score de base

      // Mots-clés qui augmentent le potentiel viral
      const viralKeywords = [
        'AI',
        'ChatGPT',
        'layoffs',
        'acquisition',
        'leaked',
        'controversial',
        'breakthrough',
        'first',
        'exclusive',
        'shutdown',
        'hack',
        'security',
        'billion',
        'revolutionize',
      ];

      const contentToAnalyze = `${item.title} ${item.description}`.toLowerCase();

      // Augmente le score pour chaque mot-clé trouvé
      viralKeywords.forEach(keyword => {
        if (contentToAnalyze.includes(keyword.toLowerCase())) {
          viralScore += 0.5;
        }
      });

      // Ajuste selon la catégorie
      if (item.category === 'tech' && contentToAnalyze.includes('ai')) {
        viralScore += 1;
      }

      viralScore = Math.min(viralScore, 10);

      // Génère des suggestions basées sur le contenu
      const engagementAngle = generateEngagementAngle(item);
      const emotionalApproach = generateEmotionalApproach(item);
      const suggestedHotTake = generateHotTake(item);

      return {
        ...item,
        viralScore,
        engagementAngle,
        emotionalApproach,
        suggestedHotTake,
        reasoning: `Score basé sur: présence de mots-clés viraux, potentiel de controverse, nouveauté du sujet.`,
      };
    });

    // Trie par score viral décroissant
    rankedNews.sort((a, b) => b.viralScore - a.viralScore);

    return { rankedNews };
  },
});

function generateEngagementAngle(item: { title: string; description: string }): string {
  const content = `${item.title} ${item.description}`.toLowerCase();

  if (content.includes('ai') || content.includes('intelligence artificielle')) {
    return "L'impact sur les développeurs et créateurs de contenu";
  }
  if (content.includes('layoff') || content.includes('licenciement')) {
    return 'Les leçons à tirer pour les professionnels tech';
  }
  if (content.includes('startup') || content.includes('funding')) {
    return "Ce que ça révèle sur l'état du marché";
  }
  return 'Les implications cachées de cette actualité';
}

function generateEmotionalApproach(item: { title: string; description: string }): string {
  const content = `${item.title} ${item.description}`.toLowerCase();

  if (content.includes('breakthrough') || content.includes('revolutionary')) {
    return 'Enthousiasme mesuré avec questionnement';
  }
  if (content.includes('controversial') || content.includes('debate')) {
    return 'Curiosité avec perspective nuancée';
  }
  if (content.includes('problem') || content.includes('issue')) {
    return 'Empathie avec recherche de solutions';
  }
  return 'Intérêt authentique avec analyse critique';
}

function generateHotTake(item: { title: string; description: string }): string {
  const content = `${item.title} ${item.description}`.toLowerCase();

  if (content.includes('ai')) {
    return "Tout le monde parle d'IA, mais personne ne mentionne...";
  }
  if (content.includes('funding') || content.includes('investment')) {
    return 'Ce financement révèle une tendance que peu ont remarquée...';
  }
  if (content.includes('google') || content.includes('microsoft') || content.includes('apple')) {
    return 'Les géants tech nous montrent encore une fois que...';
  }
  return "Voici pourquoi cette news est plus importante qu'elle n'en a l'air...";
}
