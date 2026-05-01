import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { createBooking } from '../../services/booking';
import Toast from 'react-native-toast-message';
import CustomAlert from '../../components/CustomAlert';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema, BookingFormData } from '../../validation/bookingValidation';

const BookingCheckoutScreen = ({ route, navigation }: any) => {
  const { service } = route.params;
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' as any });

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      notes: '',
      address: user?.address || '',
      useDefaultAddress: !!user?.address,
    },
  });

  const useDefaultAddress = watch('useDefaultAddress');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Need gallery access to upload images' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => ({
        uri: asset.uri,
        base64: `data:image/jpeg;base64,${asset.base64}`,
      }));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleConfirmBooking = async (data: BookingFormData) => {
    setLoading(true);
    try {
      await createBooking({
        serviceId: service._id,
        providerId: service.providerId?._id || service.providerId,
        bookingDate: new Date().toISOString(),
        totalPrice: service.price,
        notes: data.notes,
        address: data.address,
        images: images.map(img => img.base64),
      });

      setAlertConfig({
        visible: true,
        title: 'Booking Confirmed!',
        message: 'Your booking has been successfully placed.',
        type: 'success',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Booking Failed',
        text2: error.response?.data?.message || 'Please try again later.',
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
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Summary</Text>
          <View style={styles.serviceCard}>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.servicePrice}>Rs. {service.price}</Text>
          </View>

          <Text style={styles.label}>Job Details (Required) *</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={[styles.input, styles.textArea, errors.notes && styles.errorInput]}
                  placeholder="What do you need the provider to do? (e.g. clean 2 rooms, fix leaky tap)"
                  multiline
                  numberOfLines={4}
                  value={value}
                  onChangeText={onChange}
                  textAlignVertical="top"
                />
                {errors.notes && <Text style={styles.errorText}>{errors.notes.message}</Text>}
              </>
            )}
          />

          <View style={styles.addressHeader}>
            <Text style={styles.label}>Service Address *</Text>
            {user?.address && (
              <TouchableOpacity
                style={styles.useDefaultToggle}
                onPress={() => {
                  const newVal = !useDefaultAddress;
                  setValue('useDefaultAddress', newVal);
                  if (newVal) setValue('address', user.address);
                }}
              >
                <Ionicons
                  name={useDefaultAddress ? "checkbox" : "square-outline"}
                  size={20}
                  color={useDefaultAddress ? COLORS.primary : COLORS.textLight}
                />
                <Text style={[styles.useDefaultText, useDefaultAddress && { color: COLORS.primary }]}>
                  Use Profile Address
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={[styles.input, errors.address && styles.errorInput, useDefaultAddress && styles.disabledInput]}
                  placeholder="Enter the full address for service..."
                  value={value}
                  onChangeText={onChange}
                  editable={!useDefaultAddress}
                  multiline
                />
                {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}
              </>
            )}
          />

          <Text style={styles.label}>Reference Images (Optional)</Text>
          <View style={styles.imageSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
                <Text style={styles.addImageText}>Add</Text>
              </TouchableOpacity>
              {images.map((img, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: img.uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Price</Text>
              <Text style={styles.summaryValue}>Rs. {service.price}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>Rs. {service.price}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>
              The provider will see your job details and address once you confirm.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, loading && styles.disabledButton]}
            onPress={handleSubmit(handleConfirmBooking)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm & Book</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => {
          setAlertConfig({ ...alertConfig, visible: false });
          if (alertConfig.type === 'success') {
            navigation.navigate('Main', { screen: 'Bookings' });
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
  section: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  serviceCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  serviceTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  servicePrice: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: 'bold',
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
  textArea: {
    height: 100,
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: 4,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  useDefaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  useDefaultText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  disabledInput: {
    backgroundColor: COLORS.background,
    color: COLORS.textLight,
  },
  imageSection: {
    marginTop: SPACING.xs,
  },

  imageScroll: {
    flexDirection: 'row',
  },
  addImageButton: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  addImageText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    marginTop: 4,
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: SPACING.sm,
    position: 'relative',
    marginTop: 5,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
  },
  summary: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
  },
  summaryValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  totalRow: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  totalValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  infoText: {
    flex: 1,
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    lineHeight: 18,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  disabledButton: {
    backgroundColor: COLORS.textLight,
  },
  confirmButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
    fontWeight: 'bold',
  },
});

export default BookingCheckoutScreen;