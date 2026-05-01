import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyRequests, acceptBid, deleteRequest } from '../../services/request';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import CustomAlert from '../../components/CustomAlert';

const RequestDetailsScreen = ({ route, navigation }: any) => {
  const { requestId } = route.params;
  const queryClient = useQueryClient();
  const [deleteAlertVisible, setDeleteAlertVisible] = React.useState(false);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['myRequests'],
    queryFn: getMyRequests,
    refetchInterval: 5000,
  });

  const request = requests?.find((r: any) => r._id === requestId);

  const deleteMutation = useMutation({
    mutationFn: () => deleteRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRequests'] });
      Toast.show({
        type: 'success',
        text1: 'Deleted',
        text2: 'Request deleted successfully',
      });
      setDeleteAlertVisible(false);
      navigation.goBack();
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to delete request',
      });
      setDeleteAlertVisible(false);
    },
  });

  const handleDelete = () => {
    setDeleteAlertVisible(true);
  };

  const acceptBidMutation = useMutation({
    mutationFn: (bidId: string) => acceptBid(requestId, bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRequests'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Provider selected and booking created!',
      });
      navigation.navigate('Main', { screen: 'Bookings' });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to accept bid',
      });
    },
  });

  if (isLoading || !request) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderBidItem = ({ item }: { item: any }) => (
    <View style={[styles.bidCard, item.status === 'ACCEPTED' && styles.acceptedBidCard]}>
      <View style={styles.bidHeader}>
        <Image
          source={{ uri: item.providerId?.profileImage || 'https://via.placeholder.com/150' }}
          style={styles.providerAvatar}
        />
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{item.providerId?.name}</Text>
          <Text style={styles.providerLabel}>Professional Provider</Text>
        </View>
        <View style={styles.priceInfo}>
          <Text style={styles.bidPrice}>Rs. {item.price}</Text>
          <Text style={styles.bidUnit}>/ {item.priceUnit}</Text>
        </View>
      </View>

      {item.message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>"{item.message}"</Text>
        </View>
      )}

      {request.status === 'OPEN' && item.status === 'PENDING' && (
        <TouchableOpacity
          style={styles.acceptBidButton}
          onPress={() => acceptBidMutation.mutate(item._id)}
          disabled={acceptBidMutation.isPending}
        >
          {acceptBidMutation.isPending ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.acceptBidButtonText}>Choose Provider</Text>
          )}
        </TouchableOpacity>
      )}

      {item.status === 'ACCEPTED' && (
        <View style={styles.acceptedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.acceptedText}>Chosen Provider</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        {request?.status === 'OPEN' && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Request Overview */}
        <View style={styles.section}>
          <View style={styles.requestHeader}>
            <Text style={styles.requestTitle}>{request.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: request.status === 'OPEN' ? COLORS.primary + '20' : COLORS.success + '20' }]}>
              <Text style={[styles.statusText, { color: request.status === 'OPEN' ? COLORS.primary : COLORS.success }]}>{request.status}</Text>
            </View>
          </View>

          <Text style={styles.requestDescription}>{request.description}</Text>

          {request.budget && (
            <View style={styles.budgetItem}>
              <Ionicons name="cash-outline" size={20} color={COLORS.primary} />
              <Text style={styles.budgetLabel}>My Budget: </Text>
              <Text style={styles.budgetAmount}>Rs. {request.budget} / {request.priceUnit || 'Hour'}</Text>
            </View>
          )}
        </View>

        {/* Request Images */}
        {request.images && request.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Request Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {request.images.map((img: string, index: number) => (
                <Image key={index} source={{ uri: img }} style={styles.requestImage} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bids Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Provider Bids</Text>
            <View style={styles.bidCount}>
              <Text style={styles.bidCountText}>{request.bids?.length || 0}</Text>
            </View>
          </View>

          {request.bids && request.bids.length > 0 ? (
            <FlatList
              data={request.bids}
              renderItem={renderBidItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.bidsList}
            />
          ) : (
            <View style={styles.noBidsBox}>
              <Ionicons name="time-outline" size={48} color={COLORS.border} />
              <Text style={styles.noBidsText}>Waiting for bids...</Text>
              <Text style={styles.noBidsSubText}>Providers will offer their prices soon.</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <CustomAlert
        visible={deleteAlertVisible}
        type="warning"
        title="Delete Request"
        message="Are you sure you want to delete this request? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteAlertVisible(false)}
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
    flex: 1,
  },
  deleteButton: {
    padding: SPACING.xs,
  },

  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  requestTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  requestDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  budgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  budgetLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    marginLeft: SPACING.sm,
  },
  budgetAmount: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  imageScroll: {
    flexDirection: 'row',
  },
  requestImage: {
    width: 200,
    height: 150,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  bidCount: {
    backgroundColor: COLORS.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    marginBottom: SPACING.md,
  },
  bidCountText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  bidsList: {
    paddingVertical: SPACING.sm,
  },
  bidCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  acceptedBidCard: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '05',
  },
  bidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  providerLabel: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  bidPrice: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  bidUnit: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  messageBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  messageText: {
    ...TYPOGRAPHY.caption,
    fontStyle: 'italic',
    color: COLORS.text,
  },
  acceptBidButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  acceptBidButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
    fontSize: 14,
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  acceptedText: {
    marginLeft: 4,
    color: COLORS.success,
    fontWeight: 'bold',
    fontSize: 14,
  },
  noBidsBox: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
  },
  noBidsText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  noBidsSubText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
  },
});

export default RequestDetailsScreen;
