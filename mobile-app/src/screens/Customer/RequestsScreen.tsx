import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getMyRequests, deleteRequest } from '../../services/request';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../components/CustomAlert';
import Toast from 'react-native-toast-message';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const RequestsScreen = ({ navigation }: any) => {
  const queryClient = useQueryClient();
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | null>(null);

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['myRequests'],
    queryFn: getMyRequests,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRequests'] });
      Toast.show({
        type: 'success',
        text1: 'Deleted',
        text2: 'Request deleted successfully',
      });
      setAlertVisible(false);
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to delete request',
      });
      setAlertVisible(false);
    },
  });

  const handleDeletePress = (id: string) => {
    setSelectedRequestId(id);
    setAlertVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return COLORS.primary;
      case 'IN_PROGRESS':
        return COLORS.warning;
      case 'RESOLVED':
        return COLORS.success;
      default:
        return COLORS.textLight;
    }
  };

  const renderRequestItem = ({ item }: { item: any }) => (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.serviceName}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

      {item.providerId && (
        <View style={styles.providerInfo}>
          <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.providerText}>Accepted by: {item.providerId.name}</Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          {item.budget && <Text style={styles.budgetText}>Budget: Rs. {item.budget}</Text>}
        </View>
        <View style={styles.footerActions}>
          {item.status === 'OPEN' && (
            <TouchableOpacity 
              style={styles.deleteIconButton} 
              onPress={() => handleDeletePress(item._id)}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => navigation.navigate('RequestDetails', { requestId: item._id })}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Custom Requests</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateRequest')}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
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
              <Ionicons name="construct-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>No requests yet</Text>
              <Text style={styles.emptySubText}>Post a request and providers will find you.</Text>
            </View>
          }
        />
      )}

      <CustomAlert
        visible={alertVisible}
        type="warning"
        title="Delete Request"
        message="Are you sure you want to delete this request? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => selectedRequestId && deleteMutation.mutate(selectedRequestId)}
        onCancel={() => setAlertVisible(false)}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.md,
  },
  requestCard: {
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
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  serviceName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
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
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  providerText: {
    marginLeft: SPACING.xs,
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
  },
  budgetText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  deleteIconButton: {
    padding: SPACING.xs,
  },
  viewButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },

  viewButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
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
});

export default RequestsScreen;
