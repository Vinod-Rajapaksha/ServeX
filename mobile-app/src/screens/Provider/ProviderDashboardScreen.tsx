import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useQuery } from '@tanstack/react-query';
import { getMyBookings } from '../../services/booking';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

import { getAnnouncementsByRole } from '../../services/announcement';
import AnnouncementSlider from '../../components/AnnouncementSlider';

const ProviderDashboardScreen = ({ navigation }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: announcements, refetch: refetchAnnouncements } = useQuery({
    queryKey: ['announcements', 'PROVIDER'],
    queryFn: () => getAnnouncementsByRole('PROVIDER'),
  });

  const { data: bookings, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['providerBookings'],
    queryFn: getMyBookings,
  });

  const onRefresh = async () => {
    await Promise.all([refetch(), refetchAnnouncements()]);
  };


  const totalEarnings = bookings?.reduce((acc: number, b: any) => 
    b.status === 'COMPLETED' ? acc + (b.totalPrice || 0) : acc, 0) || 0;

  const stats = [
    { label: 'Total Earnings', value: `Rs. ${totalEarnings}`, icon: 'cash-outline', color: COLORS.success },
    { label: 'Pending Jobs', value: bookings?.filter((b: any) => b.status === 'PENDING').length || 0, icon: 'time-outline', color: COLORS.warning },
    { label: 'Completed', value: bookings?.filter((b: any) => b.status === 'COMPLETED').length || 0, icon: 'checkmark-done-outline', color: COLORS.primary },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.providerName}>{user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {announcements && announcements.length > 0 && (
          <AnnouncementSlider data={announcements} />
        )}


        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Jobs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : bookings?.length === 0 ? (
            <Text style={styles.emptyText}>No upcoming jobs found.</Text>
          ) : (
            bookings?.slice(0, 3).map((booking: any) => (
              <View key={booking._id} style={styles.jobCard}>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{booking.serviceId?.title}</Text>
                  <Text style={styles.clientName}>Client: {booking.userId?.name}</Text>
                  <Text style={styles.jobDate}>
                    {new Date(booking.bookingDate).toLocaleDateString()} at {new Date(booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <TouchableOpacity style={styles.detailsButton}>
                  <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity 
          style={styles.manageButton}
          onPress={() => navigation.navigate('ManageServices')}
        >
          <Ionicons name="list-outline" size={24} color={COLORS.white} />
          <Text style={styles.manageButtonText}>Manage My Services</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  greeting: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
  },
  providerName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
  },
  profileButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    width: '30%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  viewAll: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  jobCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  clientName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textLight,
    marginVertical: 2,
  },
  jobDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  detailsButton: {
    padding: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  manageButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
  },
  manageButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
    marginLeft: SPACING.md,
  },
});

export default ProviderDashboardScreen;
