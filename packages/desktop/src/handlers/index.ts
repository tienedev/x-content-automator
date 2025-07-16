import { ipcMain, clipboard, shell, app } from 'electron';
import { registerRSSHandlers } from './rssHandlers';
import { registerStorageHandlers } from './storageHandlers';
import { registerScrapingHandlers } from './scrapingHandlers';

export function registerHandlers(): void {
  // Enregistrer les handlers RSS
  registerRSSHandlers();

  // Enregistrer les handlers de stockage
  registerStorageHandlers();
  
  // Enregistrer les handlers de scraping
  registerScrapingHandlers();

  // Clipboard
  ipcMain.handle('copy-to-clipboard', async (event, text: string): Promise<void> => {
    clipboard.writeText(text);
  });

  // Fichiers
  ipcMain.handle('open-file', async (): Promise<string | null> => {
    // TODO: Implémenter l'ouverture de fichier
    return null;
  });

  ipcMain.handle('save-file', async (_event, _content: string): Promise<void> => {
    // TODO: Implémenter la sauvegarde de fichier
  });

  // App
  ipcMain.handle('get-version', async (): Promise<string> => {
    return app.getVersion();
  });

  ipcMain.handle('open-external', async (event, url: string): Promise<void> => {
    await shell.openExternal(url);
  });

  // Les paramètres sont maintenant gérés par storageHandlers
  // Génération de contenu maintenant gérée par l'API backend
}
