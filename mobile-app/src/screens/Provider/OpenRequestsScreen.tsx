import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getOpenRequests, placeBid } from '../../services/request';

import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const PRICE_UNITS = ['Hour', 'Day', 'Week', 'Month', 'Year'];

const OpenRequestsScreen = () => {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('Hour');
  const [message, setMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['openRequests'],
    queryFn: getOpenRequests,
    refetchInterval: 5000,
  });

  const bidMutation = useMutation({
    mutationFn: ({ id, bidData }: { id: string; bidData: any }) => placeBid(id, bidData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openRequests'] });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Your bid has been placed successfully',
      });
      setModalVisible(false);
      setSelectedRequest(null);
      setPrice('');
      setMessage('');
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to place bid',
      });
    },
  });

  const handleBidPress = (request: any) => {
    setSelectedRequest(request);
    setPrice(request.budget?.toString() || '');
    setPriceUnit(request.priceUnit || 'Hour');
    setModalVisible(true);
  };

  const confirmBid = () => {
    if (!price) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a price' });
      return;
    }
    bidMutation.mutate({
      id: selectedRequest._id,
      bidData: {
        price: parseFloat(price),
        priceUnit,
        message
      }
    });
  };

  const renderRequestItem = ({ item }: { item: any }) => {
    const hasAlreadyBid = item.bids?.some((bid: any) => 
      (typeof bid.providerId === 'string' ? bid.providerId : bid.providerId._id) === user?._id
    );

    return (
      <View style={styles.requestCard}>
        {item.images && item.images.length > 0 && (
          <Image source={{ uri: item.images[0] }} style={styles.requestImage} />
        )}
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>{item.title}</Text>
            {item.budget && (
              <View style={styles.budgetBadge}>
                <Text style={styles.budgetText}>Budget: Rs. {item.budget} / {item.priceUnit || 'Hour'}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.description} numberOfLines={3}>{item.description}</Text>

          <View style={styles.customerInfo}>
            <Image
              source={{ uri: item.userId?.profileImage }}
              style={styles.customerAvatar}
            />
            <View>
              <Text style={styles.customerName}>{item.userId?.name}</Text>
              <Text style={styles.customerLabel}>Customer</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.bidButton, hasAlreadyBid && styles.disabledButton]}
            onPress={() => !hasAlreadyBid && handleBidPress(item)}
            disabled={hasAlreadyBid}
          >
            <Text style={styles.bidButtonText}>
              {hasAlreadyBid ? 'Wait for selection' : 'Place Bid'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Open Custom Requests</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshing={isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>No open requests found</Text>
              <Text style={styles.emptySubText}>Check back later for new opportunities.</Text>
            </View>
          }
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Place Your Bid</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>Enter your proposed price and details</Text>

              <Text style={styles.label}>Proposed Price</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencyPrefix}>Rs.</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.label}>Price Unit</Text>
              <View style={styles.unitSelector}>
                {PRICE_UNITS.map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitChip,
                      priceUnit === unit && styles.activeUnitChip,
                    ]}
                    onPress={() => setPriceUnit(unit)}
                  >
                    <Text style={[
                      styles.unitChipText,
                      priceUnit === unit && styles.activeUnitChipText
                    ]}>
                      Per {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Message to Customer (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="Briefly explain why you are the best fit..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.confirmButton, bidMutation.isPending && styles.disabledButton]}
                onPress={confirmBid}
                disabled={bidMutation.isPending}
              >
                {bidMutation.isPending ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>Submit Bid</Text>
                )}
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
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
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  refreshButton: {
    padding: SPACING.xs,
  },
  listContent: {
    padding: SPACING.md,
  },
  requestCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  requestImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  title: {
    flex: 1,
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  budgetBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  budgetText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  customerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  customerName: {
    ...TYPOGRAPHY.caption,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  customerLabel: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  bidButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  bidButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
    fontSize: 16,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
  },
  label: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
  },
  currencyPrefix: {
    ...TYPOGRAPHY.h3,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  textArea: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    height: 80,
    marginTop: SPACING.xs,
  },
  unitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  unitChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
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
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  confirmButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: COLORS.textLight,
  },
});

export default OpenRequestsScreen;

