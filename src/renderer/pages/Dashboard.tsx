import React, { useState, useEffect } from 'react'
import { Post, DashboardStats, PostCategory, PostStatus, Source } from '../../types'
import RSSContentViewer from '../components/RSSContentViewer'

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    todayPosts: 0,
    pendingPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    sources: 0,
    activeSources: 0
  })

  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [sources, setSources] = useState<Source[]>([])

  const loadSources = async () => {
    try {
      const data = await window.electronAPI.storage.getSources()
      setSources(data)
    } catch (error) {
      console.error('Erreur lors du chargement des sources:', error)
    }
  }

  useEffect(() => {
    // Simuler des données pour le moment
    setStats({
      totalPosts: 42,
      todayPosts: 3,
      pendingPosts: 8,
      scheduledPosts: 5,
      publishedPosts: 34,
      sources: 12,
      activeSources: 10
    })

    setRecentPosts([
      {
        id: '1',
        content: "Les dernières tendances en IA révolutionnent la façon dont nous développons...",
        category: "tech",
        createdAt: "2024-01-15T10:30:00Z",
        status: "published"
      },
      {
        id: '2',
        content: "Comment optimiser sa productivité en télétravail : 5 conseils pratiques...",
        category: "business",
        createdAt: "2024-01-15T09:15:00Z",
        status: "pending"
      },
      {
        id: '3',
        content: "Ma routine matinale pour bien commencer la journée...",
        category: "personal",
        createdAt: "2024-01-15T08:00:00Z",
        status: "draft"
      }
    ])

    // Charger les sources pour le viewer RSS
    loadSources()
  }, [])

  const getCategoryIcon = (category: PostCategory): string => {
    switch (category) {
      case 'tech': return '💻'
      case 'business': return '💼'
      case 'personal': return '👤'
      default: return '📄'
    }
  }

  const getStatusColor = (status: PostStatus): string => {
    switch (status) {
      case 'published': return '#10b981'
      case 'pending': return '#f59e0b'
      case 'draft': return '#6b7280'
      default: return '#6b7280'
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5 text-gray-900 dark:text-foreground">
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2" style={{ marginBottom: '30px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>📊</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalPosts}</div>
              <div className="text-sm text-gray-500 dark:text-muted-foreground">Posts totaux</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>📅</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.todayPosts}</div>
              <div className="text-sm text-gray-500 dark:text-muted-foreground">Posts aujourd'hui</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>⏳</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.pendingPosts}</div>
              <div className="text-sm text-gray-500 dark:text-muted-foreground">Posts en attente</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>📡</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.sources}</div>
              <div className="text-sm text-gray-500 dark:text-muted-foreground">Sources actives</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title text-gray-900 dark:text-foreground">Posts récents</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {recentPosts.map(post => (
            <div key={post.id} className="p-4 border border-gray-200 dark:border-border rounded-lg bg-gray-50 dark:bg-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span>{getCategoryIcon(post.category)}</span>
                <span className="text-xs text-gray-500 dark:text-muted-foreground capitalize">
                  {post.category}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: getStatusColor(post.status),
                  fontWeight: '500'
                }}>
                  • {post.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 dark:text-foreground mb-2">
                {post.content}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-xs text-gray-500 dark:text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 8px' }}>
                    Modifier
                  </button>
                  <button className="btn btn-primary" style={{ fontSize: '12px', padding: '4px 8px' }}>
                    Copier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recentPosts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280'
          }} className="text-gray-500 dark:text-muted-foreground">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <p className="text-gray-500 dark:text-muted-foreground">Aucun post récent</p>
            <p className="text-sm text-gray-500 dark:text-muted-foreground">Commencez par générer du contenu !</p>
          </div>
        )}
      </div>

      {/* Flux RSS */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h2 className="card-title text-gray-900 dark:text-foreground">Flux RSS actifs</h2>
        </div>
        <div style={{ height: '400px' }}>
          <RSSContentViewer sources={sources} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard