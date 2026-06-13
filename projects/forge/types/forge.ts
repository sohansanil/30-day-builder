export type ForgeContext = {
  userIdea: string;
  constraints?: string;
  plan?: string;        // JSON string from Orchestrator
  research?: string;    // Markdown from Research Agent
  prd?: string;         // Markdown from PRD Writer
  architecture?: string; // Markdown from Architect
  executionPrompt?: string; // Markdown from Execution Engineer
  critique?: string;    // Markdown from Critic
};
