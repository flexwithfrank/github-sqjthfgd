import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SettingsScreen() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/sign-in');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemContent}>
            <Ionicons name="person-outline" size={24} color="#ffffff" />
            <Text style={styles.itemText}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemContent}>
            <Ionicons name="notifications-outline" size={24} color="#ffffff" />
            <Text style={styles.itemText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemContent}>
            <Ionicons name="lock-closed-outline" size={24} color="#ffffff" />
            <Text style={styles.itemText}>Privacy</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemContent}>
            <Ionicons name="moon-outline" size={24} color="#ffffff" />
            <Text style={styles.itemText}>Dark Mode</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemContent}>
            <Ionicons name="globe-outline" size={24} color="#ffffff" />
            <Text style={styles.itemText}>Language</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemContent}>
            <Ionicons name="help-circle-outline" size={24} color="#ffffff" />
            <Text style={styles.itemText}>Help Center</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemContent}>
            <Ionicons name="document-text-outline" size={24} color="#ffffff" />
            <Text style={styles.itemText}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemContent}>
            <Ionicons name="shield-outline" size={24} color="#ffffff" />
            <Text style={styles.itemText}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.item, styles.signOutButton]} 
        onPress={handleSignOut}
      >
        <View style={styles.itemContent}>
          <Ionicons name="log-out-outline" size={24} color="#ff4444" />
          <Text style={[styles.itemText, styles.signOutText]}>Sign Out</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0c',
  },
  section: {
    paddingTop: 24,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  signOutButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  signOutText: {
    color: '#ff4444',
  },
});