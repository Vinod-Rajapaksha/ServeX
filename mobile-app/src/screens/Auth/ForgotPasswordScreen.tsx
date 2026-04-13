import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { forgotPassword } from '../../services/auth';
import Toast from 'react-native-toast-message';
import CustomAlert from '../../components/CustomAlert';

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as any });

  const handleResetPassword = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your email address',
      });
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setAlertConfig({
        visible: true,
        title: 'Email Sent',
        message: 'If an account exists with this email, you will receive password reset instructions.',
        type: 'success',
      });
    } catch (error: any) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: error.response?.data?.message || 'Failed to send reset link. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => {
          setAlertConfig({ ...alertConfig, visible: false });
          if (alertConfig.type === 'success') {
            navigation.goBack();
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 50,
    ...TYPOGRAPHY.body,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.textLight,
  },
  buttonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
  },
});

export default ForgotPasswordScreen;
