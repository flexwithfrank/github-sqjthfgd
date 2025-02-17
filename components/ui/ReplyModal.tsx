import { useState, useEffect } from 'react';
import { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

type Post = {
  id: string;
  content: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
};

type CurrentUser = {
  id: string;
  avatar_url: string | null;
};

interface ReplyModalProps {
  visible: boolean;
  onClose: () => void;
  post: Post;
}

export function ReplyModal({ visible, onClose, post }: ReplyModalProps) {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const slideAnim = useRef(
    new Animated.Value(Platform.OS === 'web' ? 0 : 1000)
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      fetchCurrentUser();
    } else {
      Animated.timing(slideAnim, {
        toValue: 1000,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const fetchCurrentUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, avatar_url')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handleProfilePress = (userId: string | undefined) => {
    if (!userId) return;

    onClose();
    if (userId === currentUser?.id) {
      router.push('/(tabs)/profile');
    } else {
      router.push(`/profile/${userId}`);
    }
  };

  const handleReply = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: commentError } = await supabase.from('comments').insert({
        content: content.trim(),
        post_id: post.id,
        user_id: user.id,
      });

      if (commentError) throw commentError;

      setContent('');
      onClose();
    } catch (err: any) {
      console.error('Error creating reply:', err);
      setError(err.message || 'Failed to post reply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View
          style={[
            styles.container,
            {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReply}
              disabled={!content.trim() || loading}
              style={[
                styles.replyButton,
                (!content.trim() || loading) && styles.replyButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.replyButtonText,
                  (!content.trim() || loading) &&
                    styles.replyButtonTextDisabled,
                ]}
              >
                {loading ? 'Replying...' : 'Reply'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.originalPost}>
              <TouchableOpacity
                onPress={() => handleProfilePress(post.profiles.username)}
              >
                <Image
                  source={
                    post.profiles.avatar_url
                      ? { uri: post.profiles.avatar_url }
                      : {
                          uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop',
                        }
                  }
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <View style={styles.postContent}>
                <Text style={styles.displayName}>
                  {post.profiles.display_name}
                </Text>
                <Text style={styles.username}>@{post.profiles.username}</Text>
                <Text style={styles.postText}>{post.content}</Text>
              </View>
            </View>

            <View style={styles.replyContainer}>
              <TouchableOpacity
                onPress={() => handleProfilePress(currentUser?.id)}
              >
                <Image
                  source={
                    currentUser?.avatar_url
                      ? { uri: currentUser.avatar_url }
                      : {
                          uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop',
                        }
                  }
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Post your reply"
                placeholderTextColor="#666666"
                multiline
                value={content}
                onChangeText={setContent}
                maxLength={280}
                autoFocus
              />
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2f3336',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    color: '#ffffff',
    fontSize: 16,
  },
  replyButton: {
    backgroundColor: '#b0fb50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  replyButtonDisabled: {
    opacity: 0.5,
  },
  replyButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 15,
  },
  replyButtonTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  originalPost: {
    flexDirection: 'row',
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2f3336',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postContent: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  username: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  postText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 20,
  },
  replyContainer: {
    flexDirection: 'row',
    paddingTop: 16,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ff000020',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
  },
});
