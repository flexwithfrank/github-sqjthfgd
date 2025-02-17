import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

interface HeaderSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function HeaderSheet({ visible, onClose }: HeaderSheetProps) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.replace('/auth/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const menuItems = [
    {
      icon: 'account',
      label: 'Profile',
      onPress: () => {
        router.push('/(tabs)/profile');
        onClose();
      },
    },
    {
      icon: 'message-badge-outline',
      label: 'Message',
      onPress: () => {
        router.push('/(tabs)/messages');
        onClose();
      },
    },
    {
      icon: 'trophy-outline',
      label: 'Leaderboard',
      onPress: () => {
        router.push('/(tabs)/leaderboard');
        onClose();
      },
    },
    {
      icon: 'chart-timeline-variant',
      label: 'Activity',
      onPress: () => {
        router.push('/activity');
        onClose();
      },
    },
    {
      icon: 'bookmark-outline',
      label: 'Bookmarks',
      onPress: () => {
        // TODO: Implement bookmarks
        onClose();
      },
    },
    {
      icon: 'cog-outline',
      label: 'Settings',
      onPress: () => {
        router.push('/(tabs)/settings');
        onClose();
      },
    },
    {
      icon: 'help-circle-outline',
      label: 'Help',
      onPress: () => {
        // TODO: Implement help
        onClose();
      },
    },
    {
      icon: 'logout',
      label: loading ? 'Signing out...' : 'Sign out',
      onPress: handleSignOut,
      color: '#ff4444',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Menu</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
                disabled={loading}
              >
                <MaterialCommunityIcons 
                  name={item.icon as any}
                  size={32}
                  color={item.color || '#ffffff'}
                />
                <Text style={[
                  styles.menuItemText,
                  item.color && { color: item.color }
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '65%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: '#333333',
  },
  menuItemText: {
    fontSize: 20,
    color: '#ffffff',
    marginLeft: 12,
    fontWeight: '600',
  },
});