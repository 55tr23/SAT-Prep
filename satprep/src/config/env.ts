// Environment configuration for API keys
export interface ApiKeys {
  openai: string;
  search: string;
  searchEngineId: string;
}

// Load API keys from environment variables
export const ENV_API_KEYS: ApiKeys = {
  openai: process.env.OPENAI_API_KEY || '',
  search: process.env.GOOGLE_SEARCH_API_KEY || '',
  searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID || '',
};

// Default keys (using environment variables)
export const DEFAULT_API_KEYS: ApiKeys = ENV_API_KEYS;

// Check if keys are configured
export const areApiKeysConfigured = (keys: ApiKeys): boolean => {
  return !!(keys.openai && keys.search && keys.searchEngineId);
};

// Legacy storage key (keeping for backward compatibility)
export const API_KEYS_STORAGE_KEY = 'sat_prep_api_keys'; 