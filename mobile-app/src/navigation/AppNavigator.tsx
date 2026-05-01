import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { getOnboardingStatus } from '../utils/storage';
import { initializeAuth } from '../store/slices/authSlice';
import { COLORS } from '../constants/theme';

import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import ProviderNavigator from './ProviderNavigator';
import AdminNavigator from './AdminNavigator';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import NotificationsScreen from '../screens/Common/NotificationsScreen';
import AllCategoriesScreen from '../screens/Customer/AllCategoriesScreen';
import CategoryServicesScreen from '../screens/Customer/CategoryServicesScreen';
import ServiceDetailsScreen from '../screens/Customer/ServiceDetailsScreen';
import BookingCheckoutScreen from '../screens/Customer/BookingCheckoutScreen';
import ManageServicesScreen from '../screens/Provider/ManageServicesScreen';
import AddServiceScreen from '../screens/Provider/AddServiceScreen';
import EditServiceScreen from '../screens/Provider/EditServiceScreen';
import EditProfileScreen from '../screens/Common/EditProfileScreen';
import AdminAddEditUserScreen from '../screens/Admin/AdminAddEditUserScreen';
import AdminAddEditCategoryScreen from '../screens/Admin/AdminAddEditCategoryScreen';
import AdminAddEditAnnouncementScreen from '../screens/Admin/AdminAddEditAnnouncementScreen';
import RecentActivityScreen from '../screens/Admin/RecentActivityScreen';
import CreateRequestScreen from '../screens/Customer/CreateRequestScreen';
import RequestDetailsScreen from '../screens/Customer/RequestDetailsScreen';
import ChangePasswordScreen from '../screens/Common/ChangePasswordScreen';
import BookingDetailsScreen from '../screens/Common/BookingDetailsScreen';
import ChatScreen from '../screens/Common/ChatScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      const completed = await getOnboardingStatus();
      setIsFirstLaunch(!completed);
      dispatch(initializeAuth());
    };
    init();
  }, [dispatch]);

  if (isFirstLaunch === null || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isFirstLaunch ? (
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen
                {...props}
                onComplete={() => setIsFirstLaunch(false)}
              />
            )}
          </Stack.Screen>
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {user?.role === 'ADMIN' ? (
              <Stack.Screen name="Main" component={AdminNavigator} />
            ) : user?.role === 'PROVIDER' ? (
              <Stack.Screen name="Main" component={ProviderNavigator} />
            ) : (
              <Stack.Screen name="Main" component={UserNavigator} />
            )}
            <Stack.Screen name="AllCategories" component={AllCategoriesScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="CategoryServices" component={CategoryServicesScreen} />
            <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
            <Stack.Screen name="BookingCheckout" component={BookingCheckoutScreen} />
            <Stack.Screen name="ManageServices" component={ManageServicesScreen} />
            <Stack.Screen name="AddService" component={AddServiceScreen} />
            <Stack.Screen name="EditService" component={EditServiceScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="AdminAddEditUser" component={AdminAddEditUserScreen} />
            <Stack.Screen name="AdminAddEditCategory" component={AdminAddEditCategoryScreen} />
            <Stack.Screen name="AdminAddEditAnnouncement" component={AdminAddEditAnnouncementScreen} />
            <Stack.Screen name="RecentActivity" component={RecentActivityScreen} />
            <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
            <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

            <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
