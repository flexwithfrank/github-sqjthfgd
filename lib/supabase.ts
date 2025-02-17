import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { Database } from '../types/supabase';

// Memory fallback for environments without persistent storage
const memoryStorage = new Map<string, string>();

// Implement a storage adapter that works across all environments
const createStorageAdapter = () => {
  if (Platform.OS === 'web') {
    // Check if we're in a browser environment with localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      return {
        getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
        setItem: (key: string, value: string) => {
          window.localStorage.setItem(key, value);
          return Promise.resolve();
        },
        removeItem: (key: string) => {
          window.localStorage.removeItem(key);
          return Promise.resolve();
        },
      };
    }
  }

  // Use SecureStore for native platforms with error handling
  if (Platform.OS !== 'web') {
    return {
      getItem: async (key: string) => {
        try {
          return await SecureStore.getItemAsync(key);
        } catch (error) {
          console.warn('SecureStore getItem error:', error);
          return memoryStorage.get(key) ?? null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          await SecureStore.setItemAsync(key, value);
        } catch (error) {
          console.warn('SecureStore setItem error:', error);
          memoryStorage.set(key, value);
        }
      },
      removeItem: async (key: string) => {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (error) {
          console.warn('SecureStore removeItem error:', error);
          memoryStorage.delete(key);
        }
      },
    };
  }

  // Fallback to memory storage
  return {
    getItem: (key: string) => Promise.resolve(memoryStorage.get(key) ?? null),
    setItem: (key: string, value: string) => {
      memoryStorage.set(key, value);
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      memoryStorage.delete(key);
      return Promise.resolve();
    },
  };
};

// Access environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to ensure profile exists
export async function ensureProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error in ensureProfile:', error);
    return null;
  }
}