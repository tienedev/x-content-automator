import React, { useState } from 'react'
import { PostCategory } from '../../types'

interface Category {
  id: PostCategory;
  label: string;
  icon: string;
  color: string;
}

const ContentGenerator: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<PostCategory>('tech')
  const [prompt, setPrompt] = useState<string>('')
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  const categories: Category[] = [
    { id: 'tech', label: 'Tech', icon: '💻', color: '#3b82f6' },
    { id: 'business', label: 'Business', icon: '💼', color: '#10b981' },
    { id: 'personal', label: 'Personnel', icon: '👤', color: '#f59e0b' }
  ]

  const handleGenerate = async (): Promise<void> => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    
    try {
      // Simuler la génération de contenu
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Contenu simulé basé sur la catégorie
      const sampleContent: Record<PostCategory, string> = {
        tech: `🚀 Les dernières avancées en IA transforment notre façon de coder !

${prompt}

Thread 1/3 🧵

#AI #Tech #Innovation #Dev`,
        business: `💡 Stratégie business du jour :

${prompt}

Les 3 points clés :
• Point 1
• Point 2  
• Point 3

#Business #Strategy #Entrepreneur`,
        personal: `🌟 Réflexion du jour :

${prompt}

Parfois, les meilleures idées viennent quand on s'y attend le moins.

#PersonalGrowth #Mindset #Inspiration`
      }
      
      setGeneratedContent(sampleContent[activeCategory])
    } catch (error) {
      console.error('Erreur lors de la génération:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async (): Promise<void> => {
    if (!generatedContent) return
    
    try {
      await navigator.clipboard.writeText(generatedContent)
      // TODO: Afficher une notification de succès
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5 text-gray-900 dark:text-foreground">
        Génération de Contenu
      </h1>

      <div className="grid grid-cols-2" style={{ gap: '20px' }}>
        {/* Panneau de génération */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title text-gray-900 dark:text-foreground">Nouveau contenu</h2>
          </div>

          {/* Sélection de catégorie */}
          <div className="form-group">
            <label className="form-label text-gray-700 dark:text-foreground">Catégorie</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    border: activeCategory === category.id ? `2px solid ${category.color}` : '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: activeCategory === category.id ? `${category.color}15` : 'white',
                    color: activeCategory === category.id ? category.color : '#374151',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <span>{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zone de prompt */}
          <div className="form-group">
            <label className="form-label text-gray-700 dark:text-foreground">Sujet ou idée</label>
            <textarea
              className="textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez le sujet dont vous voulez parler..."
              className="textarea bg-background dark:bg-input text-foreground border-gray-300 dark:border-border"
              style={{ height: '120px' }}
            />
          </div>

          {/* Options de génération */}
          <div className="form-group">
            <label className="form-label text-gray-700 dark:text-foreground">Options</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" defaultChecked />
                <span className="text-sm text-gray-700 dark:text-foreground">Inclure des hashtags</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" />
                <span className="text-sm text-gray-700 dark:text-foreground">Format thread Twitter</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" />
                <span className="text-sm text-gray-700 dark:text-foreground">Ajouter un call-to-action</span>
              </label>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            style={{ width: '100%' }}
          >
            {isGenerating ? (
              <>
                <span className="loading"></span>
                Génération en cours...
              </>
            ) : (
              <>
                <span>✨</span>
                Générer le contenu
              </>
            )}
          </button>
        </div>

        {/* Panneau de prévisualisation */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title text-gray-900 dark:text-foreground">Prévisualisation</h2>
          </div>

          {generatedContent ? (
            <div>
              <div className="p-4 bg-gray-50 dark:bg-muted rounded-lg border border-gray-200 dark:border-border mb-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-900 dark:text-foreground">
                {generatedContent}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleCopy}
                  style={{ flex: 1 }}
                >
                  <span>📋</span>
                  Copier
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setGeneratedContent('')}
                >
                  <span>🗑️</span>
                  Effacer
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  💡 Conseil
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                  Vérifiez le contenu avant de le publier sur X. Vous pouvez le modifier si nécessaire.
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-10 text-gray-500 dark:text-muted-foreground">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
              <p className="text-gray-500 dark:text-muted-foreground">Votre contenu généré apparaîtra ici</p>
              <p className="text-sm text-gray-500 dark:text-muted-foreground">Saisissez un sujet et cliquez sur "Générer"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContentGenerator