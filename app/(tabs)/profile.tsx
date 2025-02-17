import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { EditProfileModal } from '../../components/ui/EditProfileModal';

type Profile = {
  username: string;
  display_name: string;
  image_url: string | null;
  avatar_url: string | null;
  bio: string | null;
  favorite_workout: string | null;
  created_at: string;
};

type Post = {
  image_url: React.JSX.Element;
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  async function loadProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select(
          'username, display_name, avatar_url, bio, favorite_workout, created_at'
        )
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);

      // Fetch user's posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProfile();

    // Subscribe to posts changes
    const channel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        () => {
          loadProfile(); // Reload posts when changes occur
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleEditProfile = () => {
    setIsEditModalVisible(true);
  };

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Could not load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#b0fb50"
        />
      }
    >
      <View style={styles.header}>
        <Image
          source={
            profile.avatar_url
              ? { uri: profile.avatar_url }
              : {
                  uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
                }
          }
          style={styles.avatar}
        />
        <Text style={styles.displayName}>{profile.display_name}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {profile.favorite_workout && (
          <View style={styles.workoutContainer}>
            <Ionicons name="barbell-outline" size={16} color="#666666" />
            <Text style={styles.workoutText}>{profile.favorite_workout}</Text>
          </View>
        )}

        <View style={styles.joinedContainer}>
          <Ionicons name="calendar-outline" size={16} color="#666666" />
          <Text style={styles.joinedText}>
            Joined{' '}
            {new Date(profile.created_at).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{posts.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
      </View>

      <View style={styles.content}>
        {posts.length === 0 ? (
          <Text style={styles.emptyText}>No posts yet</Text>
        ) : (
          posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.post}
              onPress={() => handlePostPress(post.id)}
              activeOpacity={0.7}
            >
              <View style={styles.postHeader}>
                <Image
                  source={
                    profile.avatar_url
                      ? { uri: profile.avatar_url }
                      : {
                          uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop',
                        }
                  }
                  style={styles.postAvatar}
                />
                <View style={styles.postHeaderText}>
                  <Text style={styles.postDisplayName}>
                    {profile.display_name}
                  </Text>
                  <Text style={styles.postUsername}>@{profile.username}</Text>
                  <Text style={styles.postDot}>·</Text>
                  <Text style={styles.postTime}>
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              <Text style={styles.postContent}>{post.content}</Text>
              {post?.image_url && (
                <Image source={{ uri: post?.image_url }} style={styles.image} />
              )}

              <View style={styles.postActions}>
                <View style={styles.postAction}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={16}
                    color="#666666"
                  />
                  <Text style={styles.postActionText}>0</Text>
                </View>
                <View style={styles.postAction}>
                  <Ionicons name="repeat" size={16} color="#666666" />
                  <Text style={styles.postActionText}>0</Text>
                </View>
                <View style={styles.postAction}>
                  <Ionicons name="heart-outline" size={16} color="#666666" />
                  <Text style={styles.postActionText}>{post.likes_count}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        profile={profile}
        onProfileUpdate={loadProfile}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#b0fb50',
    marginBottom: 16,
  },
  editButtonText: {
    color: '#b0fb50',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutText: {
    color: '#666666',
    fontSize: 14,
    marginLeft: 6,
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinedText: {
    color: '#666666',
    fontSize: 14,
    marginLeft: 6,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 32,
  },
  post: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  postDisplayName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 4,
  },
  postUsername: {
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  postDot: {
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  postTime: {
    fontSize: 14,
    color: '#666666',
  },
  postContent: {
    fontSize: 15,
    lineHeight: 20,
    color: '#ffffff',
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 16,
    maxWidth: 200,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  postActionText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 4,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 15,
  },
});
