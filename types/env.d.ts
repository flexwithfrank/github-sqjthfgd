/// <reference types="expo" />

declare module '@env' {
  export const EXPO_PUBLIC_SUPABASE_URL: string;
  export const EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
}

// Extend ExpoConfig
declare module 'expo-constants' {
  interface ExpoConfig {
    extra?: {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
    };
  }
}