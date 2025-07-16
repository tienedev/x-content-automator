import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';

// Import agents
import { newsAnalyzer, contentCreator } from './agents';

// Import workflows
import { contentGenerationWorkflow } from './workflows';
import { simpleContentGenerationWorkflow } from './workflows/simpleContentGeneration';
import { multiContentGenerationWorkflow } from './workflows/multiContentGeneration';

export const mastra = new Mastra({
  agents: {
    newsAnalyzer,
    contentCreator,
  },
  workflows: {
    contentGenerationWorkflow,
    simpleContentGenerationWorkflow,
    multiContentGenerationWorkflow,
  },
  storage: new LibSQLStore({
    url: 'file:./mastra.db',
  }),
  logger: new PinoLogger({
    name: 'X-Community-Manager',
    level: 'info',
  }),
});
