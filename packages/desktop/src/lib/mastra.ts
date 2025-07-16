import { MastraClient } from '@mastra/client-js';

// Le client Mastra avec configuration
export function getMastraClient(): MastraClient {
  return new MastraClient({
    baseUrl: 'http://localhost:4112', // Port du serveur Mastra API
    retries: 3,
    backoffMs: 300,
    maxBackoffMs: 5000,
  });
}
