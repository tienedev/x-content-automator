import React, { useState, useEffect } from 'react'
import { AppSettings, AIModel, PostCategory } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Save, RotateCcw } from 'lucide-react'
import { useToastContext } from '../../contexts/ToastContext'
import { useThemeContext } from '../../contexts/ThemeContext'

const Settings: React.FC = () => {
  const { success, error } = useToastContext()
  const { setTheme } = useThemeContext()
  const [settings, setSettings] = useState<AppSettings>({
    // Paramètres IA
    openaiApiKey: '',
    geminiApiKey: '',
    defaultModel: 'gpt-4' as AIModel,
    
    // Paramètres de contenu
    defaultCategory: 'tech' as PostCategory,
    includeHashtags: true,
    threadFormat: false,
    
    // Paramètres de collecte
    rssUpdateInterval: 60, // minutes
    maxPostsPerDay: 5,
    
    // Paramètres d'interface
    theme: 'light' as 'light' | 'dark' | 'auto',
    notifications: true,
    autoSave: true,
    language: 'fr' as 'fr' | 'en',
    autoCollectContent: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const savedSettings = await window.electronAPI.storage.getSettings()
      setSettings(savedSettings)
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleSettingChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]): void => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    
    // Appliquer immédiatement le changement de thème
    if (key === 'theme') {
      setTheme(value as 'light' | 'dark' | 'auto')
    }
  }

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    try {
      await window.electronAPI.storage.updateSettings(settings)
      success('Paramètres sauvegardés', 'Vos préférences ont été mises à jour avec succès')
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des paramètres:', err)
      error('Erreur de sauvegarde', 'Impossible de sauvegarder les paramètres')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = (): void => {
    setSettings({
      openaiApiKey: '',
      geminiApiKey: '',
      defaultModel: 'gpt-4' as AIModel,
      defaultCategory: 'tech' as PostCategory,
      includeHashtags: true,
      threadFormat: false,
      rssUpdateInterval: 60,
      maxPostsPerDay: 5,
      theme: 'light' as 'light' | 'dark' | 'auto',
      notifications: true,
      autoSave: true,
      language: 'fr' as 'fr' | 'en',
      autoCollectContent: false
    })
    success('Paramètres réinitialisés', 'Les valeurs par défaut ont été restaurées')
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-muted-foreground">Chargement des paramètres...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50/30 dark:bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-foreground">Paramètres</h1>
          <p className="text-gray-600 dark:text-muted-foreground mt-1">Configurez votre expérience et vos préférences</p>
        </div>

        <div className="space-y-6">
          {/* Intelligence Artificielle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 Intelligence Artificielle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Clé API OpenAI</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.openaiApiKey}
                    onChange={(e) => handleSettingChange('openaiApiKey', e.target.value)}
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">Votre clé API OpenAI pour la génération de contenu</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Clé API Gemini</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settings.geminiApiKey}
                    onChange={(e) => handleSettingChange('geminiApiKey', e.target.value)}
                    placeholder="AIza..."
                  />
                  <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">Votre clé API Google Gemini (alternative)</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Modèle par défaut</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={settings.defaultModel}
                  onChange={(e) => handleSettingChange('defaultModel', e.target.value as AIModel)}
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gemini-pro">Gemini Pro</option>
                </select>
              </div>
            </CardContent>
          </Card>


          {/* Sources RSS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📡 Sources RSS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Intervalle de mise à jour (minutes)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={settings.rssUpdateInterval}
                  onChange={(e) => handleSettingChange('rssUpdateInterval', parseInt(e.target.value))}
                  min="15"
                  max="1440"
                />
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">Fréquence de vérification des nouveaux articles</p>
              </div>
            </CardContent>
          </Card>

          {/* Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 Interface & Préférences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Thème</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value as 'light' | 'dark' | 'auto')}
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="auto">Automatique</option>
                </select>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium">Préférences</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700 dark:text-foreground">Activer les notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={settings.autoSave}
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700 dark:text-foreground">Sauvegarde automatique</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleReset} disabled={saving}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings