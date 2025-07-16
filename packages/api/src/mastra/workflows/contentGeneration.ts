import { createWorkflow, createStep } from '@mastra/core/workflows';
import { RuntimeContext } from '@mastra/core/di';
import { z } from 'zod';
import { newsAnalyzer } from '../agents/newsAnalyzer';
import { contentCreator } from '../agents/contentCreator';
import { analyzeViralPotential } from '../tools/newsScoring';

// Step 1: Analyser les news RSS pour identifier le potentiel viral
const analyzeNewsStep = createStep({
  id: 'analyze-news',
  description: 'Analyze RSS feed items for viral potential',
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
    topNews: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        link: z.string(),
        pubDate: z.string(),
        category: z.enum(['tech', 'business']),
        viralScore: z.number(),
        engagementAngle: z.string(),
        emotionalApproach: z.string(),
        suggestedHotTake: z.string(),
        reasoning: z.string(),
      })
    ),
  }),
  execute: async ({ inputData }) => {
    // Utilise le tool pour scorer les news
    // Utilise le tool directement avec les paramètres
    const viralResult = await analyzeViralPotential.execute({
      context: { newsItems: inputData.newsItems },
      runtimeContext: new RuntimeContext(),
    });
    const { rankedNews } = viralResult;

    // Ne garde que les top 3 news avec un score > 6
    const topNews = rankedNews.filter(news => news.viralScore > 6).slice(0, 3);

    return { topNews };
  },
});

// Step 2: Utiliser l'agent NewsAnalyzer pour une analyse approfondie
const deepAnalysisStep = createStep({
  id: 'deep-analysis',
  description: 'Deep analysis of top news using NewsAnalyzer agent',
  inputSchema: z.object({
    topNews: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        link: z.string(),
        pubDate: z.string(),
        category: z.enum(['tech', 'business']),
        viralScore: z.number(),
        engagementAngle: z.string(),
        emotionalApproach: z.string(),
        suggestedHotTake: z.string(),
        reasoning: z.string(),
      })
    ),
  }),
  outputSchema: z.object({
    selectedNews: z.object({
      title: z.string(),
      description: z.string(),
      link: z.string(),
      category: z.enum(['tech', 'business']),
      analysis: z.string(),
      recommendedFormat: z.enum(['hot-take', 'question', 'mini-story', 'analysis', 'comparison']),
    }),
  }),
  execute: async ({ inputData }) => {
    if (inputData.topNews.length === 0) {
      throw new Error('No news with sufficient viral potential found');
    }

    // Prend la news avec le meilleur score
    const bestNews = inputData.topNews[0];

    // Utilise l'agent pour une analyse approfondie
    const prompt = `
    Analyse cette actualité:
    Titre: ${bestNews.title}
    Description: ${bestNews.description}
    
    Angle d'engagement suggéré: ${bestNews.engagementAngle}
    Hot take possible: ${bestNews.suggestedHotTake}
    
    Donne-moi:
    1. Une analyse approfondie du potentiel d'engagement
    2. Le format de post le plus adapté (hot-take, question, mini-story, analysis, comparison)
    3. Les éléments clés à mettre en avant
    `;

    const { text } = await newsAnalyzer.generate([{ role: 'user', content: prompt }]);

    // Détermine le format recommandé basé sur l'analyse
    const recommendedFormat = determineFormat(text);

    return {
      selectedNews: {
        title: bestNews.title,
        description: bestNews.description,
        link: bestNews.link,
        category: bestNews.category,
        analysis: text,
        recommendedFormat,
      },
    };
  },
});

// Step 3: Générer les variations de contenu
const generateVariationsStep = createStep({
  id: 'generate-variations',
  description: 'Generate content variations',
  inputSchema: z.object({
    selectedNews: z.object({
      title: z.string(),
      description: z.string(),
      link: z.string(),
      category: z.enum(['tech', 'business']),
      analysis: z.string(),
      recommendedFormat: z.enum(['hot-take', 'question', 'mini-story', 'analysis', 'comparison']),
    }),
  }),
  outputSchema: z.object({
    newsContext: z.object({
      title: z.string(),
      link: z.string(),
      category: z.enum(['tech', 'business']),
    }),
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
  execute: async ({ inputData }) => {
    const { selectedNews } = inputData;

    // Utilise directement l'agent ContentCreator pour générer des variations
    const prompt = `
Écris 3 variations de posts X/Twitter sur cette actualité:

TITRE: ${selectedNews.title}
DESCRIPTION: ${selectedNews.description}
FORMAT RECOMMANDÉ: ${selectedNews.recommendedFormat}
ANALYSE: ${selectedNews.analysis}

Pour chaque variation:
1. Utilise un style différent (direct, anecdote, question)
2. Reste sous 280 caractères
3. Ajoute 2-3 hashtags
4. Assure-toi que ça sonne naturel et humain

Format de réponse:
VARIATION 1: [post]
VARIATION 2: [post]  
VARIATION 3: [post]
    `;

    const { text } = await contentCreator.generate([{ role: 'user', content: prompt }]);

    // Parse les variations
    const variations = parseVariations(text, selectedNews.recommendedFormat);

    return {
      newsContext: {
        title: selectedNews.title,
        link: selectedNews.link,
        category: selectedNews.category,
      },
      variations,
    };
  },
});

// Step 4: Utiliser ContentCreator pour finaliser le post
const createFinalPostStep = createStep({
  id: 'create-final-post',
  description: 'Create final post using ContentCreator agent',
  inputSchema: z.object({
    newsContext: z.object({
      title: z.string(),
      link: z.string(),
      category: z.enum(['tech', 'business']),
    }),
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
    const { newsContext, variations } = inputData;

    // Prend la meilleure variation
    const bestVariation = variations.find(v => v.estimatedEngagement === 'high') || variations[0];

    // Utilise l'agent ContentCreator pour peaufiner
    const prompt = `
    Voici un brouillon de post sur cette actualité:
    ${newsContext.title}
    
    Brouillon actuel:
    ${bestVariation.content}
    
    Format: ${bestVariation.format}
    Ton: ${bestVariation.tone}
    
    Améliore ce post en:
    1. Le rendant plus personnel et authentique
    2. Ajustant pour maximiser l'engagement
    3. Vérifiant qu'il respecte la limite de 280 caractères
    4. Gardant le même format mais en améliorant l'impact
    
    Donne-moi aussi 2 alternatives dans des styles différents.
    `;

    const { text } = await contentCreator.generate([{ role: 'user', content: prompt }]);

    // Parse la réponse pour extraire le post final et les alternatives
    const { finalContent, alternatives } = parseContentCreatorResponse(text);

    return {
      finalPost: {
        content: finalContent,
        format: bestVariation.format,
        hashtags: bestVariation.hashtags,
        sourceUrl: newsContext.link,
        category: newsContext.category,
      },
      alternatives,
    };
  },
});

// Workflow principal
export const contentGenerationWorkflow = createWorkflow({
  id: 'content-generation',
  description: 'Analyzes news and generates engaging social media content',
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
  .then(analyzeNewsStep)
  .then(deepAnalysisStep)
  .then(generateVariationsStep)
  .then(createFinalPostStep)
  .commit();

// Fonctions utilitaires
function determineFormat(
  analysis: string
): 'hot-take' | 'question' | 'mini-story' | 'analysis' | 'comparison' {
  // Logique simple pour déterminer le format basé sur l'analyse
  const lowerAnalysis = analysis.toLowerCase();
  if (lowerAnalysis.includes('controvers') || lowerAnalysis.includes('opinion')) return 'hot-take';
  if (lowerAnalysis.includes('question') || lowerAnalysis.includes('pourquoi')) return 'question';
  if (lowerAnalysis.includes('histoire') || lowerAnalysis.includes('expérience'))
    return 'mini-story';
  if (lowerAnalysis.includes('implic') || lowerAnalysis.includes('analyse')) return 'analysis';
  if (lowerAnalysis.includes('compar') || lowerAnalysis.includes('similaire')) return 'comparison';

  return 'hot-take'; // Par défaut
}

function extractFromAnalysis(analysis: string, type: 'angle' | 'emotion' | 'hottake'): string {
  // Extraction simplifiée - en production, utiliser une approche plus robuste
  const lines = analysis.split('\n');

  switch (type) {
    case 'angle':
      return (
        lines.find(l => l.includes('angle') || l.includes('perspective')) ||
        "Impact sur l'industrie"
      );
    case 'emotion':
      return (
        lines.find(l => l.includes('émotion') || l.includes('sentiment')) ||
        'Curiosité et questionnement'
      );
    case 'hottake':
      return (
        lines.find(l => l.includes('opinion') || l.includes('take')) ||
        'Une perspective unique sur cette actualité'
      );
  }
}

function parseVariations(
  text: string,
  format: string
): Array<{
  content: string;
  format: string;
  tone: string;
  estimatedEngagement: 'high' | 'medium' | 'low';
  hashtags: string[];
}> {
  const variations = [];
  const lines = text.split('\n').filter(l => l.trim());

  const variationTexts = lines
    .filter(line => line.includes('VARIATION') || (line.length > 20 && line.length < 300))
    .slice(0, 3);

  for (let i = 0; i < Math.max(variationTexts.length, 1); i++) {
    const content = variationTexts[i] || text.substring(0, 280);
    const cleanContent = content.replace(/^VARIATION \d+:\s*/, '').trim();

    // Extraire hashtags
    const hashtags = cleanContent.match(/#[\w]+/g) || [];

    variations.push({
      content: cleanContent,
      format: format,
      tone: i === 0 ? 'direct' : i === 1 ? 'personnel' : 'question',
      estimatedEngagement: i === 0 ? ('high' as const) : ('medium' as const),
      hashtags: hashtags.slice(0, 3),
    });
  }

  return variations;
}

function parseContentCreatorResponse(text: string): {
  finalContent: string;
  alternatives: Array<{ content: string; format: string }>;
} {
  // Parse simple de la réponse - en production, utiliser une approche plus robuste
  const lines = text.split('\n').filter(l => l.trim());

  const finalContent = lines[0] || text.substring(0, 280);
  const alternatives = [
    { content: lines[2] || 'Alternative 1', format: 'question' },
    { content: lines[3] || 'Alternative 2', format: 'analysis' },
  ];

  return { finalContent, alternatives };
}
