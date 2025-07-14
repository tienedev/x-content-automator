import { ipcMain } from 'electron'
import { StorageService } from '../../services/storage/storageService'
import { Source, AppSettings } from '../../types'
import { FeedCategory } from '../../config/rssFeeds'

const storage = StorageService.getInstance()

export function registerStorageHandlers(): void {
  // Sources
  ipcMain.handle('storage:get-sources', async (): Promise<Source[]> => {
    return storage.getSources()
  })

  ipcMain.handle('storage:add-source', async (event, source: Omit<Source, 'id'>): Promise<Source> => {
    return storage.addSource(source)
  })

  ipcMain.handle('storage:update-source', async (event, id: string, updates: Partial<Source>): Promise<void> => {
    storage.updateSource(id, updates)
  })

  ipcMain.handle('storage:delete-source', async (event, id: string): Promise<void> => {
    storage.deleteSource(id)
  })

  ipcMain.handle('storage:toggle-source', async (event, id: string): Promise<void> => {
    storage.toggleSourceActive(id)
  })

  // Catégories
  ipcMain.handle('storage:get-categories', async (): Promise<FeedCategory[]> => {
    return storage.getCategories()
  })

  ipcMain.handle('storage:add-sources-from-category', async (event, categoryId: string, selectedUrls?: string[]): Promise<void> => {
    storage.addSourcesFromCategory(categoryId, selectedUrls)
  })

  // Paramètres
  ipcMain.handle('storage:get-settings', async (): Promise<AppSettings> => {
    return storage.getSettings()
  })

  ipcMain.handle('storage:update-settings', async (event, settings: Partial<AppSettings>): Promise<void> => {
    storage.updateSettings(settings)
  })

  // Import/Export
  ipcMain.handle('storage:export-sources', async (): Promise<Source[]> => {
    return storage.exportSources()
  })

  ipcMain.handle('storage:import-sources', async (event, sources: Source[]): Promise<void> => {
    storage.importSources(sources)
  })

  // Stats
  ipcMain.handle('storage:get-stats', async () => {
    return storage.getSourceStats()
  })

  // Feed Items
  ipcMain.handle('storage:get-feed-items', async () => {
    return storage.getFeedItems()
  })

  ipcMain.handle('storage:add-feed-items', async (event, items) => {
    storage.addFeedItems(items)
  })

  ipcMain.handle('storage:mark-feed-item-read', async (event, itemId: string) => {
    storage.markFeedItemAsRead(itemId)
  })

  ipcMain.handle('storage:clear-old-feed-items', async (event, daysOld?: number) => {
    storage.clearOldFeedItems(daysOld)
  })

  ipcMain.handle('storage:get-feed-items-stats', async () => {
    return storage.getFeedItemsStats()
  })

  // Utilitaires
  ipcMain.handle('storage:reset-defaults', async (): Promise<void> => {
    storage.resetToDefaults()
  })
}