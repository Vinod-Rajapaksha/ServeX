import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Image,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateBooking, getBookingById, deleteBooking } from '../../services/booking';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { BookingStatus } from '../../core/enums';
import Toast from 'react-native-toast-message';
import CustomAlert from '../../components/CustomAlert';
import ReviewModal from '../../components/ReviewModal';
import { addFeedback } from '../../services/feedback';

const BookingDetailsScreen = ({ route, navigation }: any) => {
  const { booking: initialBooking } = route.params;
  const { user } = useSelector((state: RootState) => state.auth);
  const isProvider = user?.role === 'PROVIDER';
  const queryClient = useQueryClient();

  const { data: booking = initialBooking, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['booking', initialBooking._id],
    queryFn: () => getBookingById(initialBooking._id),
    initialData: initialBooking,
    refetchInterval: 5000,
  });

  const [status, setStatus] = useState(booking.status);
  const [notes, setNotes] = useState(booking.notes || '');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error' as any,
    showCancel: false,
    onConfirm: () => { }
  });

  React.useEffect(() => {
    if (booking) {
      setStatus(booking.status);
      setNotes(booking.notes || '');
      
      if (!isProvider && booking.status === 'COMPLETED' && !booking.isReviewed) {
        setReviewModalVisible(true);
      }
    }
  }, [booking, isProvider]);

  const feedbackMutation = useMutation({
    mutationFn: (data: any) => addFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', booking._id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      Toast.show({
        type: 'success',
        text1: 'Thank you!',
        text2: 'Your review has been submitted successfully.',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to submit review',
      });
    },
  });

  const handleReviewSubmit = (rating: number, comment: string, images: string[]) => {
    feedbackMutation.mutate({
      bookingId: booking._id,
      providerId: booking.providerId._id,
      serviceId: booking.serviceId?._id,
      rating,
      comment,
      images,
    });
  };

  const mutation = useMutation({
    mutationFn: (data: any) => updateBooking(booking._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', booking._id] });
      setAlertConfig({
        visible: true,
        title: 'Success',
        message: 'Booking updated successfully',
        type: 'success',
        showCancel: false,
        onConfirm: () => navigation.goBack()
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to update booking',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteBooking(booking._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setAlertConfig({
        visible: true,
        title: 'Deleted',
        message: 'Booking deleted successfully',
        type: 'success',
        showCancel: false,
        onConfirm: () => navigation.goBack()
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to delete booking',
      });
    },
  });

  const handleCall = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleSave = () => {
    mutation.mutate({ status, notes });
  };

  const handleDeletePress = () => {
    setAlertConfig({
      visible: true,
      title: 'Delete Booking',
      message: 'Are you sure you want to delete this booking?',
      type: 'error',
      showCancel: true,
      onConfirm: () => deleteMutation.mutate()
    });
  };

  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerVisible(true);
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'PENDING': return COLORS.warning;
      case 'CONFIRMED': return COLORS.primary;
      case 'COMPLETED': return COLORS.success;
      case 'CANCELLED': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const getStatusOptions = () => {
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      return [];
    }

    if (booking.status === BookingStatus.PENDING) {
      return [BookingStatus.CONFIRMED, BookingStatus.CANCELLED];
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      return [BookingStatus.COMPLETED];
    }

    return [];
  };

  const statusOptions = getStatusOptions();

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
          <Text style={styles.headerTitle}>Booking Details</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
          }
        >
          {/* Service Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Information</Text>
            <View style={styles.infoCard}>
              <Text style={styles.serviceName}>{booking.serviceId?.title || 'Service'}</Text>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.textLight} />
                <Text style={styles.infoText}>{new Date(booking.bookingDate).toLocaleString()}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={18} color={COLORS.textLight} />
                <Text style={styles.infoText}>Rs. {booking.totalPrice}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>{booking.status}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isProvider ? 'Customer' : 'Provider'} Details</Text>
            <View style={styles.infoCard}>
              <View style={styles.userHeader}>
                <View style={styles.avatar}>
                  {(isProvider ? booking.userId?.profileImage : booking.providerId?.profileImage) ? (
                    <Image 
                      source={{ uri: isProvider ? booking.userId.profileImage : booking.providerId.profileImage }} 
                      style={styles.avatarImage} 
                    />
                  ) : (
                    <Ionicons name="person" size={30} color={COLORS.primary} />
                  )}
                </View>

                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {isProvider ? booking.userId?.name : booking.providerId?.name}
                  </Text>
                  <Text style={styles.userSub}>{isProvider ? 'Customer' : 'Provider'}</Text>
                </View>
                <View style={styles.userActions}>
                  {(isProvider ? booking.userId?.phone : booking.providerId?.phone) && (
                    <TouchableOpacity 
                      style={styles.callIconButton}
                      onPress={() => handleCall(isProvider ? booking.userId.phone : booking.providerId.phone)}
                    >
                      <Ionicons name="call" size={18} color={COLORS.white} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={[styles.callIconButton, { backgroundColor: COLORS.primary }]}
                    onPress={() => navigation.navigate('Chat', { bookingId: booking._id })}
                  >
                    <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
              {(isProvider ? booking.userId?.address : booking.providerId?.address) && (
                <>
                  <View style={styles.cardDivider} />
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={18} color={COLORS.textLight} />
                    <Text style={styles.infoText}>
                      {isProvider ? booking.userId.address : booking.providerId.address}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Notes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.infoCard}>
              <Text style={styles.notesText}>{booking.notes || 'No notes added yet.'}</Text>
            </View>
          </View>

          {/* Reference Images Section */}
          {booking.images && booking.images.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reference Images</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
                {booking.images.map((img: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.imageContainer}
                    onPress={() => openImageViewer(index)}
                  >
                    <Image source={{ uri: img }} style={styles.bookingImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Status Update (Provider Only) */}
          {isProvider && statusOptions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Update Status</Text>
              <View style={styles.statusOptions}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.statusOption,
                      status === option && { backgroundColor: getStatusColor(option) },
                      status !== option && { borderColor: getStatusColor(option), borderWidth: 1 }
                    ]}
                    onPress={() => setStatus(option)}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      status === option ? { color: COLORS.white } : { color: getStatusColor(option) }
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {isProvider ? (
            statusOptions.length > 0 && (
              <TouchableOpacity
                style={[styles.saveButton, mutation.isPending && styles.disabledButton]}
                onPress={handleSave}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Updates</Text>
                )}
              </TouchableOpacity>
            )
          ) : (

            booking.status === 'PENDING' && (
              <TouchableOpacity
                style={[styles.deleteButton, deleteMutation.isPending && styles.disabledButton]}
                onPress={handleDeletePress}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete Booking</Text>
                )}
              </TouchableOpacity>
            )
          )}

          {/* Review Section (Customer only) */}
          {!isProvider && booking.status === 'COMPLETED' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Review</Text>
              <View style={styles.infoCard}>
                {booking.isReviewed ? (
                  <View style={styles.reviewedContainer}>
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                    <Text style={styles.reviewedText}>You have already reviewed this service.</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => setReviewModalVisible(true)}
                  >
                    <Ionicons name="star-outline" size={20} color={COLORS.white} />
                    <Text style={styles.reviewButtonText}>Leave a Review</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </ScrollView>

      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => {
          setAlertConfig({ ...alertConfig, visible: false });
          alertConfig.onConfirm?.();
        }}
        onCancel={alertConfig.showCancel ? () => setAlertConfig({ ...alertConfig, visible: false }) : undefined}
      />

      <ReviewModal
        visible={reviewModalVisible}
        serviceName={booking.serviceId?.title || 'Custom Service'}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleReviewSubmit}
        isLoading={feedbackMutation.isPending}
      />

      <Modal
        visible={imageViewerVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <SafeAreaView style={styles.viewerContainer}>
          <View style={styles.viewerHeader}>
            <TouchableOpacity
              onPress={() => setImageViewerVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={30} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.viewerTitle}>
              {selectedImageIndex + 1} / {booking.images?.length}
            </Text>
            <View style={{ width: 30 }} />
          </View>

          <FlatList
            data={booking.images}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedImageIndex}
            getItemLayout={(_: any, index: number) => ({
              length: Dimensions.get('window').width,
              offset: Dimensions.get('window').width * index,
              index,
            })}
            onMomentumScrollEnd={(e: any) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width);
              setSelectedImageIndex(index);
            }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }: { item: string }) => (
              <View style={styles.fullImageContainer}>
                <Image
                  source={{ uri: item }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              </View>
            )}
            keyExtractor={(_: any, index: number) => index.toString()}
          />

        </SafeAreaView>
      </Modal>
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
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },

  userDetails: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  userSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
  },
  userActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  callIconButton: {

    backgroundColor: '#4CAF50',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...TYPOGRAPHY.body,
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notesText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statusOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 100,
    alignItems: 'center',
  },
  statusOptionText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  disabledButton: {
    backgroundColor: COLORS.textLight,
  },
  saveButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  deleteButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
  },
  imageList: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: SPACING.md,
  },
  bookingImage: {
    width: 150,
    height: 150,
    borderRadius: BORDER_RADIUS.md,
  },
  reviewButton: {
    backgroundColor: COLORS.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  reviewButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
  },
  reviewedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  reviewedText: {
    ...TYPOGRAPHY.body,
    color: COLORS.success,
    fontWeight: '600',
  },
  viewerContainer: {

    flex: 1,
    backgroundColor: COLORS.black,
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 10,
  },
  closeButton: {
    padding: 5,
  },
  viewerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
  },
  fullImageContainer: {
    width: Dimensions.get('window').width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  chatContainer: {
    marginVertical: SPACING.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
  },
  myMessageText: {
    color: COLORS.white,
  },
  theirMessageText: {
    color: COLORS.text,
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.4)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  emptyChatText: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginVertical: SPACING.md,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    maxHeight: 100,
    ...TYPOGRAPHY.body,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: COLORS.textLight,
  },
});



export default BookingDetailsScreen;
