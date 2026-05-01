import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import client from '../../services/api/client';
import { getServiceFeedback } from '../../services/feedback';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateFeedback, deleteFeedback } from '../../services/feedback';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ReviewModal from '../../components/ReviewModal';
import Toast from 'react-native-toast-message';
import CustomAlert from '../../components/CustomAlert';

const { width } = Dimensions.get('window');

const ServiceDetailsScreen = ({ route, navigation }: any) => {
  const { serviceId } = route.params;
  const { user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();

  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [viewerImages, setViewerImages] = useState<string[]>([]);

  
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onConfirm: () => void;
    showCancel: boolean;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
    onConfirm: () => { },
    showCancel: false,
  });


  const openImageViewer = (imgs: string[], index: number) => {
    setViewerImages(imgs);
    setSelectedImageIndex(index);
    setImageViewerVisible(true);
  };


  const { data: service, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const response = await client.get(`/services/${serviceId}`);
      return response.data.data;
    },
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['serviceReviews', serviceId],
    queryFn: () => getServiceFeedback(serviceId),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => updateFeedback(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceReviews', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] });
      setReviewModalVisible(false);
      setEditingReview(null);
      Toast.show({ type: 'success', text1: 'Review updated' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to update review' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceReviews', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] });
      Toast.show({ type: 'success', text1: 'Review deleted' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to delete review' }),
  });

  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setReviewModalVisible(true);
  };

  const handleDeleteReview = (id: string) => {
    setAlertConfig({
      visible: true,
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review?',
      type: 'error',
      showCancel: true,
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const handleReviewSubmit = (rating: number, comment: string, images: string[]) => {
    if (editingReview) {
      updateMutation.mutate({
        id: editingReview._id,
        data: { rating, comment, images },
      });
    }
  };

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
        }
      >
        <View style={styles.imageHeader}>
          {service.images && service.images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            >
              {service.images.map((img: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  onPress={() => openImageViewer(service.images, index)}

                >
                  <Image
                    source={{ uri: img }}
                    style={styles.headerImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

          ) : (
            <Ionicons name="image-outline" size={100} color={COLORS.border} />
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          {service.images && service.images.length > 1 && (
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>{service.images.length} Photos</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.mainInfo}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{service.title}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{service.categoryId?.name}</Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>Rs. {service.price}</Text>
              <Text style={styles.priceUnitText}>/ {service.priceUnit || 'Hour'}</Text>
            </View>
          </View>

          <View style={styles.providerRow}>
            <View style={styles.providerAvatar}>
              <Ionicons name="person" size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.providerName}>{service.providerId?.name || 'Provider'}</Text>
              <Text style={styles.providerLabel}>Professional Service Provider</Text>
            </View>
            {/* <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity> */}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this service</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.ratingOverview}>
              <Ionicons name="star" size={24} color={COLORS.warning} />
              <Text style={styles.ratingValue}>{service.rating?.toFixed(1) || 'New'}</Text>
              <Text style={styles.reviewCount}>({service.numReviews || 0} reviews)</Text>
            </View>

            {isLoadingReviews ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.lg }} />
            ) : reviews && reviews.length > 0 ? (
              <View style={styles.reviewsList}>
                {reviews.map((review: any) => (
                  <View key={review._id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Image
                        source={{ uri: review.userId?.profileImage }}
                        style={styles.reviewerAvatar}
                      />
                      <View style={styles.reviewerInfo}>
                        <Text style={styles.reviewerName}>{review.userId?.name}</Text>
                        <Text style={styles.reviewDate}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.reviewRating}>
                        <Ionicons name="star" size={14} color={COLORS.warning} />
                        <Text style={styles.reviewRatingText}>{review.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                    
                    {review.images && review.images.length > 0 && (
                      <View style={styles.reviewImages}>
                        {review.images.map((img: string, i: number) => (
                          <TouchableOpacity key={i} onPress={() => openImageViewer(review.images, i)}>
                            <Image source={{ uri: img }} style={styles.reviewImage} />
                          </TouchableOpacity>

                        ))}
                      </View>
                    )}

                    {user?._id === review.userId?._id && (
                      <View style={styles.reviewActions}>
                        <TouchableOpacity 
                          style={styles.reviewActionBtn}
                          onPress={() => handleEditReview(review)}
                        >
                          <Ionicons name="pencil" size={16} color={COLORS.primary} />
                          <Text style={styles.reviewActionText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.reviewActionBtn}
                          onPress={() => handleDeleteReview(review._id)}
                        >
                          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                          <Text style={[styles.reviewActionText, { color: COLORS.error }]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <ReviewModal
        visible={reviewModalVisible}
        serviceName={service.title}
        initialData={editingReview ? {
          rating: editingReview.rating,
          comment: editingReview.comment,
          images: editingReview.images || [],
        } : undefined}
        onClose={() => {
          setReviewModalVisible(false);
          setEditingReview(null);
        }}
        onSubmit={handleReviewSubmit}
        isLoading={updateMutation.isPending}
      />

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => {
          alertConfig.onConfirm();
          setAlertConfig({ ...alertConfig, visible: false });
        }}
        onCancel={alertConfig.showCancel ? () => setAlertConfig({ ...alertConfig, visible: false }) : undefined}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookingCheckout', { service })}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        onRequestClose={() => setImageViewerVisible(false)}
        animationType="fade"
      >
        <View style={styles.viewerContainer}>
          <TouchableOpacity
            style={styles.closeViewerButton}
            onPress={() => setImageViewerVisible(false)}
          >
            <Ionicons name="close" size={30} color={COLORS.white} />
          </TouchableOpacity>

          <FlatList
            data={viewerImages}
            horizontal

            pagingEnabled
            initialScrollIndex={selectedImageIndex}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.viewerImageWrapper}>
                <Image
                  source={{ uri: item }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageHeader: {
    width: width,
    height: 300,
    backgroundColor: COLORS.border + '40',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerImage: {
    width: width,
    height: 300,
  },
  imageBadge: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  imageBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  content: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    fontSize: 24,
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontSize: 22,
  },
  priceUnitText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
  },

  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  providerName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  providerLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
  },
  contactButton: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    lineHeight: 24,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  reviewCount: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    marginLeft: SPACING.sm,
  },
  reviewsList: {
    marginTop: SPACING.lg,
  },
  reviewCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    ...TYPOGRAPHY.h3,
    fontSize: 14,
    color: COLORS.text,
  },
  reviewDate: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewRatingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.warning,
    marginLeft: 4,
  },
  reviewComment: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  reviewImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.lg,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  reviewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewActionText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  noReviewsText: {

    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: SPACING.lg,
  },
  footer: {

    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  bookButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeViewerButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  viewerImageWrapper: {
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: '100%',
  },
});


export default ServiceDetailsScreen;
