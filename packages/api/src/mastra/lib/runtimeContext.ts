export function createDefaultRuntimeContext() {
  return {
    runId: Math.random().toString(36).substring(7),
    stepName: '',
    executorId: '',
    transportId: '',
    stepMetadata: {},
    workflowRunData: new Map(),
  };
}
