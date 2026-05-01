import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import HomeScreen from '../screens/Customer/HomeScreen';
import ProviderDashboardScreen from '../screens/Provider/ProviderDashboardScreen';
import BookingsScreen from '../screens/Common/BookingsScreen';
import RequestsScreen from '../screens/Customer/RequestsScreen';
import ProfileScreen from '../screens/Common/ProfileScreen';
import { COLORS } from '../constants/theme';

export type MainTabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Bookings: undefined;
  Requests: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isProvider = user?.role === 'PROVIDER';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home' || route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Requests') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      {isProvider ? (
        <Tab.Screen name="Dashboard" component={ProviderDashboardScreen} />
      ) : (
        <Tab.Screen name="Home" component={HomeScreen} />
      )}
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Requests" component={RequestsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
