import { useEffect, useRef, useState } from 'react'
import { Source, StoredFeedItem, AppSettings } from '../../types'
import { useRSS } from './useRSS'

export interface AutoFeedUpdateStatus {
  isRunning: boolean
  lastUpdate: Date | null
  nextUpdate: Date | null
  errors: string[]
  successCount: number
  totalSources: number
}

export const useAutoFeedUpdate = () => {
  const [status, setStatus] = useState<AutoFeedUpdateStatus>({
    isRunning: false,
    lastUpdate: null,
    nextUpdate: null,
    errors: [],
    successCount: 0,
    totalSources: 0
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { fetchSourcesContent } = useRSS()

  const updateFeeds = async () => {
    setStatus(prev => ({ ...prev, isRunning: true, errors: [] }))

    try {
      // Récupérer les sources actives
      const sources = await window.electronAPI.storage.getSources()
      const activeSources = sources.filter(source => source.active)

      if (activeSources.length === 0) {
        setStatus(prev => ({
          ...prev,
          isRunning: false,
          totalSources: 0,
          successCount: 0
        }))
        return
      }

      // Fetch le contenu de tous les feeds
      const results = await fetchSourcesContent(activeSources)
      let successCount = 0
      const errors: string[] = []

      // Traiter les résultats et sauvegarder les items
      const allFeedItems: StoredFeedItem[] = []

      for (const [sourceId, result] of results.entries()) {
        const source = activeSources.find(s => s.id === sourceId)
        if (!source) continue

        if (result.error) {
          errors.push(`${source.name}: ${result.error}`)
          continue
        }

        successCount++

        // Convertir les items RSS en StoredFeedItem
        const feedItems: StoredFeedItem[] = result.items.map(item => ({
          id: `${sourceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sourceId,
          sourceName: source.name,
          feedCategory: source.feedCategory,
          fetchedAt: new Date().toISOString(),
          isRead: false,
          ...item
        }))

        allFeedItems.push(...feedItems)

        // Mettre à jour les stats de la source
        await window.electronAPI.storage.updateSource(sourceId, {
          lastUpdate: new Date().toISOString(),
          totalPosts: result.items.length,
          errorCount: 0
        })
      }

      // Sauvegarder tous les nouveaux items
      if (allFeedItems.length > 0) {
        await window.electronAPI.storage.addFeedItems(allFeedItems)
      }

      const now = new Date()
      setStatus(prev => ({
        ...prev,
        isRunning: false,
        lastUpdate: now,
        errors,
        successCount,
        totalSources: activeSources.length
      }))

    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isRunning: false,
        errors: [`Erreur générale: ${error instanceof Error ? error.message : 'Erreur inconnue'}`]
      }))
    }
  }

  const startAutoUpdate = async () => {
    // Récupérer les paramètres d'intervalle
    const settings = await window.electronAPI.storage.getSettings()
    const intervalMinutes = settings.rssUpdateInterval || 60

    // Calculer la prochaine mise à jour
    const nextUpdate = new Date()
    nextUpdate.setMinutes(nextUpdate.getMinutes() + intervalMinutes)

    setStatus(prev => ({ ...prev, nextUpdate }))

    // Nettoyer l'intervalle existant
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Démarrer le nouvel intervalle
    intervalRef.current = setInterval(async () => {
      await updateFeeds()
      
      // Recalculer la prochaine mise à jour
      const settings = await window.electronAPI.storage.getSettings()
      const intervalMinutes = settings.rssUpdateInterval || 60
      const nextUpdate = new Date()
      nextUpdate.setMinutes(nextUpdate.getMinutes() + intervalMinutes)
      
      setStatus(prev => ({ ...prev, nextUpdate }))
    }, intervalMinutes * 60 * 1000)

    // Faire une première mise à jour immédiatement
    await updateFeeds()
  }

  const stopAutoUpdate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setStatus(prev => ({ ...prev, nextUpdate: null }))
  }

  // Démarrer automatiquement si autoCollectContent est activé
  useEffect(() => {
    const initAutoUpdate = async () => {
      const settings = await window.electronAPI.storage.getSettings()
      if (settings.autoCollectContent) {
        await startAutoUpdate()
      }
    }

    initAutoUpdate()

    // Cleanup au démontage
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    status,
    updateFeeds,
    startAutoUpdate,
    stopAutoUpdate
  }
}