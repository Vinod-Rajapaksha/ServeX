import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllServices, deleteService } from '../../services/service';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import CustomAlert from '../../components/CustomAlert';

const ManageServicesScreen = ({ navigation }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);

  const { data: services, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['myServices'],
    queryFn: () => getAllServices({ provider: user?._id }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myServices'] });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Service deleted successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to delete service',
      });
    },
  });

  const handleDeletePress = (id: string) => {
    setDeleteId(id);
    setAlertVisible(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
    setAlertVisible(false);
    setDeleteId(null);
  };

  const renderServiceItem = ({ item }: { item: any }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle}>{item.title}</Text>
        <Text style={styles.serviceCategory}>{item.categoryId?.name || 'General'}</Text>
        <Text style={styles.servicePrice}>Rs. {item.price}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditService', { service: item })}
        >
          <Ionicons name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeletePress(item._id)}
        >
          <Ionicons name="trash-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Services</Text>
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>You haven't added any services yet.</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('AddService')}
              >
                <Text style={styles.createButtonText}>Create Your First Service</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <CustomAlert
        visible={alertVisible}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        type="warning"
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setAlertVisible(false)}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddService')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>
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
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  listContent: {
    padding: SPACING.md,
  },
  serviceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  serviceCategory: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
    marginVertical: 2,
  },
  servicePrice: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    marginTop: 100,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  createButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
  },
});

export default ManageServicesScreen;
