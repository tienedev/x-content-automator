import { ipcMain } from 'electron'
import { RSSService } from '../../services/rss/rssService'
import { RSSFeedResult } from '../../types'

const rssService = RSSService.getInstance()

export function registerRSSHandlers(): void {
  // Récupérer un ou plusieurs flux RSS
  ipcMain.handle('fetch-rss-feeds', async (event, urls: string[]): Promise<RSSFeedResult[]> => {
    try {
      console.log('Fetching RSS feeds:', urls)
      return await rssService.fetchMultipleFeeds(urls)
    } catch (error) {
      console.error('Error fetching RSS feeds:', error)
      throw error
    }
  })

  // Récupérer un seul flux RSS
  ipcMain.handle('fetch-rss-feed', async (event, url: string): Promise<RSSFeedResult> => {
    try {
      console.log('Fetching RSS feed:', url)
      return await rssService.fetchFeed(url)
    } catch (error) {
      console.error('Error fetching RSS feed:', error)
      throw error
    }
  })

  // Tester une URL RSS
  ipcMain.handle('test-rss-url', async (event, url: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      const result = await rssService.fetchFeed(url)
      return {
        valid: !result.error && result.items.length > 0,
        error: result.error
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }
  })
}