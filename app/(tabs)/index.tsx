import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { ReplyModal } from '../../components/ui/ReplyModal';
import { formatRelativeTime } from '../../lib/date-utils';

type Post = {
  id: string;
  image_url: any;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
};

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<Post | null>(null);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        image_url,
        id,
        content,
        created_at,
        user_id,
        likes_count,
        profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    setPosts(data || []);
  }

  async function fetchLikedPosts() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id);

      if (likes) {
        setLikedPosts(new Set(likes.map((like) => like.post_id)));
      }
    } catch (error) {
      console.error('Error fetching liked posts:', error);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPosts(), fetchLikedPosts()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPosts();

    // Get current user ID
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
      if (user) {
        fetchLikedPosts();
      }
    });

    // Subscribe to real-time changes for posts
    const postsChannel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the complete post data including profile
            const { data, error } = await supabase
              .from('posts')
              .select(
                `
                id,
                content,
                created_at,
                user_id,
                image_url,
                likes_count,
                profiles (
                  username,
                  display_name,
                  avatar_url
                )
              `
              )
              .eq('id', payload.new.id)
              .single();

            if (!error && data) {
              setPosts((currentPosts) => [data, ...currentPosts]);
            }
          } else if (payload.eventType === 'DELETE') {
            setPosts((currentPosts) =>
              currentPosts.filter((post) => post.id !== payload.old.id)
            );
          } else if (payload.eventType === 'UPDATE') {
            setPosts((currentPosts) =>
              currentPosts.map((post) =>
                post.id === payload.new.id ? { ...post, ...payload.new } : post
              )
            );
          }
        }
      )
      .subscribe();

    // Subscribe to real-time changes for likes
    const likesChannel = supabase
      .channel('public:likes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLikedPosts((prev) => new Set([...prev, payload.new.post_id]));
          } else if (payload.eventType === 'DELETE') {
            setLikedPosts((prev) => {
              const next = new Set(prev);
              next.delete(payload.old.post_id);
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      postsChannel.unsubscribe();
      likesChannel.unsubscribe();
    };
  }, []);

  const handleDeletePost = async (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);

              if (error) throw error;
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleProfilePress = (userId: string) => {
    if (userId === currentUserId) {
      router.push('/(tabs)/profile');
    } else {
      router.push(`/profile/${userId}`);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const isLiked = likedPosts.has(postId);

      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setLikedPosts((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      } else {
        await supabase.from('likes').insert({
          post_id: postId,
          user_id: user.id,
        });

        setLikedPosts((prev) => new Set([...prev, postId]));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async (post: Post) => {
    try {
      await Share.share({
        message: `Check out this post from ${post.profiles.display_name}:\n\n${post.content}\n\nJoin the conversation on Bolt!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderPost = ({ item }: { item: Post }) => {
    const isCurrentUserPost = currentUserId === item.user_id;
    const isLiked = likedPosts.has(item.id);

    return (
      <TouchableOpacity
        style={styles.post}
        onPress={() => handlePostPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.postHeader}>
          <View style={styles.postHeaderText}>
            <View style={styles.nameContainer}>
              <TouchableOpacity
                onPress={() => handleProfilePress(item.user_id)}
              >
                <Image
                  source={
                    item.profiles.avatar_url
                      ? { uri: item.profiles.avatar_url }
                      : {
                          uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop',
                        }
                  }
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleProfilePress(item.user_id)}
              >
                <Text style={styles.displayName}>
                  {item.profiles.display_name}
                </Text>
              </TouchableOpacity>
              <Text style={styles.username}>@{item.profiles.username}</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.timeAgo}>
                {formatRelativeTime(item.created_at)}
              </Text>
              {isCurrentUserPost && (
                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() => handleDeletePost(item.id)}
                >
                  <MaterialCommunityIcons
                    name="delete-outline"
                    size={16}
                    color="#ff4444"
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.content}>{item.content}</Text>
            {item?.image_url && (
              <Image source={{ uri: item?.image_url }} style={styles.image} />
            )}
          </View>
        </View>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              setReplyingTo(item);
            }}
          >
            <MaterialCommunityIcons
              name="reply-outline"
              size={18}
              color="#666666"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleLike(item.id);
            }}
          >
            <MaterialCommunityIcons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={isLiked ? '#ff4444' : '#666666'}
            />
            {item.likes_count > 0 && (
              <Text style={[styles.actionText, isLiked && styles.likedText]}>
                {item.likes_count}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleShare(item);
            }}
          >
            <MaterialCommunityIcons
              name="share-variant-outline"
              size={18}
              color="#666666"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#b0fb50"
          />
        }
      />

      {replyingTo && (
        <ReplyModal
          visible={!!replyingTo}
          onClose={() => setReplyingTo(null)}
          post={replyingTo}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  post: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2f3336',
  },
  postHeader: {
    flexDirection: 'row',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderText: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  displayName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginRight: 4,
  },
  username: {
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  dot: {
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  timeAgo: {
    fontSize: 14,
    color: '#666666',
  },
  moreButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
    color: '#ffffff',
    marginTop: 4,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingRight: 16,
    maxWidth: 200,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  actionText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 4,
  },
  likedText: {
    color: '#ff4444',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
});