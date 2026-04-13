import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ProviderDashboardScreen from '../screens/Provider/ProviderDashboardScreen';
import ManageServicesScreen from '../screens/Provider/ManageServicesScreen';
import BookingsScreen from '../screens/Common/BookingsScreen';
import OpenRequestsScreen from '../screens/Provider/OpenRequestsScreen';
import ProfileScreen from '../screens/Common/ProfileScreen';
import { COLORS } from '../constants/theme';

export type ProviderTabParamList = {
  Dashboard: undefined;
  Services: undefined;
  Requests: undefined;
  Bookings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ProviderTabParamList>();

const ProviderNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Dashboard') iconName = focused ? 'speedometer' : 'speedometer-outline';
          else if (route.name === 'Services') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Requests') iconName = focused ? 'construct' : 'construct-outline';
          else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={ProviderDashboardScreen} />
      <Tab.Screen name="Services" component={ManageServicesScreen} />
      <Tab.Screen name="Requests" component={OpenRequestsScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default ProviderNavigator;
