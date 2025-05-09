import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserContext } from '../utils/UserContext';
import { useNavigation } from '@react-navigation/native';

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

const StartChatScreen = () => {
  const { uid, firstName, lastName, avatar, role } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const oppositeRole = role === 'senior' ? 'junior' : 'senior';
        const q = query(collection(db, 'users'), where('role', '==', oppositeRole));
        const querySnapshot = await getDocs(q);
        const fetchedUsers = [];
        querySnapshot.forEach(doc => {
          if (doc.id !== uid) {
            fetchedUsers.push({ id: doc.id, ...doc.data() });
          }
        });
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const startChat = async (otherUser) => {
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('users', 'array-contains', uid)
      );
      const existingChats = await getDocs(q);

      for (let docSnap of existingChats.docs) {
        const data = docSnap.data();
        if (data.users.includes(otherUser.id)) {
          navigation.navigate('ChatScreen', { 
            chatId: docSnap.id,
            receiverName: otherUser.firstName + ' ' + otherUser.lastName,
            receiverAvatar: otherUser.avatar || null, 
          });
          return;
        }
      }

      const chatDoc = {
        users: [uid, otherUser.id],
        userInfo: {
            [uid]: {
            firstName: firstName,
            lastName: lastName,
            avatar: avatar || null,
            },
            [otherUser.id]: {
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            avatar: otherUser.avatar || null,
            },
        },
        createdAt: new Date(),
    };


      const docRef = await addDoc(chatsRef, chatDoc);
      navigation.navigate('ChatScreen', { 
        chatId: docRef.id,
        receiverName: otherUser.firstName + ' ' + otherUser.lastName,
        receiverAvatar: otherUser.avatar || null,
      });

    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e17d27" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Start a Chat</Text>
      {users.length === 0 ? (
        <Text style={styles.noUsers}>No users available to chat with.</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const fullName = `${item.firstName} ${item.lastName}`;
            const avatarSource = avatarOptions[item.avatar] || null;

            return (
              <TouchableOpacity style={styles.userItem} onPress={() => startChat(item)}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {avatarSource && (
                    <Image source={avatarSource} style={styles.avatar} />
                  )}
                  <View>
                    <Text style={styles.userName}>{fullName}</Text>
                    <Text style={styles.userRole}>{item.role}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 20,
    color: '#333',
  },
  noUsers: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#777',
    textAlign: 'center',
    marginTop: 40,
  },
  userItem: {
    backgroundColor: '#fff5ea',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e17d27',
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#000',
  },
  userRole: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
});

export default StartChatScreen;
