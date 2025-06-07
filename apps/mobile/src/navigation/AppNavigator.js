import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import SetupProfileScreen from '../screens/setup/SetupProfileScreen';
import SetupLocationScreen from '../screens/setup/SetupLocationScreen';
import SetupInterestsScreen from '../screens/setup/SetupInterestsScreen';

import HomeScreen from '../screens/HomeScreen';
import LikesScreen from '../screens/LikesScreen';
import SwipeScreen from '../screens/SwipeScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const isFocused = state.index === index;
        const isSwipeTab = route.name === 'Swipe';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isSwipeTab) {
          return (
            <View key={route.key} style={styles.swipeButtonContainer}>
              <TouchableOpacity
                onPress={onPress}
                style={[
                  styles.swipeButton,
                  isFocused && styles.swipeButtonActive,
                ]}
              >
                <View style={styles.swipeButtonInner}>
                  <Text style={styles.swipeButtonText}>🔄</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }

        let icon;
        switch (route.name) {
          case 'Home':
            icon = '🏠';
            break;
          case 'Likes':
            icon = '💖';
            break;
          case 'Cart':
            icon = '🛒';
            break;
          case 'Profile':
            icon = '👤';
            break;
          default:
            icon = '•';
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
              {icon}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Likes"
        component={LikesScreen}
        options={{ title: 'Favorites' }}
      />
      <Tab.Screen
        name="Swipe"
        component={SwipeScreen}
        options={{ title: 'Discover' }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Cart' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  const handleAuthComplete = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainApp" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth">
            {() => (
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login">
                  {(props) => (
                    <LoginScreen
                      {...props}
                      onAuthComplete={handleAuthComplete}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen
                  name="SetupProfile"
                  component={SetupProfileScreen}
                />
                <Stack.Screen
                  name="SetupLocation"
                  component={SetupLocationScreen}
                />
                <Stack.Screen name="SetupInterests">
                  {(props) => (
                    <SetupInterestsScreen
                      {...props}
                      onSetupComplete={handleAuthComplete}
                    />
                  )}
                </Stack.Screen>
              </Stack.Navigator>
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  tabIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
    color: COLORS.primary,
  },
  swipeButtonContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  swipeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  swipeButtonActive: {
    backgroundColor: COLORS.orange[600],
  },
  swipeButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeButtonText: {
    fontSize: 28,
    color: COLORS.background,
  },
});
