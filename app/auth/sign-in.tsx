import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Link, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!form.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // 1. Sign in the user
      const {
        error: signInError,
        data: { user },
      } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setErrors({
            submit: 'Invalid email or password',
          });
          return;
        }
        throw signInError;
      }

      if (!user) throw new Error('No user returned from sign in');

      // 2. Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        // Sign out the user since their profile doesn't exist
        await supabase.auth.signOut();
        setErrors({
          submit:
            'Your profile could not be found. Please sign up for a new account.',
        });
        return;
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error signing in:', error);
      setErrors({
        submit: error.message || 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        { paddingBottom: insets.bottom },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.backButton}>
            <Link href="/" asChild>
              <TouchableOpacity style={styles.linkContent}>
                <Ionicons name="arrow-back" size={20} color="#b0fb50" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <Text style={styles.title}>Welcome Back!</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.hiddenInput}
            autoComplete="email"
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, email: text }))
            }
          />
          <TextInput
            style={styles.hiddenInput}
            autoComplete="password"
            textContentType="password"
            value={form.password}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, password: text }))
            }
            secureTextEntry
          />

          <Input
            label="Email"
            value={form.email}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, email: text }))
            }
            error={errors.email}
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            value={form.password}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, password: text }))
            }
            error={errors.password}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
          />

          {errors.submit && (
            <View style={styles.errorContainer}>
              <Text style={styles.submitError}>{errors.submit}</Text>
              {errors.submit.includes('Please sign up') && (
                <Link href="/auth/sign-up" style={styles.footerLink}>
                  <Text style={styles.footerLinkText}>Sign up</Text>
                </Link>
              )}
            </View>
          )}

          <Button onPress={handleSignIn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Link href="/auth/sign-up" style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Sign up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    marginTop: 32,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center', // Aligns icon and text vertically
    gap: 8, // Adds spacing between icon and text (or use marginLeft)
  },

  backText: {
    fontSize: 16,
    color: '#b0fb50',
    fontWeight: '600',
  },
  icon: {
    marginTop: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  form: {
    flex: 1,
  },
  hiddenInput: {
    height: 0,
    width: 0,
    opacity: 0,
    position: 'absolute',
  },
  errorContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  submitError: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  signUpButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    color: '#666666',
    fontSize: 14,
  },
  footerLink: {
    marginTop: 8,
  },
  footerLinkText: {
    color: '#b0fb50',
    fontSize: 14,
    fontWeight: '600',
  },
});
