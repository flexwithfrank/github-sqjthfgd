import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export default function SplashScreen() {
  const insets = useSafeAreaInsets();

  const handleTermsPress = () => {
    Linking.openURL('https://example.com/terms');
  };

  const handlePrivacyPress = () => {
    Linking.openURL('https://example.com/privacy');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Feather name="activity" size={24} color="#b0fb50" />
        <Text style={styles.logo}>Xconnect</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://ik.imagekit.io/cv3vwtali/splash.png?updatedAt=1739604049932' }}
          style={styles.image}
        />
        <View style={styles.overlay} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Shred, track, and</Text>
          <Text style={styles.title}>sweat together.</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.emailButton]}
            onPress={() => router.replace('/auth/sign-in')}
          >
            <Text style={styles.emailButtonText}>Sign in with Email</Text>
          </TouchableOpacity>

        

          <TouchableOpacity 
            style={[styles.button, styles.googleButton]}
            onPress={() => {
              // Google sign-in functionality will be implemented later
              console.log('Google sign-in pressed');
            }}
          >
            <Image 
              source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
              style={styles.googleLogo}
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            By creating an account or signing in you agree to our{' '}
            <Text style={styles.link} onPress={handleTermsPress}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.link} onPress={handlePrivacyPress}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b0fb50',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  titleContainer: {
    marginTop: 120,
  },
  title: {
    fontSize: 36,
    fontWeight: 'medium',
    color: '#ffffff',
    lineHeight: 44,
   textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  emailButton: {
    backgroundColor: '#b0fb50',
  },
  emailButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  numberButton: {
    backgroundColor: '#ffffff',
  },
  numberButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    marginTop: 4,
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signupText: {
    color: '#ffffff',
    fontSize: 14,
  },
  signupLink: {
    color: '#b0fb50',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  termsText: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  link: {
    color: '#ffffff',
    textDecorationLine: 'underline',
  },
});