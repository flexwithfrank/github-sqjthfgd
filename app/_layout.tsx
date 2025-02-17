import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase, ensureProfile } from '../lib/supabase';

// Error boundary component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
    </View>
  );
}

export default function RootLayout() {
  const [session, setSession] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Ignore specific warnings to avoid unnecessary crashes
    LogBox.ignoreLogs(['Unhandled promise rejection']);

    // Custom global error handler
    const errorHandler = (error: any, isFatal: boolean) => {
      console.error('Global error:', error);
      setError(error);
    };

    // Set global error handler for React Native
    ErrorUtils.setGlobalHandler(errorHandler);

    // Initialize auth state
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(!!session);

        if (session) {
          const profile = await ensureProfile();
          if (!profile) {
            await supabase.auth.signOut();
            setSession(false);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(
          err instanceof Error ? err : new Error('Failed to initialize auth')
        );
      }
    };

    initAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(!!session);
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(
          err instanceof Error ? err : new Error('Auth state change failed')
        );
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (error) {
    return <ErrorFallback error={error} />;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0d0d0c' },
            animation: 'slide_from_right',
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            fullScreenGestureEnabled: true,
          }}
        >
          {session ? (
            <>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="create-post"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                  gestureEnabled: true,
                  gestureDirection: 'vertical',
                }}
              />
              <Stack.Screen
                name="post/[id]"
                options={{
                  animation: 'slide_from_right',
                  gestureEnabled: true,
                  gestureDirection: 'horizontal',
                }}
              />
            </>
          ) : (
            <Stack.Screen name="auth" />
          )}
        </Stack>
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0c',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0d0d0c',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    color: '#ff4444',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorMessage: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
});
