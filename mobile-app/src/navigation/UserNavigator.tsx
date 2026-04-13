import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/Customer/HomeScreen';
import BookingsScreen from '../screens/Common/BookingsScreen';
import RequestsScreen from '../screens/Customer/RequestsScreen';
import ProfileScreen from '../screens/Common/ProfileScreen';
import { COLORS } from '../constants/theme';

export type UserTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Requests: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<UserTabParamList>();

const UserNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Requests') iconName = focused ? 'construct' : 'construct-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Requests" component={RequestsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default UserNavigator;
