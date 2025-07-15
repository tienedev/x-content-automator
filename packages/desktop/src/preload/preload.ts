import { contextBridge, ipcRenderer } from 'electron';
import { ElectronAPI } from '@/types';

const electronAPI: ElectronAPI = {
  // Content operations
  generateContent: request => ipcRenderer.invoke('generate-content', request),

  // Mastra operations
  mastra: {
    startServer: () => ipcRenderer.invoke('mastra:start-server'),
    serverStatus: () => ipcRenderer.invoke('mastra:server-status'),
    stopServer: () => ipcRenderer.invoke('mastra:stop-server'),
  },

  // RSS operations
  fetchRSSFeeds: urls => ipcRenderer.invoke('fetch-rss-feeds', urls),

  // Clipboard operations
  copyToClipboard: text => ipcRenderer.invoke('copy-to-clipboard', text),

  // File operations
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: content => ipcRenderer.invoke('save-file', content),

  // App operations
  getVersion: () => ipcRenderer.invoke('get-version'),
  openExternal: url => ipcRenderer.invoke('open-external', url),

  // Storage operations
  storage: {
    // Sources
    getSources: () => ipcRenderer.invoke('storage:get-sources'),
    addSource: source => ipcRenderer.invoke('storage:add-source', source),
    updateSource: (id, updates) => ipcRenderer.invoke('storage:update-source', id, updates),
    deleteSource: id => ipcRenderer.invoke('storage:delete-source', id),
    toggleSource: id => ipcRenderer.invoke('storage:toggle-source', id),

    // Categories
    getCategories: () => ipcRenderer.invoke('storage:get-categories'),
    addSourcesFromCategory: (categoryId, selectedUrls?) =>
      ipcRenderer.invoke('storage:add-sources-from-category', categoryId, selectedUrls),

    // Settings
    getSettings: () => ipcRenderer.invoke('storage:get-settings'),
    updateSettings: settings => ipcRenderer.invoke('storage:update-settings', settings),

    // Import/Export
    exportSources: () => ipcRenderer.invoke('storage:export-sources'),
    importSources: sources => ipcRenderer.invoke('storage:import-sources', sources),

    // Stats
    getStats: () => ipcRenderer.invoke('storage:get-stats'),

    // Feed Items
    getFeedItems: () => ipcRenderer.invoke('storage:get-feed-items'),
    addFeedItems: items => ipcRenderer.invoke('storage:add-feed-items', items),
    markFeedItemAsRead: itemId => ipcRenderer.invoke('storage:mark-feed-item-read', itemId),
    clearOldFeedItems: (daysOld?) => ipcRenderer.invoke('storage:clear-old-feed-items', daysOld),
    getFeedItemsStats: () => ipcRenderer.invoke('storage:get-feed-items-stats'),

    // Utilities
    resetDefaults: () => ipcRenderer.invoke('storage:reset-defaults'),
  },

  // Event listeners
  onMenuAction: (callback: (action: string) => void) =>
    ipcRenderer.on('menu-action', (event, action) => callback(action)),
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
