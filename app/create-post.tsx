import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slideAnim = new Animated.Value(Platform.OS === 'web' ? 0 : 1000);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  console.log(selectedImage);
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();

    async function checkProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/auth/sign-in');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          throw new Error('Profile not found');
        }
      } catch (err) {
        console.error('Error checking profile:', err);
        router.replace('/auth/sign-in');
      }
    }

    checkProfile();
  }, []);

  const handleClose = () => {
    router.back();
  };

  const handlePost = async () => {
    if (!content.trim()) {
      console.warn('Post content is empty.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching user data...');
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!user) {
        console.warn('User not found. Redirecting to sign-in.');
        router.replace('/auth/sign-in');
        return;
      }

      let imageUrl = null;

      if (selectedImage) {
        console.log('Uploading image...');
        imageUrl = await uploadImage(selectedImage, user.id);
      }

      const { error: postError } = await supabase.from('posts').insert({
        user_id: user.id,
        content: content.trim(),
        image_url: imageUrl || null,
      });

      if (postError) {
        console.error('Post creation failed:', postError);
        throw postError;
      }

      handleClose();
    } catch (err) {
      console.error('Unexpected error:', err);
      setError((err as any).message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (imageUri: string, userId: string) => {
    setLoading(true)
    try {
      const fileExt = imageUri.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileData = new Uint8Array(
        atob(base64)
          .split('')
          .map((char) => char.charCodeAt(0))
      );

      const { data, error } = await supabase.storage
        .from('posts')
        .upload(filePath, fileData, {
          contentType: `image/${fileExt}`,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

    setLoading(false)
      return supabase.storage.from('posts').getPublicUrl(filePath).data
        .publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      console.log('Permission denied.');
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setSelectedImage(result.assets[0].uri);
      } else {
        console.log('Image picker was cancelled.');
      }
    } catch (error) {
      console.error('Error launching image picker:', error);
    }
  };

  const isPostDisabled = !content.trim() || loading;

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <Animated.View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePost}
            disabled={isPostDisabled}
            style={[
              styles.postButton,
              isPostDisabled && styles.postButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.postButtonText,
                isPostDisabled && styles.postButtonTextDisabled,
              ]}
            >
              {loading ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons
                name="account-circle"
                size={40}
                color="#666666"
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="What's happening?"
              placeholderTextColor="#666666"
              multiline
              autoFocus
              value={content}
              onChangeText={setContent}
              maxLength={280}
            />
          </View>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.image} />
          )}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.toolbar}>
          <View style={styles.toolbarLeft}>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => pickImage()}
            >
              <MaterialCommunityIcons
                name="image-outline"
                size={24}
                color="#b0fb50"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <MaterialCommunityIcons
                name="video-outline"
                size={24}
                color="#b0fb50"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <MaterialCommunityIcons
                name="format-list-bulleted"
                size={24}
                color="#b0fb50"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarButton}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={24}
                color="#b0fb50"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.toolbarRight}>
            <TouchableOpacity style={styles.toolbarButton}>
              <MaterialCommunityIcons name="earth" size={20} color="#b0fb50" />
              <Text style={styles.replyText}>Everyone</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
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
    paddingVertical: 25,
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
  postButton: {
    backgroundColor: '#b0fb50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 15,
  },
  postButtonTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2f3336',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 24,
    paddingTop: 8,
    textAlignVertical: 'top',
    minHeight: 120,
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
  divider: {
    height: 0.5,
    backgroundColor: '#2f3336',
    marginHorizontal: 16,
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    padding: 4,
  },
  replyText: {
    color: '#b0fb50',
    fontSize: 14,
    marginLeft: 4,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
});
