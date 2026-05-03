import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, updateUser } from '../../services/admin';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import CustomAlert from '../../components/CustomAlert';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userFormSchema, UserFormData } from '../../validation/userValidation';
import { UserRole } from '../../core/enums';

const AdminAddEditUserScreen = ({ route, navigation }: any) => {
  const user = route.params?.user;
  const isEditing = !!user;
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'USER',
      phone: user?.phone || '',
      address: user?.address || '',
      id: user?._id || '',
    },
  });

  const [alertVisible, setAlertVisible] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: any) => isEditing ? updateUser(user._id, data) : createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setAlertVisible(true);
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} user`,
      });
    },
  });

  const onFormSubmit = (data: UserFormData) => {
    const submissionData = { ...data };

    if (isEditing && !submissionData.password) {
      delete submissionData.password;
    }

    delete submissionData.id;

    mutation.mutate(submissionData);
  };

  const roles = Object.values(UserRole);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        enabled={Platform.OS === 'ios'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit User' : 'Add New User'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Text style={styles.label}>Full Name *</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="e.g. Nimal Perera"
                  placeholderTextColor={COLORS.textLight}
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

            <Text style={styles.label}>Email Address *</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="e.g. nimal@example.com"
                  placeholderTextColor={COLORS.textLight}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

            {(true) && (
              <>
                <Text style={styles.label}>Password {isEditing ? '(Leave blank to keep current)' : '*'}</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.password && styles.inputError]}
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="Min. 8 characters"
                      placeholderTextColor={COLORS.textLight}
                      secureTextEntry
                    />
                  )}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
              </>
            )}

            <Text style={styles.label}>Phone Number</Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="e.g. 07xxxxxxxx"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="phone-pad"
                />
              )}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}

            <Text style={styles.label}>Address *</Text>
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.address && styles.inputError]}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="e.g. 123 Main St, Colombo"
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={2}
                />
              )}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}

            <Text style={styles.label}>User Role</Text>
            <View style={styles.roleContainer}>
              <Controller
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                  <>
                    {roles.map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.roleChip, value === r && styles.activeRoleChip]}
                        onPress={() => onChange(r)}
                      >
                        <Text style={[styles.roleChipText, value === r && styles.activeRoleChipText]}>
                          {r}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              />
            </View>
            {errors.role && <Text style={styles.errorText}>{errors.role.message}</Text>}

            <TouchableOpacity
              style={[styles.submitButton, mutation.isPending && styles.disabledButton]}
              onPress={handleSubmit(onFormSubmit)}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Update User' : 'Create User'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        title="Success"
        message={`User has been ${isEditing ? 'updated' : 'created'} successfully.`}
        type="success"
        onConfirm={() => {
          setAlertVisible(false);
          navigation.goBack();
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  form: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...TYPOGRAPHY.body,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  roleChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeRoleChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleChipText: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  activeRoleChipText: {
    color: COLORS.white,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  disabledButton: {
    backgroundColor: COLORS.textLight,
  },
  submitButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: 4,
  },
  inputError: {
    borderColor: COLORS.error,
  },
});

export default AdminAddEditUserScreen;
