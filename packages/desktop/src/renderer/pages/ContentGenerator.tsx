import React, { useState } from 'react';
import type { PostCategory, MastraContentResult } from '@x-community/shared';
import { useMastraSDK } from '@/hooks/useMastraSDK';

const ContentGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<PostCategory>('tech');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [mastraResult, setMastraResult] = useState<MastraContentResult | null>(null);

  const {
    isReady: isMastraReady,
    isLoading: isMastraLoading,
    error: mastraError,
    generateContent: generateWithMastra,
    status,
  } = useMastraSDK();

  // Categories avec design Apple
  const categories = [
    { id: 'tech' as PostCategory, label: 'Tech', emoji: '💻', color: 'blue' },
    { id: 'business' as PostCategory, label: 'Business', emoji: '📈', color: 'green' },
    { id: 'personal' as PostCategory, label: 'Personnel', emoji: '✨', color: 'purple' },
  ];

  const handleGenerate = async (): Promise<void> => {
    if (!prompt.trim() || !isMastraReady) return;

    setIsGenerating(true);
    setMastraResult(null);

    try {
      // Récupérer les feed items pour le contexte
      const feedItems = await window.electronAPI.storage.getFeedItems();
      const contextualItems = feedItems
        .filter(item => item.feedCategory.includes(activeCategory === 'tech' ? 'tech' : 'business'))
        .slice(0, 5)
        .map(item => ({
          title: item.title,
          description: item.description,
          link: item.link,
          pubDate: item.fetchedAt,
          categories: [activeCategory],
          content: prompt,
        }));

      if (contextualItems.length === 0) {
        contextualItems.push({
          title: prompt,
          description: `Contenu basé sur: ${prompt}`,
          link: '#',
          pubDate: new Date().toISOString(),
          categories: [activeCategory],
          content: `Contenu basé sur: ${prompt}`,
        });
      }

      const result = await generateWithMastra(contextualItems);
      setMastraResult(result);
      setGeneratedContent(result?.finalPost.content || 'Aucun contenu généré');
    } catch (error) {
      console.error('Erreur génération:', error);
      // Fallback content
      setGeneratedContent(
        `💡 ${prompt}\n\nErreur de connexion à Mastra. Vérifiez que le serveur backend est démarré (port 4112).`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (): Promise<void> => {
    if (!generatedContent) return;
    try {
      await navigator.clipboard.writeText(generatedContent);
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  };

  const canGenerate = prompt.trim().length > 0 && !isGenerating && !isMastraLoading;

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Header minimal */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-4xl mx-auto px-6 py-4'>
          <h1 className='text-2xl font-semibold text-gray-900 dark:text-white'>
            Génération de contenu
          </h1>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-6 py-8'>
        {/* Zone principale - Card unique centrée */}
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden'>
          {/* Status Bar - Simple et discret */}
          {!isMastraReady && (
            <div className='bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/50'>
              <div className='px-6 py-3 flex items-center gap-3'>
                <div className='w-2 h-2 bg-amber-500 rounded-full animate-pulse'></div>
                <span className='text-sm text-amber-800 dark:text-amber-200'>
                  {status?.ready ? 'Initialisation du client...' : 'Démarrage du serveur Mastra...'}
                </span>
              </div>
            </div>
          )}

          {mastraError && (
            <div className='bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800/50'>
              <div className='px-6 py-3 flex items-center gap-3'>
                <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                <span className='text-sm text-red-800 dark:text-red-200'>
                  {status?.hasApiKey
                    ? `Erreur: ${mastraError}`
                    : 'Configurez vos clés API dans le fichier .env'}
                </span>
              </div>
            </div>
          )}

          <div className='p-8'>
            {/* Categories - Design épuré */}
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

            {/* Input principal - Focus total */}
            <div className='mb-8'>
              <div className='relative'>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="De quoi voulez-vous parler aujourd'hui ?"
                  className='
                    w-full h-32 px-6 py-5 text-lg
                    bg-gray-50 dark:bg-gray-700/50 
                    border-2 border-transparent
                    rounded-2xl resize-none
                    text-gray-900 dark:text-white
                    placeholder-gray-500 dark:placeholder-gray-400
                    focus:outline-none focus:border-blue-500 dark:focus:border-blue-400
                    focus:bg-white dark:focus:bg-gray-700
                    transition-all duration-200
                  '
                  maxLength={500}
                />
                <div className='absolute bottom-4 right-4 text-xs text-gray-400'>
                  {prompt.length}/500
                </div>
              </div>
            </div>

            {/* CTA principal - Button hero */}
            <div className='flex justify-center mb-8'>
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
                {isGenerating || isMastraLoading ? (
                  <>
                    <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <span className='text-xl'>✨</span>
                    Générer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Résultat - Apparaît avec animation */}
        {generatedContent && (
          <div className='mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-500'>
            {/* Header du résultat */}
            <div className='border-b border-gray-200 dark:border-gray-700 px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span className='font-medium text-gray-900 dark:text-white'>Contenu généré</span>
                  {mastraResult && (
                    <span className='text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full'>
                      {mastraResult.finalPost.format}
                    </span>
                  )}
                </div>

                <div className='flex gap-2'>
                  <button
                    onClick={handleCopy}
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

                  <button
                    onClick={() => {
                      setGeneratedContent('');
                      setMastraResult(null);
                    }}
                    className='
                      px-4 py-2 bg-gray-100 dark:bg-gray-700 
                      hover:bg-gray-200 dark:hover:bg-gray-600
                      text-gray-700 dark:text-gray-300
                      rounded-xl text-sm font-medium
                      transition-colors duration-200
                    '
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Contenu généré */}
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
                {generatedContent}
              </div>

              {/* Hashtags si disponibles */}
              {mastraResult?.finalPost.hashtags && mastraResult.finalPost.hashtags.length > 0 && (
                <div className='mt-4 flex flex-wrap gap-2'>
                  {mastraResult.finalPost.hashtags.map((tag, index) => (
                    <span
                      key={index}
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

              {/* Alternatives - Progressive disclosure */}
              {mastraResult?.alternatives && mastraResult.alternatives.length > 0 && (
                <details className='mt-6'>
                  <summary className='cursor-pointer text-gray-600 dark:text-gray-400 text-sm font-medium hover:text-gray-900 dark:hover:text-gray-200'>
                    Voir {mastraResult.alternatives.length} alternative
                    {mastraResult.alternatives.length > 1 ? 's' : ''}
                  </summary>
                  <div className='mt-4 space-y-3'>
                    {mastraResult.alternatives.map((alt, index) => (
                      <div key={index} className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl'>
                        <div className='text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide'>
                          {alt.format}
                        </div>
                        <div className='text-gray-700 dark:text-gray-300 text-sm'>
                          {alt.content.substring(0, 200)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Empty state - Élégant */}
        {!generatedContent && !isGenerating && (
          <div className='mt-8 text-center py-16'>
            <div className='text-6xl mb-4'>🎭</div>
            <h3 className='text-xl font-medium text-gray-900 dark:text-white mb-2'>
              Créez du contenu qui engage
            </h3>
            <p className='text-gray-600 dark:text-gray-400 max-w-md mx-auto'>
              Partagez vos idées et notre IA vous aidera à créer du contenu authentique et
              impactant.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerator;
