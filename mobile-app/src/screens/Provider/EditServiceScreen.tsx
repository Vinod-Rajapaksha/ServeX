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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { updateService, getCategories } from '../../services/service';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import CustomAlert from '../../components/CustomAlert';
import { serviceSchema, ServiceFormData } from '../../validation/serviceValidation';

const PRICE_UNITS = ['Hour', 'Day', 'Week', 'Month', 'Year'];

const EditServiceScreen = ({ route, navigation }: any) => {
  const { service } = route.params;
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>(service.images || []);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success' as any });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      priceUnit: service.priceUnit || 'Hour',
      categoryId: service.categoryId?._id || service.categoryId,
    },
  });

  const selectedCategoryId = watch('categoryId');
  const selectedPriceUnit = watch('priceUnit');

  const mutation = useMutation({
    mutationFn: (data: any) => updateService(service._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myServices'] });
      queryClient.invalidateQueries({ queryKey: ['service', service._id] });
      setAlertConfig({
        visible: true,
        title: 'Success',
        message: 'Service has been updated successfully!',
        type: 'success',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to update service',
      });
    },
  });

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map(asset => `data:image/jpeg;base64,${asset.base64}`);
      setImages([...images, ...selectedImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ServiceFormData) => {
    mutation.mutate({
      ...data,
      price: parseFloat(data.price),
      images,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Service</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            {/* Image Upload Section */}
            <Text style={styles.label}>Service Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                <Ionicons name="camera-outline" size={30} color={COLORS.primary} />
                <Text style={styles.addImageText}>Add</Text>
              </TouchableOpacity>
              {images.map((img, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: img }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                    <Ionicons name="close-circle" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Title</Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="e.g. Home Cleaning"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories?.map((cat: any) => (
                  <TouchableOpacity
                    key={cat._id}
                    style={[
                      styles.categoryChip,
                      selectedCategoryId === cat._id && styles.activeCategoryChip,
                    ]}
                    onPress={() => setValue('categoryId', cat._id)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategoryId === cat._id && styles.activeCategoryChipText,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId.message}</Text>}
            </View>

            {/* Price & Unit */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pricing</Text>
              <View style={styles.priceRow}>
                <Controller
                  control={control}
                  name="price"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, styles.priceInput, errors.price && styles.inputError]}
                      placeholder="0.00"
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                <View style={styles.unitSelector}>
                  {PRICE_UNITS.map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitChip,
                        selectedPriceUnit === unit && styles.activeUnitChip,
                      ]}
                      onPress={() => setValue('priceUnit', unit as any)}
                    >
                      <Text style={[
                        styles.unitChipText,
                        selectedPriceUnit === unit && styles.activeUnitChipText
                      ]}>
                        /{unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {errors.price && <Text style={styles.errorText}>{errors.price.message}</Text>}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                    placeholder="Describe your service..."
                    multiline
                    numberOfLines={4}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    textAlignVertical="top"
                  />
                )}
              />
              {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, mutation.isPending && styles.disabledButton]}
              onPress={handleSubmit(onSubmit)}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>Update Service</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
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
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  textArea: {
    height: 120,
  },
  imageScroll: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  addImageText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeCategoryChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
  },
  activeCategoryChipText: {
    color: COLORS.white,
  },
  priceRow: {
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  priceInput: {
    flex: 1,
  },
  unitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  unitChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeUnitChip: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  unitChipText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  activeUnitChipText: {
    color: COLORS.primary,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
  },
});

export default EditServiceScreen;

