import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getMyBookings } from '../../services/booking';
import { addFeedback } from '../../services/feedback';
import { RootState } from '../../store';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import ReviewModal from '../../components/ReviewModal';
import Toast from 'react-native-toast-message';

const BookingsScreen = ({ navigation }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();
  const [reviewModalVisible, setReviewModalVisible] = React.useState(false);
  const [autoReviewShown, setAutoReviewShown] = React.useState(false);
  const [pendingReviewBooking, setPendingReviewBooking] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const isProvider = user?.role === 'PROVIDER';
  const isFocused = useIsFocused();

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['bookings'],
    queryFn: getMyBookings,
    refetchInterval: 5000,
  });

  const filteredBookings = React.useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((b: any) => {
      if (activeTab === 'ACTIVE') {
        return ['PENDING', 'CONFIRMED'].includes(b.status);
      } else {
        return ['COMPLETED', 'CANCELLED'].includes(b.status);
      }
    });
  }, [bookings, activeTab]);

  React.useEffect(() => {
    if (bookings && !isProvider && !autoReviewShown && isFocused) {
      const unreviewedBooking = bookings.find(
        (b: any) => b.status === 'COMPLETED' && !b.isReviewed
      );
      if (unreviewedBooking) {
        setPendingReviewBooking(unreviewedBooking);
        setReviewModalVisible(true);
        setAutoReviewShown(true);
      }
    }
  }, [bookings, isProvider, autoReviewShown, isFocused]);

  const feedbackMutation = useMutation({
    mutationFn: (data: any) => addFeedback(data),
    onSuccess: () => {
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
    if (!pendingReviewBooking) return;
    feedbackMutation.mutate({
      bookingId: pendingReviewBooking._id,
      providerId: pendingReviewBooking.providerId._id || pendingReviewBooking.providerId,
      serviceId: pendingReviewBooking.serviceId?._id || pendingReviewBooking.serviceId,
      rating,
      comment,
      images,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return COLORS.warning;
      case 'CONFIRMED':
        return COLORS.primary;
      case 'COMPLETED':
        return COLORS.success;
      case 'CANCELLED':
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const renderBookingItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => navigation.navigate('BookingDetails', { booking: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.serviceId?.title || 'Service'}</Text>
          {isProvider ? (
            <Text style={styles.customerName}>Customer: {item.userId?.name || 'Unknown'}</Text>
          ) : (
            <Text style={styles.providerName}>by {item.providerId?.name || 'Provider'}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooter}>
        <View style={styles.infoColumn}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.infoText}>{new Date(item.bookingDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color={COLORS.textLight} />
            <Text style={styles.infoText}>Rs. {item.totalPrice}</Text>
          </View>
        </View>

        {isProvider && item.userId?.phone && (
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall(item.userId.phone)}
          >
            <Ionicons name="call" size={20} color={COLORS.white} />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isProvider ? 'Manage Bookings' : 'My Bookings'}</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ACTIVE' && styles.activeTab]}
          onPress={() => setActiveTab('ACTIVE')}
        >
          <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'COMPLETED' && styles.activeTab]}
          onPress={() => setActiveTab('COMPLETED')}
        >
          <Text style={[styles.tabText, activeTab === 'COMPLETED' && styles.activeTabText]}>Completed</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshing={isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>No bookings found</Text>
              <Text style={styles.emptySubText}>
                {isProvider ? 'Bookings from customers will appear here.' : 'Services you book will appear here.'}
              </Text>
            </View>
          }
        />
      )}

      <ReviewModal
        visible={reviewModalVisible}
        serviceName={pendingReviewBooking?.serviceId?.title || 'Custom Service'}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleReviewSubmit}
        isLoading={feedbackMutation.isPending}
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
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  activeTab: {
    backgroundColor: COLORS.primary + '15',
  },
  tabText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.md,
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  providerName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
  },
  customerName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoColumn: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  callButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    gap: 6,
  },
  callButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  emptySubText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});

export default BookingsScreen;
