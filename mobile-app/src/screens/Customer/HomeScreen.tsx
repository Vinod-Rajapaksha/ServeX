import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllServices, getCategories } from '../../services/service';
import { getMyBookings } from '../../services/booking';
import { addFeedback } from '../../services/feedback';
import { getAnnouncementsByRole } from '../../services/announcement';
import ReviewModal from '../../components/ReviewModal';
import AnnouncementSlider from '../../components/AnnouncementSlider';
import Toast from 'react-native-toast-message';

const HomeScreen = ({ navigation }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [pendingReviewBooking, setPendingReviewBooking] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('CategoryServices', {
        categoryName: `Search: ${searchQuery}`,
        searchInitial: searchQuery.trim()
      });
    }
  };

  const { data: announcements, refetch: refetchAnnouncements } = useQuery({
    queryKey: ['announcements', 'CUSTOMER'],
    queryFn: () => getAnnouncementsByRole('CUSTOMER'),
  });

  const { data: categories, isLoading: categoriesLoading, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: services, isLoading: servicesLoading, refetch: refetchServices } = useQuery({
    queryKey: ['featuredServices'],
    queryFn: () => getAllServices({ limit: 5, sort: '-rating' }),
  });

  const { data: bookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: getMyBookings,
    enabled: user?.role === 'CUSTOMER' || user?.role === 'USER',
    refetchInterval: 5000,
  });

  React.useEffect(() => {
    if (bookings) {
      const unreviewedBooking = bookings.find(
        (b: any) => b.status === 'COMPLETED' && !b.isReviewed
      );
      if (unreviewedBooking) {
        setPendingReviewBooking(unreviewedBooking);
        setReviewModalVisible(true);
      }
    }
  }, [bookings]);

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

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCategories(), refetchServices(), refetchAnnouncements()]);
    setRefreshing(false);
  }, [refetchCategories, refetchServices, refetchAnnouncements]);

  const isLoading = categoriesLoading || servicesLoading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello, {user?.name || 'Guest'}!</Text>
          <Text style={TYPOGRAPHY.h2}>Find your service</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.primary} />
            <TextInput
              placeholder="Search services..."
              style={styles.searchInput}
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={handleSearch}>
            <Ionicons name="search-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {announcements && announcements.length > 0 && (
          <AnnouncementSlider data={announcements} />
        )}

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AllCategories')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
                {categories?.map((cat: any) => (
                  <TouchableOpacity
                    key={cat._id}
                    style={styles.categoryCard}
                    onPress={() => navigation.navigate('CategoryServices', { categoryId: cat._id, categoryName: cat.name })}
                  >
                    <View style={styles.categoryIconContainer}>
                      {cat.iconImage ? (
                        <Image source={{ uri: cat.iconImage }} style={styles.categoryImage} />
                      ) : (
                        <Ionicons name={(cat.iconName || cat.icon || 'grid-outline') as any} size={28} color={COLORS.primary} />
                      )}
                    </View>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Services</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CategoryServices', { categoryName: 'All Services' })}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
                {services?.map((service: any) => (
                  <TouchableOpacity
                    key={service._id}
                    style={styles.serviceCard}
                    onPress={() => navigation.navigate('ServiceDetails', { serviceId: service._id })}
                  >
                    {service.images && service.images.length > 0 ? (
                      <Image source={{ uri: service.images[0] }} style={styles.serviceImage} />
                    ) : (
                      <View style={styles.serviceImagePlaceholder}>
                        <Ionicons name="image-outline" size={40} color={COLORS.border} />
                      </View>
                    )}
                    <View style={styles.serviceInfo}>
                      <View style={styles.serviceHeaderRow}>
                        <Text style={styles.serviceTitle} numberOfLines={1}>{service.title}</Text>
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={12} color="#FFC107" />
                          <Text style={styles.ratingText}>{service.rating ? Number(service.rating).toFixed(1) : 'New'}</Text>
                        </View>
                      </View>
                      <Text style={styles.providerName} numberOfLines={1}>{service.providerId?.name || 'Professional Provider'}</Text>
                      <Text style={styles.priceText}>
                        Rs. {service.price} <Text style={styles.priceUnit}>/ {service.priceUnit || 'Hour'}</Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  welcomeText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    height: 54,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.text,
  },
  clearBtn: {
    padding: 4,
  },
  filterBtn: {
    width: 54,
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  seeAll: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  categoryList: {
    paddingLeft: SPACING.lg,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  categoryName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
  },
  featuredList: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.md,
  },
  serviceCard: {
    backgroundColor: COLORS.white,
    width: 260,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceImagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceImage: {
    width: '100%',
    height: 160,
  },
  serviceInfo: {
    padding: SPACING.md,
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  serviceTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    flex: 1,
    marginRight: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    marginLeft: 4,
    color: '#D4A017',
  },
  providerName: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  priceText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  priceUnit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
  },
  centered: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
});

export default HomeScreen;
