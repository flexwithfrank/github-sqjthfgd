import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function ActivityLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Activity</Text>
      </View>

      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#000000',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: '#b0fb50',
          tabBarInactiveTintColor: '#666666',
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
          },
          headerShown: false,
          tabBarIndicator: () => (
            <View style={styles.indicator} />
          ),
          tabBarIndicatorStyle: {
            backgroundColor: '#b0fb50',
            height: 3,
          },
          tabBarShowIcon: true,
        }}
      >
        <Tabs.Screen
          name="overall"
          options={{
            title: 'Overall Activity',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="chart-timeline-variant" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Class History',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="history" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#b0fb50',
  },
});