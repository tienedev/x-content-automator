import { createWorkflow, createStep } from '@mastra/core/workflows';
import { RuntimeContext } from '@mastra/core/di';
import { z } from 'zod';
import { newsAnalyzer } from '../agents/newsAnalyzer';
import { contentCreator } from '../agents/contentCreator';
import { analyzeViralPotential } from '../tools/newsScoring';

// Step 1: Analyser et sélectionner les meilleures actualités
const selectTopNewsStep = createStep({
  id: 'select-top-news',
  description: 'Analyze and select the best news items for content generation',
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
    selectedNews: z.array(
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
    // Utilise le tool pour scorer toutes les news
    const viralResult = await analyzeViralPotential.execute({
      context: { newsItems: inputData.newsItems },
      runtimeContext: new RuntimeContext(),
    });
    const { rankedNews } = viralResult;

    // Sélectionner intelligemment les meilleures actualités
    // Garde les 3 meilleures avec un score > 5, ou au minimum 1 avec le meilleur score
    let selectedNews = rankedNews.filter(news => news.viralScore > 5).slice(0, 3);

    if (selectedNews.length === 0 && rankedNews.length > 0) {
      // Si aucune actualité avec un bon score, prendre au moins la meilleure
      selectedNews = [rankedNews[0]];
    }

    console.log(`📊 Actualités sélectionnées: ${selectedNews.length}/${rankedNews.length}`);

    return { selectedNews };
  },
});

// Step 2: Générer du contenu pour chaque actualité sélectionnée
const generateMultiplePostsStep = createStep({
  id: 'generate-multiple-posts',
  description: 'Generate content for each selected news item',
  inputSchema: z.object({
    selectedNews: z.array(
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
    generatedPosts: z.array(
      z.object({
        finalPost: z.object({
          content: z.string(),
          format: z.string(),
          hashtags: z.array(z.string()),
          sourceUrl: z.string(),
          category: z.enum(['tech', 'business']),
        }),
        sourceNews: z.object({
          title: z.string(),
          viralScore: z.number(),
        }),
      })
    ),
  }),
  execute: async ({ inputData }) => {
    const { selectedNews } = inputData;
    const generatedPosts = [];

    console.log(`🚀 Génération de contenu pour ${selectedNews.length} actualités`);

    // Générer un post pour chaque actualité sélectionnée
    for (const newsItem of selectedNews) {
      try {
        // Créer un prompt enrichi pour l'agent ContentCreator
        const prompt = `
Écris un post X/Twitter naturel et authentique sur cette actualité:

TITRE: ${newsItem.title}
DESCRIPTION: ${newsItem.description}
CATÉGORIE: ${newsItem.category}

CONTEXTE POUR T'INSPIRER:
- Angle d'engagement suggéré: ${newsItem.engagementAngle}
- Approche émotionnelle: ${newsItem.emotionalApproach}
- Hot take possible: ${newsItem.suggestedHotTake}
- Score viral: ${newsItem.viralScore}/10

CONSIGNES:
- Écris comme si tu découvrais cette news et que tu la partageais naturellement
- Varie ton style: parfois direct, parfois avec anecdote, parfois questionnement
- Utilise ton propre vocabulaire, pas des formules toutes faites
- Reste sous 280 caractères
- Ajoute 2-3 hashtags pertinents à la fin
- Assure-toi que ça sonne comme un vrai humain, pas comme une IA

EXEMPLES DE DÉBUTS VARIÉS (choisis ton style):
- "Alors là..." / "Bon..." / "En vrai..."
- "L'autre jour je me disais..." / "Ça me rappelle..."
- "Question bête:" / "C'est moi ou..."
- Directement par ton avis personnel

Ne reprends PAS les exemples, inspire-toi juste du ton !
        `;

        // Générer le contenu avec la mémoire (resourceId pour la persistence)
        const { text } = await contentCreator.generate([{ role: 'user', content: prompt }], {
          resourceId: 'content-creator-user', // ID fixe pour maintenir l'historique
          threadId: `generation-${Date.now()}`, // Thread unique pour chaque génération
        });

        // Extraire le contenu et les hashtags
        const lines = text.split('\n').filter(line => line.trim());
        const content = lines[0] || text;

        // Extraire les hashtags du contenu
        const hashtagMatches = content.match(/#[\w]+/g) || [];
        const hashtags = hashtagMatches.slice(0, 3);

        // Déterminer le format basé sur le score viral
        const format = determineFormatFromScore(newsItem.viralScore);

        const finalPost = {
          content: content.trim(),
          format: format,
          hashtags: hashtags,
          sourceUrl: newsItem.link,
          category: newsItem.category,
        };

        generatedPosts.push({
          finalPost,
          sourceNews: {
            title: newsItem.title,
            viralScore: newsItem.viralScore,
          },
        });

        // Mettre à jour la working memory avec le nouveau post
        await updateWorkingMemoryWithNewPost(finalPost, newsItem);

        console.log(`✅ Post généré pour: ${newsItem.title.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ Erreur génération pour ${newsItem.title}:`, error);
        // Continue avec les autres actualités
      }
    }

    return { generatedPosts };
  },
});

// Workflow principal
export const multiContentGenerationWorkflow = createWorkflow({
  id: 'multi-content-generation',
  description: 'Analyzes news and generates multiple engaging social media posts',
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
    generatedPosts: z.array(
      z.object({
        finalPost: z.object({
          content: z.string(),
          format: z.string(),
          hashtags: z.array(z.string()),
          sourceUrl: z.string(),
          category: z.enum(['tech', 'business']),
        }),
        sourceNews: z.object({
          title: z.string(),
          viralScore: z.number(),
        }),
      })
    ),
  }),
})
  .then(selectTopNewsStep)
  .then(generateMultiplePostsStep)
  .commit();

// Fonctions utilitaires
function determineFormatFromScore(
  viralScore: number
): 'hot-take' | 'question' | 'mini-story' | 'analysis' | 'comparison' {
  if (viralScore >= 8) return 'hot-take';
  if (viralScore >= 7) return 'question';
  if (viralScore >= 6) return 'analysis';
  if (viralScore >= 5) return 'comparison';
  return 'mini-story';
}

// Fonction pour mettre à jour la working memory avec le nouveau post
async function updateWorkingMemoryWithNewPost(
  finalPost: {
    content: string;
    format: string;
    hashtags: string[];
    sourceUrl: string;
    category: string;
  },
  newsItem: {
    title: string;
    viralScore: number;
  }
) {
  try {
    // Extraire le sujet principal du titre de l'actualité
    const subject = newsItem.title.split(':')[0].split('-')[0].trim();
    
    // Déterminer le style basé sur le début du post
    const content = finalPost.content.toLowerCase();
    let style = 'direct';
    if (content.includes('question') || content.includes('?')) style = 'question';
    else if (content.includes('hier') || content.includes('autre jour') || content.includes('rappelle')) style = 'anecdote';
    else if (content.includes('bon alors') || content.includes('en vrai') || content.includes('franchement')) style = 'direct';
    
    // Extraire les premiers mots (environ 30 caractères)
    const debut = finalPost.content.substring(0, 30) + (finalPost.content.length > 30 ? '...' : '');
    
    // Créer le prompt pour mettre à jour la working memory
    const memoryUpdatePrompt = `
Mets à jour ton historique des posts dans ta working memory avec ce nouveau post que tu viens de créer:

NOUVEAU POST:
- Sujet: ${subject}
- Style: ${style}
- Format: ${finalPost.format}
- Début: "${debut}"

Instructions:
1. Décale tous les posts existants d'un rang (le Post le plus récent devient Post -1, etc.)
2. Ajoute ce nouveau post comme "Post le plus récent"
3. Supprime le plus ancien (Post -4 devient supprimé)
4. Garde le même format de template

Ne réponds rien d'autre que la mise à jour de ta working memory.
    `;

    // Appeler l'agent pour qu'il mette à jour sa mémoire
    await contentCreator.generate([{ role: 'user', content: memoryUpdatePrompt }], {
      resourceId: 'content-creator-user',
      threadId: `memory-update-${Date.now()}`,
    });

    console.log(`🧠 Mémoire mise à jour avec le post sur: ${subject}`);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la working memory:', error);
    // Ne pas faire échouer la génération si la mise à jour mémoire échoue
  }
}
