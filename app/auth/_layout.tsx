import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#0d0d0c',
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { 
            backgroundColor: '#0d0d0c',
            paddingHorizontal: 20,
          },
          animation: 'slide_from_right',
          animationDuration: 200,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }} 
      />
    </View>
  );
}