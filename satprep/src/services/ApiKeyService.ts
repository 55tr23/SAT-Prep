import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiKeys, API_KEYS_STORAGE_KEY, DEFAULT_API_KEYS, ENV_API_KEYS } from '../config/env';
import { Platform } from 'react-native';

/**
 * Service for managing API keys securely using AsyncStorage on mobile and localStorage on web
 * With priority for environment variables
 */
export class ApiKeyService {
  /**
   * Save API keys to secure storage
   * Note: This is kept for backward compatibility but isn't needed when using env variables
   */
  static async saveApiKeys(keys: ApiKeys): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
        return Promise.resolve();
      } else {
        // Use AsyncStorage on mobile
        await AsyncStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
      }
    } catch (error) {
      console.error('Error saving API keys:', error);
      throw error;
    }
  }

  /**
   * Load API keys from environment variables first, then fall back to secure storage
   */
  static async getApiKeys(): Promise<ApiKeys> {
    // Check if environment variables are configured first
    if (ENV_API_KEYS.openai && ENV_API_KEYS.search && ENV_API_KEYS.searchEngineId) {
      return ENV_API_KEYS;
    }
    
    // Fall back to stored keys for backward compatibility
    try {
      let keysJson: string | null = null;
      
      if (Platform.OS === 'web') {
        // Use localStorage on web
        keysJson = localStorage.getItem(API_KEYS_STORAGE_KEY);
      } else {
        // Use AsyncStorage on mobile
        keysJson = await AsyncStorage.getItem(API_KEYS_STORAGE_KEY);
      }
      
      if (!keysJson) {
        return DEFAULT_API_KEYS;
      }
      return JSON.parse(keysJson) as ApiKeys;
    } catch (error) {
      console.error('Error getting API keys:', error);
      return DEFAULT_API_KEYS;
    }
  }

  /**
   * Clear saved API keys
   * Note: This won't clear environment variables, only stored keys
   */
  static async clearApiKeys(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        localStorage.removeItem(API_KEYS_STORAGE_KEY);
        return Promise.resolve();
      } else {
        // Use AsyncStorage on mobile
        await AsyncStorage.removeItem(API_KEYS_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error clearing API keys:', error);
      throw error;
    }
  }
} 