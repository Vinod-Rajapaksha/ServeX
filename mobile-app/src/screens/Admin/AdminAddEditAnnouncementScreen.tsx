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
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAnnouncement, updateAnnouncement } from '../../services/announcement';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import CustomAlert from '../../components/CustomAlert';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { announcementFormSchema, AnnouncementFormData } from '../../validation/announcementValidation';

const AdminAddEditAnnouncementScreen = ({ route, navigation }: any) => {
  const announcement = route.params?.announcement;
  const isEditing = !!announcement;
  const queryClient = useQueryClient();

  const [alertVisible, setAlertVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(announcement?.image || null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: announcement?.title || '',
      content: announcement?.content || '',
      targetAudience: announcement?.targetAudience || 'ALL',
      isActive: announcement?.isActive ?? true,
      expiresAt: announcement?.expiresAt ? new Date(announcement.expiresAt) : null,
      image: announcement?.image || '',
    },
  });

  const expiresAt = watch('expiresAt') as unknown as Date | null;
  const targetAudience = watch('targetAudience');

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEditing ? updateAnnouncement(announcement._id, data) : createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
      setAlertVisible(true);
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} announcement`,
      });
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setSelectedImage(result.assets[0].uri);
      setValue('image', base64 as any);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setValue('expiresAt', selectedDate as any);
    }
  };

  const onSubmit = (data: AnnouncementFormData) => {
    mutation.mutate(data);
  };

  const audiences: { label: string; value: 'CUSTOMER' | 'PROVIDER' | 'ALL' }[] = [
    { label: 'All Users', value: 'ALL' },
    { label: 'Customers', value: 'CUSTOMER' },
    { label: 'Providers', value: 'PROVIDER' },
  ];

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
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Announcement' : 'Add Announcement'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            {/* Image Upload */}
            <Text style={styles.label}>Banner Image (Optional)</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={40} color={COLORS.primary} />
                  <Text style={styles.imagePlaceholderText}>Upload Banner</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.label}>Title *</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="e.g. System Maintenance"
                  placeholderTextColor={COLORS.textLight}
                />
              )}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

            {/* Content */}
            <Text style={styles.label}>Content *</Text>
            <Controller
              control={control}
              name="content"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea, errors.content && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Write your announcement message here..."
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              )}
            />
            {errors.content && <Text style={styles.errorText}>{errors.content.message}</Text>}

            {/* Target Audience */}
            <Text style={styles.label}>Target Audience</Text>
            <View style={styles.audienceContainer}>
              {audiences.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.audienceChip,
                    targetAudience === item.value && styles.activeAudienceChip
                  ]}
                  onPress={() => setValue('targetAudience', item.value as any)}
                >
                  <Text style={[
                    styles.audienceText,
                    targetAudience === item.value && styles.activeAudienceText
                  ]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Active Status Toggle */}
            <View style={styles.statusContainer}>
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Active Status</Text>
                  <Text style={styles.toggleSubtext}>Is this announcement currently visible?</Text>
                </View>
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
                      thumbColor={value ? COLORS.primary : COLORS.textLight}
                    />
                  )}
                />
              </View>
            </View>

            {/* Expiry Date */}
            <Text style={styles.label}>Expiry Date</Text>
            <TouchableOpacity
              style={styles.datePickerBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.dateValue}>
                  {expiresAt && !isNaN(new Date(expiresAt).getTime()) 
                    ? new Date(expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) 
                    : 'No Expiry Date'}
                </Text>
                <Text style={styles.dateSubtext}>
                  {expiresAt ? 'Announcement will be hidden after this date' : 'Announcement will be visible indefinitely'}
                </Text>
              </View>
              {expiresAt && (
                <TouchableOpacity onPress={() => setValue('expiresAt', null as any)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={expiresAt || new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            <TouchableOpacity
              style={[styles.submitButton, mutation.isPending && styles.disabledButton]}
              onPress={handleSubmit(onSubmit)}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Update Announcement' : 'Post Announcement'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        title="Success"
        message={`Announcement has been ${isEditing ? 'updated' : 'posted'} successfully.`}
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
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: 2,
  },
  textArea: {
    height: 100,
  },
  imagePicker: {
    width: '100%',
    height: 180,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  audienceContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  audienceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  activeAudienceChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  audienceText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  activeAudienceText: {
    color: COLORS.white,
  },
  statusContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  toggleSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
    marginTop: 2,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateValue: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateSubtext: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
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
});

export default AdminAddEditAnnouncementScreen;
