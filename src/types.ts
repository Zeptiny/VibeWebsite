export interface Env {
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL: string;
}

export interface VibeOptions {
  prompt: string;
  model?: string;
  temperature?: number;
}
