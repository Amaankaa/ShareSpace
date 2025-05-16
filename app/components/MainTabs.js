import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { UserContext } from '../utils/UserContext';

import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';


const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { role, loading } = useContext(UserContext);
  const navigation = useNavigation();

  if (loading || !role) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ed872e" />
      </View>
    );
  }

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Profile') iconName = 'person';
            else if (route.name === 'Explore') iconName = 'compass';
            else if (route.name === 'Messages') iconName = 'chatbubble';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#ed872e',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="Messages" component={MessagesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      {/* Floating Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigation.navigate('Posts')}
        >
          <Ionicons name="add" size={25} color="#fff" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 55,
    alignSelf: 'center',
  },
  fabButton: {
    backgroundColor: '#ed872e',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    left: 150,
  },
});
