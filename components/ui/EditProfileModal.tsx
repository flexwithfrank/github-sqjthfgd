import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Input } from './Input';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { pickImage, uploadProfileImage } from '../../lib/image-upload';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

type Profile = {
  display_name: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  favorite_workout: string;
  created_at: string;
};

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: Profile | null;
  onProfileUpdate: () => void;
}

export function EditProfileModal({
  visible,
  onClose,
  profile,
  onProfileUpdate,
}: EditProfileModalProps) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [form, setForm] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
    favorite_workout: profile?.favorite_workout || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const uploadImage = async (imageUri: string, userId: string) => {
    try {
      const fileExt = imageUri.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileData = new Uint8Array(
        atob(base64)
          .split('')
          .map((char) => char.charCodeAt(0))
      );

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileData, {
          contentType: `image/${fileExt}`,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      return supabase.storage.from('avatars').getPublicUrl(filePath).data
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        console.log('Selected image URI:', result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
      } else {
        console.log('Image picker was cancelled.');
      }
    } catch (error) {
      console.error('Error launching image picker:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setErrors({});

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate username format
      if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
        setErrors({
          username:
            'Username can only contain letters, numbers, and underscores',
        });
        return;
      }

      // Check if username is taken (if changed)
      if (form.username !== profile?.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', form.username)
          .single();

        if (existingUser) {
          setErrors({
            username: 'This username is already taken',
          });
          return;
        }
      }

      let imageUrl = null;

      if (selectedImage) {
        console.log('Uploading image...');
        imageUrl = await uploadImage(selectedImage, user.id);
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: form.display_name,
          username: form.username,
          bio: form.bio,
          favorite_workout: form.favorite_workout,
          avatar_url: imageUrl || null,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onProfileUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrors({
        submit: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  const handleInputFocus = (inputY: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: inputY,
        animated: true,
      });
    }, 100);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[
          styles.container,
          { paddingTop: Platform.OS === 'ios' ? insets.top : 0 },
        ]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeText}>Cancel</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.headerTitle}>Edit profile</Text>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={loading || uploadingImage}
                  style={[
                    styles.saveButton,
                    (loading || uploadingImage) && styles.saveButtonDisabled,
                  ]}
                >
                  <Text style={styles.saveText}>
                    {loading ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{
                      uri:
                        selectedImage ||
                        form.avatar_url ||
                        'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop',
                    }}
                    style={styles.avatar}
                  />
                  <TouchableOpacity
                    style={[
                      styles.editAvatarButton,
                      uploadingImage && styles.editAvatarButtonDisabled,
                    ]}
                    onPress={pickImage}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <MaterialCommunityIcons
                        name="camera"
                        size={20}
                        color="#ffffff"
                      />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.avatar && (
                  <Text style={styles.avatarError}>{errors.avatar}</Text>
                )}
              </View>

              <View style={styles.form}>
                <Input
                  label="Name"
                  value={form.display_name}
                  onChangeText={(text) =>
                    setForm({ ...form, display_name: text })
                  }
                  error={errors.display_name}
                  autoCapitalize="words"
                  onFocus={() => handleInputFocus(0)}
                />

                <Input
                  label="Username"
                  value={form.username}
                  onChangeText={(text) => setForm({ ...form, username: text })}
                  error={errors.username}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => handleInputFocus(60)}
                />

                <Input
                  label="Bio"
                  value={form.bio}
                  onChangeText={(text) => setForm({ ...form, bio: text })}
                  error={errors.bio}
                  multiline
                  numberOfLines={3}
                  style={styles.bioInput}
                  onFocus={() => handleInputFocus(120)}
                />

                <Input
                  label="Favorite Workout"
                  value={form.favorite_workout}
                  onChangeText={(text) =>
                    setForm({ ...form, favorite_workout: text })
                  }
                  error={errors.favorite_workout}
                  onFocus={() => handleInputFocus(220)}
                />

                <View style={styles.dateJoined}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={20}
                    color="#666666"
                  />
                  <Text style={styles.dateText}>Joined {joinDate}</Text>
                </View>

                {errors.submit && (
                  <Text style={styles.submitError}>{errors.submit}</Text>
                )}
              </View>

              <View style={styles.bottomPadding} />
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
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
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2f3336',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    color: '#ffffff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#2f3336',
  },
  editAvatarButton: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    backgroundColor: '#1d9bf0',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  editAvatarButtonDisabled: {
    opacity: 0.7,
  },
  avatarError: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    padding: 16,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateJoined: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  dateText: {
    color: '#666666',
    fontSize: 14,
    marginLeft: 8,
  },
  submitError: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  bottomPadding: {
    height: 200,
  },
});
