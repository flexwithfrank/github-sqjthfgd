import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function FloatingButton() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const handlePress = useCallback(() => {
    router.push('/create-post');
  }, []);
  
  // Hide button if we're on a post page
  if (pathname.startsWith('/post/')) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { bottom: 80 + insets.bottom }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name="plus" size={24} color="#000000" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#b0fb50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});