import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.firstName) newErrors.firstName = 'First name is required';
    if (!form.lastName) newErrors.lastName = 'Last name is required';
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // 1. Sign up the user
      const { error: signUpError, data: { user } } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setErrors({
            email: 'This email is already registered',
            submit: 'An account with this email already exists. Please sign in instead.'
          });
          return;
        }
        throw signUpError;
      }

      if (!user) throw new Error('No user returned from sign up');

      // 2. Generate a unique username
      const baseUsername = form.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .ilike('username', `${baseUsername}%`);

      const username = count ? `${baseUsername}${count + 1}` : baseUsername;
      
      // 3. Create profile with retry logic
      const maxRetries = 3;
      let profileCreated = false;
      let retryCount = 0;

      while (!profileCreated && retryCount < maxRetries) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username,
            email: form.email,
            display_name: `${form.firstName} ${form.lastName}`.trim(),
          });

        if (!profileError) {
          profileCreated = true;
        } else {
          console.error(`Profile creation attempt ${retryCount + 1} failed:`, profileError);
          retryCount++;
          if (retryCount === maxRetries) {
            throw new Error('Failed to create user profile after multiple attempts');
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // 4. Verify profile was created
      const { data: profile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (verifyError || !profile) {
        throw new Error('Profile verification failed');
      }

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error signing up:', error);
      setErrors({ 
        submit: error.message || 'An error occurred during sign up. Please try again.' 
      });

      // If profile creation fails, attempt to clean up the auth user
      try {
        await supabase.auth.signOut();
      } catch (cleanupError) {
        console.error('Error cleaning up failed signup:', cleanupError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.scrollContainer,
        { paddingBottom: insets.bottom }
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Link href="/" style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#b0fb50" />
            <Text style={styles.backText}>Back</Text>
          </Link>
          <Text style={styles.title}>Sign up</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="First name"
            value={form.firstName}
            onChangeText={(text) => setForm({ ...form, firstName: text })}
            error={errors.firstName}
            autoCapitalize="words"
            autoComplete="given-name"
          />

          <Input
            label="Last name"
            value={form.lastName}
            onChangeText={(text) => setForm({ ...form, lastName: text })}
            error={errors.lastName}
            autoCapitalize="words"
            autoComplete="family-name"
          />

          <Input
            label="Email"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            error={errors.email}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            error={errors.password}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            autoCapitalize="none"
            autoComplete="new-password"
          />

          {errors.submit && (
            <View style={styles.errorContainer}>
              <Text style={styles.submitError}>{errors.submit}</Text>
              {errors.email?.includes('already registered') && (
                <Button 
                  variant="secondary"
                  onPress={() => router.replace('/auth/sign-in')}
                  style={styles.signInButton}
                >
                  Go to Sign In
                </Button>
              )}
            </View>
          )}

          <Text style={styles.terms}>
            By selecting "Agree and continue" I agree to{' '}
            <Text style={styles.link} onPress={() => {}}>
              Terms of Service
            </Text>
            {' '}and acknowledge the{' '}
            <Text style={styles.link} onPress={() => {}}>
              Privacy Policy
            </Text>
          </Text>

          <Button onPress={handleSignUp} disabled={loading}>
            {loading ? 'Creating account...' : 'Agree and continue'}
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/auth/sign-in" style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Click here to Login</Text>
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
  backText: {
    color: '#b0fb50',
    fontSize: 16,
    marginLeft: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  form: {
    flex: 1,
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
  signInButton: {
    marginTop: 8,
  },
  terms: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
    lineHeight: 20,
  },
  link: {
    color: '#b0fb50',
    textDecorationLine: 'underline',
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