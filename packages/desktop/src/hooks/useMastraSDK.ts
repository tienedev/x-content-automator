import { useState, useEffect, useCallback } from 'react';
import { MastraClient } from '@mastra/client-js';
import type { MastraContentResult, RSSItem } from '@x-community/shared';

interface MastraClientStatus {
  ready: boolean;
  serverUrl: string;
  hasApiKey: boolean;
}

export function useMastraSDK() {
  const [client, setClient] = useState<MastraClient | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<MastraClientStatus | null>(null);

  // Initialiser le client Mastra
  const initializeClient = useCallback(async () => {
    try {
      console.log('🔍 [useMastraSDK] Initializing Mastra client...');

      // Le serveur Mastra tourne sur le port 4112 (depuis packages/api)
      const serverUrl = 'http://localhost:4112';

      // Tester la connexion d'abord
      const healthResponse = await fetch(`${serverUrl}/health`);
      if (!healthResponse.ok) {
        throw new Error('Mastra server not responding');
      }

      // Créer le client Mastra
      const mastraClient = new MastraClient({
        baseUrl: serverUrl,
        headers: {
          'Content-Type': 'application/json',
        },
        retries: 3,
        backoffMs: 300,
      });

      setClient(mastraClient);
      setIsReady(true);
      setError(null);
      setStatus({
        ready: true,
        serverUrl,
        hasApiKey: true, // Assumé côté serveur
      });

      console.log('✅ [useMastraSDK] Client initialized');
    } catch (err) {
      console.error('💥 [useMastraSDK] Initialization error:', err);
      setError(err instanceof Error ? err.message : "Erreur d'initialisation");
      setIsReady(false);
      setStatus({
        ready: false,
        serverUrl: 'http://localhost:4112',
        hasApiKey: false,
      });
    }
  }, []);

  // Générer du contenu avec le workflow
  const generateContent = useCallback(
    async (newsItems: RSSItem[]): Promise<MastraContentResult | null> => {
      if (!client || !isReady) {
        throw new Error("Client Mastra non prêt. Attendez l'initialisation.");
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('🎯 [useMastraSDK] Generating content with', newsItems.length, 'items');

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

        // Utiliser le workflow simple
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

        console.log('✅ [useMastraSDK] Content generated:', response);

        // Extraire le résultat du workflow
        if (response.status === 'success') {
          return response.result as MastraContentResult;
        } else {
          throw new Error(`Workflow failed with status: ${response.status}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur de génération';
        console.error('❌ [useMastraSDK] Generation error:', err);
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
        console.log(`🤖 [useMastraSDK] Using agent ${agentName}`);

        const agent = client.getAgent(agentName);
        const response = await agent.generate({
          messages: [{ role: 'user', content: prompt }],
        });

        return response.text || null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur d'agent";
        console.error(`❌ [useMastraSDK] Agent ${agentName} error:`, err);
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
    initializeClient();

    // Vérifier périodiquement si le client n'est pas prêt
    const interval = setInterval(() => {
      if (!isReady) {
        initializeClient();
      }
    }, 10000); // Toutes les 10 secondes

    return () => clearInterval(interval);
  }, [initializeClient, isReady]);

  return {
    client,
    isReady,
    isLoading,
    error,
    status,
    generateContent,
    useAgent,
    initializeClient,
  };
}
