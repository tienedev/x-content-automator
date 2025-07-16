import React, { useState } from 'react';
import type { PostCategory, MastraContentResult } from '@x-community/shared';
import { getMastraClient } from '@/lib/mastra';
import { FEED_TO_POST_CATEGORY } from '@/config/categories';

const ContentGenerator: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<PostCategory>('tech');
  const [generatedPosts, setGeneratedPosts] = useState<MastraContentResult[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [mastraError, setMastraError] = useState<string | null>(null);
  
  // Mode de génération : 'news' pour les actualités RSS, 'article' pour un article spécifique, 'text' pour du texte brut
  const [generationMode, setGenerationMode] = useState<'news' | 'article' | 'text'>('news');
  const [articleUrl, setArticleUrl] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [scrapingError, setScrapingError] = useState<string | null>(null);

  // Categories avec design Apple
  const categories = [
    { id: 'tech' as PostCategory, label: 'Tech', emoji: '💻', color: 'blue' },
    { id: 'business' as PostCategory, label: 'Business', emoji: '📈', color: 'green' },
    { id: 'personal' as PostCategory, label: 'Personnel', emoji: '✨', color: 'purple' },
  ];

  const handleGenerate = async (): Promise<void> => {
    setIsGenerating(true);
    setGeneratedPosts([]);
    setMastraError(null);

    try {
      // Récupérer les feed items récents pour la catégorie sélectionnée
      const feedItems = await window.electronAPI.storage.getFeedItems();
      console.log(`📰 Total feed items récupérés: ${feedItems.length}`);

      if (feedItems.length > 0) {
        console.log('🔍 Premier item exemple:', {
          title: feedItems[0].title,
          feedCategory: feedItems[0].feedCategory,
          categories: feedItems[0].categories,
        });
      }
      console.log(feedItems);
      console.log(`🎯 Filtrage pour: ${activeCategory}`);

      // Filtrer en utilisant le mapping des catégories
      const relevantItems = feedItems
        .filter(item => {
          // Vérifier si la feedCategory de l'item correspond à la catégorie sélectionnée
          const itemPostCategory = FEED_TO_POST_CATEGORY[item.feedCategory];
          return itemPostCategory === activeCategory;
        })
        .slice(0, 20) // Plus d'items pour que l'agent puisse choisir
        .map(item => ({
          title: item.title,
          description: item.description,
          link: item.link,
          pubDate: item.fetchedAt,
          category: activeCategory,
        }));

      console.log(`✅ Items filtrés trouvés: ${relevantItems.length}`);

      if (relevantItems.length === 0) {
        // Afficher plus d'infos pour le debug
        const feedCategoriesCount = feedItems.reduce(
          (acc, item) => {
            const postCategory = FEED_TO_POST_CATEGORY[item.feedCategory];
            acc[postCategory] = (acc[postCategory] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        if (feedItems.length === 0) {
          throw new Error(
            `Aucune actualité dans la base. Vérifiez que les sources RSS sont bien récupérées dans l'onglet Sources.`
          );
        } else {
          throw new Error(
            `Aucune actualité trouvée pour la catégorie ${activeCategory}. Répartition des actualités: ${JSON.stringify(feedCategoriesCount)}`
          );
        }
      }

      console.log(
        `🚀 Envoi de ${relevantItems.length} actualités au workflow pour analyse et sélection`
      );

      // Utiliser le nouveau workflow qui génère plusieurs posts selon l'agent
      const client = getMastraClient();
      const workflow = client.getWorkflow('multiContentGenerationWorkflow'); // Workflow qui détermine le nombre de posts

      const run = await workflow.createRun();

      const response = await workflow.startAsync({
        runId: run.runId,
        inputData: {
          newsItems: relevantItems, // Toutes les actualités pour que l'agent puisse choisir
        },
      });

      if (response.status === 'success') {
        const result = response.result;
        // Le nouveau workflow retourne plusieurs posts dans generatedPosts
        if (result.generatedPosts && result.generatedPosts.length > 0) {
          setGeneratedPosts(result.generatedPosts);
        } else {
          throw new Error('Aucun post généré par le workflow');
        }
      } else {
        throw new Error(`Workflow failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur génération:', error);
      setMastraError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromArticle = async (): Promise<void> => {
    if (!articleUrl.trim()) {
      setScrapingError('Veuillez entrer une URL valide');
      return;
    }

    setIsGenerating(true);
    setGeneratedPosts([]);
    setMastraError(null);
    setScrapingError(null);

    try {
      // Scraper l'article
      const scrapedContent = await window.electronAPI.scrapeArticle(articleUrl);
      
      if (!scrapedContent || !scrapedContent.content) {
        throw new Error('Impossible de récupérer le contenu de l\'article');
      }

      console.log('📰 Article scrapé:', scrapedContent.title);

      // Utiliser directement l'agent contentCreator pour générer 3 tweets
      const client = getMastraClient();
      const contentCreator = client.getAgent('contentCreator');

      const sourceContent = `Titre: ${scrapedContent.title}\n\nContenu: ${scrapedContent.content}`;
      
      // Générer 3 tweets avec des angles différents
      const tweetPromises = [
        contentCreator.generate({
          messages: [{ role: 'user', content: `Génère un tweet engageant basé sur cet article (angle opinion directe):\n\n${sourceContent}` }]
        }),
        contentCreator.generate({
          messages: [{ role: 'user', content: `Génère un tweet engageant basé sur cet article (angle question pour engager):\n\n${sourceContent}` }]
        }),
        contentCreator.generate({
          messages: [{ role: 'user', content: `Génère un tweet engageant basé sur cet article (angle réaction personnelle):\n\n${sourceContent}` }]
        })
      ];

      const responses = await Promise.all(tweetPromises);
      
      // Convertir les réponses au format attendu par l'interface
      const formattedPosts: MastraContentResult[] = responses.map((response, index) => ({
        finalPost: {
          content: response.text || 'Erreur de génération',
          format: ['single', 'question', 'opinion'][index] as 'single' | 'question' | 'opinion',
          hashtags: [], // L'agent inclut déjà les hashtags dans le contenu
          sourceUrl: articleUrl,
          category: 'tech' // Valeur par défaut pour correspondre au type
        },
        alternatives: [] // Pas d'alternatives pour le moment
      }));
      
      setGeneratedPosts(formattedPosts);
    } catch (error) {
      console.error('Erreur génération depuis article:', error);
      setMastraError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromText = async (): Promise<void> => {
    if (!rawText.trim()) {
      setScrapingError('Veuillez entrer du texte');
      return;
    }

    setIsGenerating(true);
    setGeneratedPosts([]);
    setMastraError(null);
    setScrapingError(null);

    try {
      console.log('📝 Génération depuis texte brut');

      // Utiliser directement l'agent contentCreator pour générer 3 tweets
      const client = getMastraClient();
      const contentCreator = client.getAgent('contentCreator');

      // Générer 3 tweets avec des angles différents
      const tweetPromises = [
        contentCreator.generate({
          messages: [{ role: 'user', content: `Génère un tweet engageant basé sur ce texte (angle opinion directe):\n\n${rawText}` }]
        }),
        contentCreator.generate({
          messages: [{ role: 'user', content: `Génère un tweet engageant basé sur ce texte (angle question pour engager):\n\n${rawText}` }]
        }),
        contentCreator.generate({
          messages: [{ role: 'user', content: `Génère un tweet engageant basé sur ce texte (angle réaction personnelle):\n\n${rawText}` }]
        })
      ];

      const responses = await Promise.all(tweetPromises);
      
      // Convertir les réponses au format attendu par l'interface
      const formattedPosts: MastraContentResult[] = responses.map((response, index) => ({
        finalPost: {
          content: response.text || 'Erreur de génération',
          format: ['single', 'question', 'opinion'][index] as 'single' | 'question' | 'opinion',
          hashtags: [], // L'agent inclut déjà les hashtags dans le contenu
          sourceUrl: '#',
          category: 'tech' // Valeur par défaut pour correspondre au type
        },
        alternatives: [] // Pas d'alternatives pour le moment
      }));
      
      setGeneratedPosts(formattedPosts);
    } catch (error) {
      console.error('Erreur génération depuis texte:', error);
      setMastraError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (content: string): Promise<void> => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  };

  const canGenerate = !isGenerating;
  const canGenerateFromArticle = !isGenerating && articleUrl.trim().length > 0;
  const canGenerateFromText = !isGenerating && rawText.trim().length > 0;

  return (
    <div className='h-screen bg-gray-50/30 dark:bg-background'>
      <div className='max-w-4xl mx-auto p-6'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-semibold text-gray-900 dark:text-foreground'>
            Génération de contenu
          </h1>
          <p className='text-gray-600 dark:text-muted-foreground mt-1'>
            Créez du contenu engageant basé sur les dernières actualités
          </p>
        </div>
        {/* Zone principale - Card unique centrée */}
        <div className='bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border overflow-hidden'>
          {/* Status Bar - Simple et discret */}
          {(mastraError || scrapingError) && (
            <div className='bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800/50'>
              <div className='px-6 py-3 flex items-center gap-3'>
                <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                <span className='text-sm text-red-800 dark:text-red-200'>{mastraError || scrapingError}</span>
              </div>
            </div>
          )}

          <div className='p-8'>
            {/* Mode de génération - Onglets */}
            <div className='mb-6'>
              <div className='flex justify-center'>
                <div className='inline-flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1'>
                  <button
                    onClick={() => setGenerationMode('news')}
                    className={`
                      px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      flex items-center gap-2
                      ${
                        generationMode === 'news'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <span className='text-base'>📰</span>
                    Actualités RSS
                  </button>
                  <button
                    onClick={() => setGenerationMode('article')}
                    className={`
                      px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      flex items-center gap-2
                      ${
                        generationMode === 'article'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <span className='text-base'>🔗</span>
                    Article spécifique
                  </button>
                  <button
                    onClick={() => setGenerationMode('text')}
                    className={`
                      px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      flex items-center gap-2
                      ${
                        generationMode === 'text'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <span className='text-base'>📝</span>
                    Texte brut
                  </button>
                </div>
              </div>
            </div>

            {/* Categories - Design épuré (seulement pour le mode news) */}
            {generationMode === 'news' && (
              <div className='mb-8'>
                <div className='flex justify-center'>
                  <div className='inline-flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1'>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`
                          px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                          flex items-center gap-2
                          ${
                            activeCategory === category.id
                              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                          }
                        `}
                      >
                        <span className='text-base'>{category.emoji}</span>
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Info de génération */}
            <div className='mb-8'>
              {generationMode === 'news' ? (
                <div className='bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 text-center'>
                  <p className='text-gray-600 dark:text-gray-400'>
                    L'IA va analyser les dernières actualités{' '}
                    <span className='font-medium text-gray-900 dark:text-white'>
                      {activeCategory}
                    </span>{' '}
                    et sélectionner les meilleures pour créer du contenu engageant.
                  </p>
                </div>
              ) : generationMode === 'article' ? (
                <div className='space-y-4'>
                  <div className='bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6'>
                    <p className='text-gray-600 dark:text-gray-400 mb-4'>
                      Entrez l'URL d'un article pour générer du contenu viral basé sur son contenu.
                    </p>
                    <input
                      type='url'
                      placeholder='https://example.com/article...'
                      value={articleUrl}
                      onChange={(e) => setArticleUrl(e.target.value)}
                      className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6'>
                    <p className='text-gray-600 dark:text-gray-400 mb-4'>
                      Collez votre texte pour générer du contenu viral basé sur vos idées.
                    </p>
                    <textarea
                      placeholder='Collez votre texte ici... (article, idée, note, etc.)'
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      rows={6}
                      className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                    />
                  </div>
                </div>
              )}
            </div>

            {/* CTA principal - Button hero */}
            <div className='flex justify-center mb-8'>
              {generationMode === 'news' ? (
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className={`
                    px-12 py-4 rounded-2xl font-semibold text-lg
                    transition-all duration-200 transform
                    flex items-center gap-3
                    ${
                      canGenerate
                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isGenerating ? (
                    <>
                      <div className='dots-loader'>
                        <div className='dot'></div>
                        <div className='dot'></div>
                        <div className='dot'></div>
                      </div>
                      Analyse et génération...
                    </>
                  ) : (
                    <>
                      <span className='text-xl'>🚀</span>
                      Générer du contenu {activeCategory}
                    </>
                  )}
                </button>
              ) : generationMode === 'article' ? (
                <button
                  onClick={handleGenerateFromArticle}
                  disabled={!canGenerateFromArticle}
                  className={`
                    px-12 py-4 rounded-2xl font-semibold text-lg
                    transition-all duration-200 transform
                    flex items-center gap-3
                    ${
                      canGenerateFromArticle
                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isGenerating ? (
                    <>
                      <div className='wave-loader'>
                        <div className='bar'></div>
                        <div className='bar'></div>
                        <div className='bar'></div>
                        <div className='bar'></div>
                      </div>
                      Analyse de l'article...
                    </>
                  ) : (
                    <>
                      <span className='text-xl'>🔗</span>
                      Générer depuis l'article
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleGenerateFromText}
                  disabled={!canGenerateFromText}
                  className={`
                    px-12 py-4 rounded-2xl font-semibold text-lg
                    transition-all duration-200 transform
                    flex items-center gap-3
                    ${
                      canGenerateFromText
                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isGenerating ? (
                    <>
                      <div className='orbital-loader'></div>
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <span className='text-xl'>📝</span>
                      Générer depuis le texte
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Résultats - Posts générés */}
        {generatedPosts.length > 0 && (
          <div className='mt-8 space-y-6'>
            {/* Header des résultats */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                <span className='font-medium text-gray-900 dark:text-white'>
                  {generatedPosts.length} post{generatedPosts.length > 1 ? 's' : ''} généré
                  {generatedPosts.length > 1 ? 's' : ''}
                </span>
                {generationMode === 'news' && (
                  <span className='text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full'>
                    {activeCategory}
                  </span>
                )}
              </div>

              <button
                onClick={() => setGeneratedPosts([])}
                className='
                  px-4 py-2 bg-gray-100 dark:bg-gray-700 
                  hover:bg-gray-200 dark:hover:bg-gray-600
                  text-gray-700 dark:text-gray-300
                  rounded-xl text-sm font-medium
                  transition-colors duration-200
                '
              >
                Effacer tout
              </button>
            </div>

            {/* Liste des posts */}
            <div className='grid gap-6'>
              {generatedPosts.map((post, index) => (
                <div
                  key={index}
                  className='bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-500'
                >
                  {/* Header du post */}
                  <div className='border-b border-gray-200 dark:border-border px-6 py-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <span className='font-medium text-gray-900 dark:text-white'>
                          Post #{index + 1}
                        </span>
                        <span className='text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full'>
                          {post.finalPost.format}
                        </span>
                      </div>

                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleCopy(post.finalPost.content)}
                          className='
                            px-4 py-2 bg-gray-100 dark:bg-gray-700 
                            hover:bg-gray-200 dark:hover:bg-gray-600
                            text-gray-700 dark:text-gray-300
                            rounded-xl text-sm font-medium
                            transition-colors duration-200
                            flex items-center gap-2
                          '
                        >
                          <span>📋</span>
                          Copier
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contenu du post */}
                  <div className='p-6'>
                    <div
                      className='
                      bg-gray-50 dark:bg-gray-700/50 
                      rounded-xl p-6 
                      text-gray-900 dark:text-gray-100
                      leading-relaxed
                      whitespace-pre-wrap
                      text-base
                    '
                    >
                      {post.finalPost.content}
                    </div>

                    {/* Hashtags */}
                    {post.finalPost.hashtags && post.finalPost.hashtags.length > 0 && (
                      <div className='mt-4 flex flex-wrap gap-2'>
                        {post.finalPost.hashtags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className='
                              px-3 py-1 bg-blue-100 dark:bg-blue-900/30 
                              text-blue-700 dark:text-blue-300
                              rounded-full text-sm font-medium
                            '
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Source */}
                    {post.finalPost.sourceUrl && post.finalPost.sourceUrl !== '#' && (
                      <div className='mt-4 pt-4 border-t border-gray-200 dark:border-border'>
                        <a
                          href={post.finalPost.sourceUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2'
                        >
                          <span>🔗</span>
                          Source du contenu
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state - Élégant */}
        {generatedPosts.length === 0 && !isGenerating && (
          <div className='mt-8 text-center py-16'>
            <div className='text-6xl mb-4'>🚀</div>
            <h3 className='text-xl font-medium text-gray-900 dark:text-white mb-2'>
              Générez du contenu automatiquement
            </h3>
            <p className='text-gray-600 dark:text-gray-400 max-w-md mx-auto'>
              {generationMode === 'news' ? (
                'Sélectionnez une catégorie et laissez l\'IA créer du contenu engageant basé sur les dernières actualités.'
              ) : generationMode === 'article' ? (
                'Entrez l\'URL d\'un article et laissez l\'IA créer du contenu viral basé sur son contenu.'
              ) : (
                'Collez votre texte et laissez l\'IA créer du contenu engageant basé sur vos idées.'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerator;
