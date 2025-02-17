import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';

type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

type Tab = 'leaderboard' | 'details';

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        <View style={styles.avatarGroup}>
          {profiles.slice(0, 3).map((profile, index) => (
            <Image
              key={profile.id}
              source={
                profile.avatar_url
                  ? { uri: profile.avatar_url }
                  : { uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop' }
              }
              style={[
                styles.headerAvatar,
                { transform: [{ translateX: index * -10 }] }
              ]}
            />
          ))}
        </View>
        <Text style={styles.headerTitle}>End March</Text>
        <Text style={styles.headerSubtitle}>160 KM Challenge</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>YOUR PROGRESS</Text>
          <Text style={styles.progressSubLabel}>Since 20 days ago</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: width * 0.95 * (152/160) }]} />
          </View>
          <Text style={styles.progressText}>152 / 160</Text>
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabs}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
        onPress={() => setActiveTab('leaderboard')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'leaderboard' && styles.activeTabText
        ]}>
          Participants ({profiles.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'details' && styles.activeTab]}
        onPress={() => setActiveTab('details')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'details' && styles.activeTabText
        ]}>
          Details
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLeaderboard = () => (
    <ScrollView style={styles.leaderboard}>
      {profiles.map((profile, index) => (
        <View key={profile.id} style={styles.leaderboardItem}>
          <Text style={styles.rank}>
            {String(index + 1).padStart(2, '0')}.
          </Text>
          <Image
            source={
              profile.avatar_url
                ? { uri: profile.avatar_url }
                : { uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop' }
            }
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>
              {profile.display_name || profile.username}
            </Text>
          </View>
          <Text style={styles.distance}>
          22 Workouts
          </Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderDetails = () => (
    <ScrollView style={styles.details}>
      <View style={styles.detailsContent}>
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>How it works</Text>
          <Text style={styles.detailsText}>
            Track your workouts and compete with other members to reach the 160 KM goal by the end of March. The more consistent you are, the higher you'll climb on the leaderboard!
          </Text>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Challenge Rules</Text>
          <View style={styles.ruleItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#b0fb50" />
            <Text style={styles.ruleText}>Complete 160 KM of cardio activities</Text>
          </View>
          <View style={styles.ruleItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#b0fb50" />
            <Text style={styles.ruleText}>All activities must be tracked in the app</Text>
          </View>
          <View style={styles.ruleItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#b0fb50" />
            <Text style={styles.ruleText}>Challenge ends on March 31st at midnight</Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Rewards</Text>
          <View style={styles.rewardItem}>
            <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>1st Place</Text>
              <Text style={styles.rewardText}>3 months free membership</Text>
            </View>
          </View>
          <View style={styles.rewardItem}>
            <MaterialCommunityIcons name="trophy" size={24} color="#C0C0C0" />
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>2nd Place</Text>
              <Text style={styles.rewardText}>2 months free membership</Text>
            </View>
          </View>
          <View style={styles.rewardItem}>
            <MaterialCommunityIcons name="trophy" size={24} color="#CD7F32" />
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>3rd Place</Text>
              <Text style={styles.rewardText}>1 month free membership</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      {activeTab === 'leaderboard' ? renderLeaderboard() : renderDetails()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#b0fb50',
    paddingBottom: 24,
  },
  headerContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 24,
    color: '#000',
    opacity: 0.9,
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    opacity: 0.9,
  },
  progressSubLabel: {
    fontSize: 12,
    color: '#000',
    opacity: 0.7,
    marginBottom: 8,
  },
  progressBar: {
    width: '95%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#b0fb50',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  leaderboard: {
    flex: 1,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  rank: {
    width: 40,
    fontSize: 16,
    color: '#666666',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  distance: {
    fontSize: 16,
    color: '#b0fb50',
    fontWeight: '600',
  },
  details: {
    flex: 1,
  },
  detailsContent: {
    padding: 20,
  },
  detailsSection: {
    marginBottom: 32,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  detailsText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
    lineHeight: 24,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardInfo: {
    marginLeft: 12,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  rewardText: {
    fontSize: 14,
    color: '#666666',
  },
});