import { ipcMain, clipboard, shell, app } from 'electron'
import { AppSettings } from '../../types'
import { registerRSSHandlers } from './rssHandlers'
import { registerStorageHandlers } from './storageHandlers'

export function registerHandlers(): void {
  // Enregistrer les handlers RSS
  registerRSSHandlers()
  
  // Enregistrer les handlers de stockage
  registerStorageHandlers()

  // Clipboard
  ipcMain.handle('copy-to-clipboard', async (event, text: string): Promise<void> => {
    clipboard.writeText(text)
  })

  // Fichiers
  ipcMain.handle('open-file', async (): Promise<string | null> => {
    // TODO: Implémenter l'ouverture de fichier
    return null
  })

  ipcMain.handle('save-file', async (event, content: string): Promise<void> => {
    // TODO: Implémenter la sauvegarde de fichier
  })

  // App
  ipcMain.handle('get-version', async (): Promise<string> => {
    return app.getVersion()
  })

  ipcMain.handle('open-external', async (event, url: string): Promise<void> => {
    await shell.openExternal(url)
  })

  // Les paramètres sont maintenant gérés par storageHandlers

  // Génération de contenu (placeholder)
  ipcMain.handle('generate-content', async (event, type: string, prompt: string) => {
    // TODO: Implémenter avec Mastra AI
    return {
      content: `Contenu généré pour: ${prompt}`,
      hashtags: ['#AI', '#Tech'],
      metadata: {
        model: 'gpt-4',
        tokensUsed: 100,
        generationTime: 1000
      }
    }
  })
}