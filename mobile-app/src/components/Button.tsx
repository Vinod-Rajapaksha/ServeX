import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  loading, 
  disabled, 
  variant = 'primary' 
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#ccc';
    switch (variant) {
      case 'secondary': return '#6c757d';
      case 'danger': return '#dc3545';
      default: return '#007bff';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: getBackgroundColor() }]} 
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Button;
