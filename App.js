// App.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';

import OnboardingScreen from './app/screens/Welcome and Login/Onboardingscreen';
import SignupScreen from './app/screens/Welcome and Login/Signupscreen';
import SigninScreen from './app/screens/Welcome and Login/Signinscreen';
import MainTabs from './app/components/MainTabs';
import SettingsScreen from './app/screens/SettingsScreen';
import PostsScreen from './app/screens/PostsScreen';
import CommentsScreen from './app/screens/CommentsScreen';
import EditProfileScreen from './app/screens/EditProfileScreen';
import ViewProfile from './app/screens/ViewProfile';
import FeedbackScreen from './app/screens/FeedbackScreen';
import StartChatScreen from './app/screens/StartChatScreen';
import ChatScreen from './app/screens/ChatScreen';
import NotificationsScreen from './app/screens/NotificationsScreen';

import { auth } from './app/firebaseConfig';
import { UserProvider } from './app/utils/UserContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Poppins-Regular': require('./app/fonts/Poppins-Regular.ttf'),
        'Poppins-Medium': require('./app/fonts/Poppins-Medium.ttf'),
        'Poppins-Bold': require('./app/fonts/Poppins-Bold.ttf'),
        'Poppins-SemiBold': require('./app/fonts/Poppins-SemiBold.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkOnboarding = async () => {
      const value = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(value === 'true');
    };
    checkOnboarding();
  }, []);

  if (!fontsLoaded || !authChecked || hasSeenOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#e17d27" />
      </View>
    );
  }

  if (fontsLoaded) {
  const { Text, TextInput } = require('react-native');

  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.style = { fontFamily: 'Poppins-Regular' };

  TextInput.defaultProps = TextInput.defaultProps || {};
  TextInput.defaultProps.style = { fontFamily: 'Poppins-Regular' };
}

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <>
              {!hasSeenOnboarding && (
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              )}
              <Stack.Screen name="SigninScreen" component={SigninScreen} />
              <Stack.Screen name="SignUpScreen" component={SignupScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="Posts" component={PostsScreen} />
              <Stack.Screen name="Comments" component={CommentsScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="ViewProfile" component={ViewProfile} />
              <Stack.Screen name="Feedback" component={FeedbackScreen} />
              <Stack.Screen name="StartChat" component={StartChatScreen} />
              <Stack.Screen name="ChatScreen" component={ChatScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
