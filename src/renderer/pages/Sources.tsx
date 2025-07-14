import React, { useState, useEffect } from 'react'
import { Source, PostCategory, SourceType, FeedCategoryType, RSSFeedResult } from '../../types'
import { useRSS } from '../hooks/useRSS'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Plus, Settings, RefreshCw, Eye, Trash2, ExternalLink, Copy, Search } from 'lucide-react'
import { cn } from '../../lib/utils'
import { DEFAULT_RSS_CATEGORIES } from '../../config/rssFeeds'
import { FEED_CATEGORY_LABELS, FEED_TO_POST_CATEGORY } from '../../config/categories'
import { useToastContext } from '../../contexts/ToastContext'

const Sources: React.FC = () => {
  const { success, error } = useToastContext()
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [feedResults, setFeedResults] = useState<Map<string, RSSFeedResult>>(new Map())
  const [loadingFeeds, setLoadingFeeds] = useState(false)

  const [newSource, setNewSource] = useState<{
    name: string;
    url: string;
    type: SourceType;
    category: PostCategory;
    feedCategory: FeedCategoryType;
  }>({
    name: '',
    url: '',
    type: 'rss',
    category: 'tech',
    feedCategory: 'tech-news'
  })

  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [testingUrl, setTestingUrl] = useState<boolean>(false)
  const [togglingSource, setTogglingSource] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<string>('sources')
  const { fetchSourcesContent, testRSSUrl } = useRSS()

  useEffect(() => {
    loadSources()
  }, [])

  const loadSources = async () => {
    try {
      const data = await window.electronAPI.storage.getSources()
      setSources(data)
    } catch (error) {
      console.error('Erreur lors du chargement des sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSource = async (): Promise<void> => {
    if (!newSource.name.trim() || !newSource.url.trim()) return

    // Tester l'URL RSS avant d'ajouter
    if (newSource.type === 'rss') {
      setTestingUrl(true)
      const testResult = await testRSSUrl(newSource.url)
      setTestingUrl(false)
      
      if (!testResult.valid) {
        alert(`Erreur: ${testResult.error || 'URL RSS invalide'}`)
        return
      }
    }

    const source = await window.electronAPI.storage.addSource({
      ...newSource,
      active: true,
      lastUpdate: new Date().toISOString()
    })

    setSources([...sources, source])
    setNewSource({ name: '', url: '', type: 'rss', category: 'tech', feedCategory: 'tech-news' })
    setShowAddForm(false)
    success('Source ajoutée', `${source.name} a été ajoutée avec succès`)
  }

  const handleToggleSource = async (id: string): Promise<void> => {
    setTogglingSource(id)
    try {
      await window.electronAPI.storage.toggleSource(id)
      setSources(sources.map(source => 
        source.id === id ? { ...source, active: !source.active, lastUpdate: new Date().toISOString() } : source
      ))
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la source:', error)
    } finally {
      setTogglingSource(null)
    }
  }

  const handleViewSourceArticles = (sourceId: string) => {
    setSelectedFilter(sourceId)
    setActiveTab('articles')
  }

  const handleDeleteSource = async (id: string): Promise<void> => {
    try {
      const sourceToDelete = sources.find(s => s.id === id)
      await window.electronAPI.storage.deleteSource(id)
      setSources(sources.filter(source => source.id !== id))
      success('Source supprimée', `${sourceToDelete?.name || 'La source'} a été supprimée`)
    } catch (err) {
      console.error('Erreur lors de la suppression de la source:', err)
      error('Erreur', 'Impossible de supprimer la source')
    }
  }

  const handleRefreshSource = async (sourceId: string): Promise<void> => {
    const source = sources.find(s => s.id === sourceId)
    if (!source || source.type !== 'rss') return

    try {
      const results = await fetchSourcesContent([source])
      const result = results.get(sourceId)
      
      if (result && !result.error) {
        const updatedSource = {
          lastUpdate: new Date().toISOString(),
          totalPosts: result.items.length
        }
        
        await window.electronAPI.storage.updateSource(sourceId, updatedSource)
        setSources(sources.map(s => 
          s.id === sourceId 
            ? { ...s, ...updatedSource }
            : s
        ))
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error)
    }
  }

  const loadAllFeeds = async () => {
    const activeSources = sources.filter(s => s.active && s.type === 'rss')
    if (activeSources.length === 0) return

    setLoadingFeeds(true)
    try {
      const results = await fetchSourcesContent(activeSources)
      setFeedResults(results)
    } catch (error) {
      console.error('Erreur lors du chargement des flux RSS:', error)
    } finally {
      setLoadingFeeds(false)
    }
  }

  const getCategoryColor = (category: PostCategory): string => {
    switch (category) {
      case 'tech': return 'blue'
      case 'business': return 'green'
      case 'personal': return 'amber'
      default: return 'gray'
    }
  }

  const getCategoryIcon = (category: PostCategory): string => {
    switch (category) {
      case 'tech': return '💻'
      case 'business': return '💼'
      case 'personal': return '👤'
      default: return '📄'
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCopyContent = async (item: any) => {
    const content = `${item.title}\n\n${item.description}\n\nSource: ${item.link}`
    await window.electronAPI.copyToClipboard(content)
  }

  const getAllArticles = () => {
    const allArticles: any[] = []
    feedResults.forEach((feed, sourceId) => {
      if (!feed.error) {
        const source = sources.find(s => s.id === sourceId)
        feed.items.forEach(item => {
          allArticles.push({
            ...item,
            sourceId,
            sourceName: source?.name || 'Unknown',
            sourceCategory: source?.category || 'tech'
          })
        })
      }
    })
    const sorted = allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    
    if (selectedFilter === 'all') {
      return sorted
    }
    
    return sorted.filter(article => article.sourceId === selectedFilter)
  }

  useEffect(() => {
    if (sources.length > 0) {
      loadAllFeeds()
    }
  }, [sources])

  const getFilteredFeeds = () => {
    if (!searchQuery.trim()) return DEFAULT_RSS_CATEGORIES
    
    const query = searchQuery.toLowerCase()
    return DEFAULT_RSS_CATEGORIES.map(category => ({
      ...category,
      feeds: category.feeds.filter(feed => 
        feed.name.toLowerCase().includes(query) || 
        feed.url.toLowerCase().includes(query) ||
        category.name.toLowerCase().includes(query)
      )
    })).filter(category => category.feeds.length > 0)
  }

  const addPredefinedSource = async (feedData: any) => {
    try {
      const source = await window.electronAPI.storage.addSource({
        ...feedData,
        active: true,
        lastUpdate: new Date().toISOString()
      })
      setSources([...sources, source])
      success('Source ajoutée', `${feedData.name} a été ajoutée depuis la bibliothèque`)
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la source:', err)
      error('Erreur', 'Impossible d\'ajouter la source')
    }
  }

  return (
    <div className="h-screen bg-gray-50/30 dark:bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-foreground">Sources</h1>
            <p className="text-gray-600 dark:text-muted-foreground mt-1">Gérez vos flux RSS et sources de contenu</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAllFeeds()}
              disabled={loadingFeeds}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loadingFeeds && "animate-spin")} />
              Actualiser
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une source
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sources">Sources ({sources.length})</TabsTrigger>
            <TabsTrigger value="articles">Tous les articles</TabsTrigger>
            <TabsTrigger value="manage">Gestion</TabsTrigger>
          </TabsList>

          {/* Sources Tab */}
          <TabsContent value="sources" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400 dark:text-muted-foreground" />
                  <p className="text-gray-600 dark:text-muted-foreground">Chargement des sources...</p>
                </div>
              </div>
            ) : sources.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-6xl mb-4">📡</div>
                  <h3 className="text-lg font-semibold mb-2">Aucune source configurée</h3>
                  <p className="text-gray-600 dark:text-muted-foreground text-center max-w-md">
                    Commencez par ajouter quelques sources RSS pour collecter automatiquement du contenu
                  </p>
                  <Button onClick={() => setShowAddForm(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter votre première source
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources.map(source => {
                  const feed = feedResults.get(source.id)
                  return (
                    <Card 
                      key={source.id} 
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md",
                        !source.active && "opacity-60"
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{getCategoryIcon(source.category)}</span>
                            <div>
                              <CardTitle className="text-base truncate max-w-[200px] text-gray-900 dark:text-foreground">{source.name}</CardTitle>
                              <p className="text-xs text-gray-500 dark:text-muted-foreground truncate max-w-[200px]">
                                {source.url}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              source.active ? "bg-green-500" : "bg-gray-300"
                            )} />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-muted-foreground mb-3">
                          <span>
                            {formatDate(source.lastUpdate)}
                          </span>
                          <span>
                            {feed && !feed.error ? `${feed.items.length} articles` : 
                             feed?.error ? '❌ Erreur' : '⏳ Chargement...'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {source.category}
                          </Badge>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewSourceArticles(source.id)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteSource(source.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* All Articles Tab */}
          <TabsContent value="articles" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tous les articles</CardTitle>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-3 py-1 border rounded-md text-sm"
                    >
                      <option value="all">Toutes les sources</option>
                      {sources.filter(s => s.active).map(source => (
                        <option key={source.id} value={source.id}>
                          {source.name}
                        </option>
                      ))}
                    </select>
                    {selectedFilter !== 'all' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFilter('all')}
                      >
                        Réinitialiser
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingFeeds ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Chargement des articles...</span>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {getAllArticles().length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>Aucun article disponible{selectedFilter !== 'all' ? ' pour cette source' : ''}</p>
                      </div>
                    ) : (
                      <>
                        {selectedFilter !== 'all' && (
                          <div className="mb-4">
                            <Badge variant="secondary" className="text-xs">
                              {sources.find(s => s.id === selectedFilter)?.name} - {getAllArticles().length} articles
                            </Badge>
                          </div>
                        )}
                        {getAllArticles().map((article, index) => (
                          <div key={index} className="border-b pb-3 last:border-b-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{article.title}</h4>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{article.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>{formatDate(article.pubDate)}</span>
                                  <span>{article.sourceName}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {article.sourceCategory}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.electronAPI.openExternal(article.link)}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyContent(article)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-4">
            {/* Manual Source Addition */}
            <Card>
              <CardHeader>
                <CardTitle>Ajouter une nouvelle source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nom</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      value={newSource.name}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                      placeholder="Nom de la source"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">URL</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      value={newSource.url}
                      onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                      placeholder="https://example.com/feed"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Catégorie</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={newSource.feedCategory}
                      onChange={(e) => {
                        const feedCategory = e.target.value as FeedCategoryType
                        const postCategory = FEED_TO_POST_CATEGORY[feedCategory]
                        setNewSource({ 
                          ...newSource, 
                          feedCategory,
                          category: postCategory
                        })
                      }}
                    >
                      {Object.entries(FEED_CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Type</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={newSource.type}
                      onChange={(e) => setNewSource({ ...newSource, type: e.target.value as SourceType })}
                    >
                      <option value="rss">RSS Feed</option>
                      <option value="website">Site Web</option>
                      <option value="api">API</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddSource}
                    disabled={!newSource.name.trim() || !newSource.url.trim() || testingUrl}
                  >
                    {testingUrl ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    {testingUrl ? 'Test en cours...' : 'Ajouter'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setNewSource({ name: '', url: '', type: 'rss', category: 'tech', feedCategory: 'tech-news' })}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Predefined Sources Library */}
            <Card>
              <CardHeader>
                <CardTitle className="mb-4">Bibliothèque de sources RSS</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                    placeholder="Rechercher dans la bibliothèque (nom, URL, catégorie)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {getFilteredFeeds().map((category) => (
                    <div key={category.id}>
                      <h3 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {category.name}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {category.feeds.length} source{category.feeds.length > 1 ? 's' : ''}
                        </span>
                      </h3>
                      <div className="space-y-2">
                        {category.feeds.map((feed, index) => {
                          const isAlreadyAdded = sources.some(s => s.url === feed.url)
                          return (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{feed.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {feed.category}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {feed.url}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.electronAPI.openExternal(feed.url)}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={isAlreadyAdded}
                                  onClick={() => addPredefinedSource(feed)}
                                >
                                  {isAlreadyAdded ? (
                                    'Ajouté'
                                  ) : (
                                    <>
                                      <Plus className="h-3 w-3 mr-2" />
                                      Ajouter
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {getFilteredFeeds().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Aucune source trouvée pour "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Sources