import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, ReviewFormData } from '../validation/feedbackValidation';

interface ReviewModalProps {
  visible: boolean;
  serviceName?: string;
  initialData?: {
    rating: number;
    comment: string;
    images: string[];
  };
  onClose: () => void;
  onSubmit: (rating: number, comment: string, images: string[]) => void;
  isLoading?: boolean;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  serviceName,
  initialData,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const rating = watch('rating');

  React.useEffect(() => {
    if (visible) {
      setShowSuccess(false);
      if (initialData) {
        reset({
          rating: initialData.rating,
          comment: initialData.comment,
        });
        setImages(initialData.images || []);
      } else {
        reset({
          rating: 0,
          comment: '',
        });
        setImages([]);
      }
    }
  }, [initialData, visible, reset]);

  React.useEffect(() => {
    if (isSubmitting && !isLoading) {
      setShowSuccess(true);
      setIsSubmitting(false);
    }
  }, [isLoading, isSubmitting]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map(asset =>
        asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri
      );
      setImages([...images, ...selectedImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onFormSubmit = (data: ReviewFormData) => {
    setIsSubmitting(true);
    onSubmit(data.rating, data.comment, images);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {showSuccess ? (
          <View style={styles.container}>
            <View style={styles.successContainer}>
              <View style={styles.successIconWrapper}>
                <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
              </View>
              <Text style={styles.successTitle}>{initialData ? 'Review Updated!' : 'Thank You!'}</Text>
              <Text style={styles.successMessage}>
                {initialData 
                  ? 'Your review has been updated successfully.' 
                  : 'Your feedback has been submitted successfully. It helps us provide better service to everyone.'}
              </Text>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={onClose}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>{initialData ? 'Edit Review' : 'Rate & Review'}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {serviceName && (
              <Text style={styles.serviceNameText}>{serviceName}</Text>
            )}

            <Text style={styles.subtitle}>How was your experience?</Text>

            <View style={styles.starSection}>
              <Controller
                control={control}
                name="rating"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => onChange(star)}
                        style={styles.starButton}
                      >
                        <Ionicons
                          name={star <= value ? 'star' : 'star-outline'}
                          size={40}
                          color={star <= value ? COLORS.warning : COLORS.border}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              {errors.rating && <Text style={styles.errorText}>{errors.rating.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="comment"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.comment && styles.inputError]}
                    placeholder="Share your feedback (required)..."
                    placeholderTextColor={COLORS.textLight}
                    multiline
                    numberOfLines={4}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    textAlignVertical="top"
                  />
                )}
              />
              {errors.comment && <Text style={styles.errorText}>{errors.comment.message}</Text>}
            </View>

            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>Add Photos (Optional)</Text>
              <View style={styles.imageList}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 5 && (
                  <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                    <Ionicons name="camera-outline" size={28} color={COLORS.primary} />
                    <Text style={styles.addImageText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={handleSubmit(onFormSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {initialData ? 'Update Review' : 'Submit Review'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  serviceNameText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  starButton: {
    padding: 4,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    height: 100,
    ...TYPOGRAPHY.body,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  starSection: {
    marginBottom: SPACING.xl,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  successIconWrapper: {
    marginBottom: SPACING.lg,
  },
  successTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  successMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.md,
  },
  doneButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 150,
    alignItems: 'center',
  },
  doneButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
    fontWeight: 'bold',
  },
  imageSection: {
    marginBottom: SPACING.xl,
  },
  imageLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
    fontWeight: 'bold',
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  imageWrapper: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS.md,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.md,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  addImageBtn: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '05',
  },
  addImageText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.border,
  },
  submitButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
  },
});

export default ReviewModal;
