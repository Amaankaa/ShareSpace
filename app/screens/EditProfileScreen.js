import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../utils/UserContext';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const avatarOptions = {
  "image 1.png": require('../assets/avatars/image 1.png'),
  "image 2.png": require('../assets/avatars/image 2.png'),
  "image 3.png": require('../assets/avatars/image 3.png'),
  "image 4.png": require('../assets/avatars/image 4.png'),
  "image 5.png": require('../assets/avatars/image 5.png'),
  "image 6.png": require('../assets/avatars/image 6.png'),
  "image 7.png": require('../assets/avatars/image 7.png'),
  "image 8.png": require('../assets/avatars/image 8.png'),
};

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, firstName, lastName, bio, username, avatar, refreshUserProfile } = useContext(UserContext);

  const [newFirstName, setNewFirstName] = useState(firstName || '');
  const [newLastName, setNewLastName] = useState(lastName || '');
  const [newUsername, setNewUsername] = useState(username || '');
  const [newBio, setNewBio] = useState(bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(avatar || null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
  try {
    setIsSaving(true); // start loading
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      firstName: newFirstName,
      lastName: newLastName,
      username: newUsername,
      bio: newBio,
      avatar: selectedAvatar,
    });

    await refreshUserProfile();
    navigation.goBack();
  } catch (err) {
    console.error('Failed to update profile:', err);
  } finally {
    setIsSaving(false); // stop loading either way
  }
};


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#e17d27" />
      </TouchableOpacity>

      <LinearGradient
       colors={['#ffd1a3', 'transparent']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.card}
      >
          <Text style={styles.header}>Edit Profile</Text>
      </LinearGradient>

      <LinearGradient
       colors={['#ffd1a3', 'transparent']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.card}
      >

        <TouchableOpacity style={styles.avatarContainer} onPress={() => setModalVisible(true)}>
          {selectedAvatar ? (
            <Image source={avatarOptions[selectedAvatar]} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={40} color="#000" />
          )}
          <Text style={styles.avatarLabel}>Choose your avatar</Text>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            value={newFirstName + ' ' + newLastName}
            onChangeText={text => {
              const [first, ...last] = text.split(' ');
              setNewFirstName(first);
              setNewLastName(last.join(' '));
            }}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>User name</Text>
          <TextInput
            style={styles.input}
            value={newUsername}
            onChangeText={setNewUsername}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={newBio}
            onChangeText={setNewBio}
            multiline
          />
        </View>

        {isSaving ? (
          <View style={styles.saveButton}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        ) : (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Modal for avatar selection */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pick an Avatar</Text>
            <FlatList
              data={Object.entries(avatarOptions)}
              keyExtractor={([name]) => name}
              numColumns={2}
              renderItem={({ item: [name, image] }) => (
                <TouchableOpacity onPress={() => {
                  setSelectedAvatar(name);
                  setModalVisible(false);
                }}>
                  <Image source={image} style={styles.modalAvatar} />
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffaf5',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  headerWrapper: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e17d27',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#fff6ee',
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3a2c1e',
    textAlign: 'center',
  },
  card: {
  borderRadius: 20,
  padding: 20,
  shadowColor: '#e6bfa3',
  shadowOpacity: 0.3,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarLabel: {
    color: '#aaa',
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    marginLeft: 2,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#e17d27',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    margin: 10,
  },
  modalCloseButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#e17d27',
    fontWeight: '600',
  },
});

export default EditProfileScreen;
