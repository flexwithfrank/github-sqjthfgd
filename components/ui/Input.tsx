import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export function Input({ 
  label, 
  error, 
  icon, 
  rightIcon,
  onRightIconPress,
  style,
  ...props 
}: InputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color="#666666" 
            style={styles.icon} 
          />
        )}
        <TextInput 
          style={[styles.input, style]} 
          placeholderTextColor="#666666"
          {...props} 
        />
        {rightIcon && (
          <Ionicons 
            name={rightIcon} 
            size={20} 
            color="#666666" 
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  icon: {
    marginLeft: 16,
  },
  rightIcon: {
    marginRight: 16,
  },
  error: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 4,
  },
});