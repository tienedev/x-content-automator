import { useState, useEffect, useCallback } from 'react';
import { MastraClient } from '@mastra/client-js';
import { MastraContentResult, RSSItem } from '@/types';

interface MastraClientStatus {
  ready: boolean;
  serverUrl: string;
  hasApiKey: boolean;
}

export function useMastraClient() {
  const [client, setClient] = useState<MastraClient | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<MastraClientStatus | null>(null);

  // Initialiser le client Mastra
  const initializeClient = useCallback(async () => {
    try {
      console.log('🔍 [useMastraClient] Checking server status...');

      // Vérifier le statut du serveur
      const statusResponse = await window.electronAPI.mastra.serverStatus();

      if (statusResponse.success && statusResponse.data) {
        setStatus(statusResponse.data);

        if (statusResponse.data.ready && statusResponse.data.hasApiKey) {
          // Créer le client Mastra
          const mastraClient = new MastraClient({
            baseUrl: statusResponse.data.serverUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            retries: 3,
            backoffMs: 300,
          });

          setClient(mastraClient);
          setIsReady(true);
          setError(null);
          console.log('✅ [useMastraClient] Client initialized');
        } else {
          setError('Serveur Mastra non prêt ou clés API manquantes');
          setIsReady(false);
        }
      } else {
        setError(statusResponse.error || 'Impossible de vérifier le statut du serveur');
        setIsReady(false);
      }
    } catch (err) {
      console.error('💥 [useMastraClient] Initialization error:', err);
      setError(err instanceof Error ? err.message : "Erreur d'initialisation");
      setIsReady(false);
    }
  }, []);

  // Démarrer le serveur et initialiser le client
  const startServer = useCallback(async () => {
    try {
      console.log('🚀 [useMastraClient] Starting server...');
      const response = await window.electronAPI.mastra.startServer();

      if (response.success) {
        // Attendre un peu que le serveur soit prêt
        setTimeout(() => {
          initializeClient();
        }, 2000);
      } else {
        setError(response.error || 'Impossible de démarrer le serveur');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de démarrage du serveur');
    }
  }, [initializeClient]);

  // Générer du contenu avec le workflow
  const generateContent = useCallback(
    async (newsItems: RSSItem[]): Promise<MastraContentResult | null> => {
      if (!client || !isReady) {
        throw new Error("Client Mastra non prêt. Attendez l'initialisation.");
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('🎯 [useMastraClient] Generating content with', newsItems.length, 'items');

        // Transformer les RSSItems au format attendu par le workflow
        const formattedItems = newsItems.map(item => ({
          title: item.title,
          description: item.contentSnippet || item.content || item.description,
          link: item.link,
          pubDate: item.pubDate || new Date().toISOString(),
          category: (item.categories?.includes('business') ? 'business' : 'tech') as
            | 'tech'
            | 'business',
        }));

        // Utiliser le workflow simplifié
        const workflow = client.getWorkflow('simple-content-generation');

        // Créer une exécution du workflow
        const run = await workflow.createRun();

        // Démarrer le workflow avec les données
        const response = await workflow.startAsync({
          runId: run.runId,
          inputData: {
            newsItems: formattedItems,
          },
        });

        console.log('✅ [useMastraClient] Content generated:', response);

        // Extraire le résultat du workflow
        if (response.status === 'success') {
          return response.result as MastraContentResult;
        } else {
          throw new Error(`Workflow failed with status: ${response.status}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de génération';
        console.error('❌ [useMastraClient] Generation error:', err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [client, isReady]
  );

  // Utiliser un agent directement
  const useAgent = useCallback(
    async (agentName: string, prompt: string): Promise<string | null> => {
      if (!client || !isReady) {
        throw new Error("Client Mastra non prêt. Attendez l'initialisation.");
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(`🤖 [useMastraClient] Using agent ${agentName}`);

        const agent = client.getAgent(agentName);
        const response = await agent.generate({
          messages: [{ role: 'user', content: prompt }],
        });

        return response.text || null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur d'agent";
        console.error(`❌ [useMastraClient] Agent ${agentName} error:`, err);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [client, isReady]
  );

  // Initialiser au montage
  useEffect(() => {
    startServer();

    // Vérifier périodiquement si le client n'est pas prêt
    const interval = setInterval(() => {
      if (!isReady) {
        initializeClient();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [startServer, initializeClient, isReady]);

  return {
    client,
    isReady,
    isLoading,
    error,
    status,
    generateContent,
    useAgent,
    startServer,
    initializeClient,
  };
}
