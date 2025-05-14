import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';
import { signOut, deleteUser } from 'firebase/auth';
import { UserContext } from '../utils/UserContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      //await AsyncStorage.removeItem('hasSeenOnboarding');
      navigation.reset({
        index: 0,
        routes: [{ name: 'SigninScreen' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(auth.currentUser);
      navigation.reset({
        index: 0,
        routes: [{ name: 'SigninScreen' }],
      });
    } catch (error) {
      console.error('Delete account error:', error);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', onPress: handleLogout },
      ],
      { cancelable: true }
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: handleDeleteAccount, style: 'destructive' },
      ],
      { cancelable: true }
    );
  };

  const generalItems = [
    { icon: 'person-outline', label: 'Account'},
    { icon: 'notifications-outline', label: 'Notification' },
    { icon: 'information-circle-outline', label: 'About us' },
    { icon: 'log-out-outline', label: 'Log out', onPress: confirmLogout },
    { icon: 'trash-outline', label: 'Delete Account', onPress: confirmDeleteAccount },
  ];

  const feedbackItems = [
  {
    icon: 'send-outline',
    label: 'Send feedback',
    onPress: () => navigation.navigate('Feedback'),
  },
  {
    icon: 'alert-circle-outline',
    label: 'Report a bug',
    onPress: () => navigation.navigate('Feedback', { type: 'bug' }),
  },
];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.container}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#e17d27" />
        </TouchableOpacity>

        <LinearGradient
          colors={['#fff5ea', 'transparent']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.header}
        >
          <Text style={styles.headerText}>Setting</Text>
        </LinearGradient>


        <LinearGradient
          colors={['#fff5ea', 'transparent']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>General</Text>
          {generalItems.map((item, index) => (
            <SettingItem key={index} index={index} {...item} />
          ))}
        </LinearGradient>

        <LinearGradient
          colors={['#fff5ea', 'transparent']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Feedback</Text>
          {feedbackItems.map((item, index) => (
            <SettingItem key={index} index={index} {...item} />
          ))}
        </LinearGradient>
      </MotiView>
    </View>
  );
};

const SettingItem = ({ icon, label, onPress, index }) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 400,
        delay: index * 100,
      }}
    >
      <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
        <View style={styles.iconWrapper}>
          <Ionicons name={icon} size={20} color="#000" />
        </View>
        <Text style={styles.itemText}>{label}</Text>
      </TouchableOpacity>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 20,
  },
  header: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e17d27',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  section: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e17d27',
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    backgroundColor: '#f6b26b',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default SettingsScreen;
