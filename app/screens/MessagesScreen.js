// MessagesScreen.js
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
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

const MessagesScreen = () => {
  const { user } = useContext(UserContext);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const q = query(collection(db, 'chats'), where('users', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getOtherUserId = (chat) => chat.users.find(uid => uid !== user.uid);
  const getOtherUserInfo = (chat) => chat.userInfo[getOtherUserId(chat)];

  const renderItem = ({ item }) => {
  const otherUser = getOtherUserInfo(item);
  const avatarSource = avatarOptions[otherUser?.avatar] || null;
  const isUnread = item.readStatus && item.readStatus[user.uid] === false;

  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatScreen', { 
        chatId: item.id,
        receiverName: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unnamed',
        receiverAvatar: otherUser?.avatar || null,
      })}
    >
      {avatarSource && <Image source={avatarSource} style={styles.avatar} />}
      <View style={styles.chatContent}>
        <Text style={styles.name}>
          {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unnamed'}
        </Text>
        <Text style={styles.preview}>
          {item.lastMessage || 'Tap to Chat'}
        </Text>
      </View>
      {isUnread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
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
      <Text style={styles.header}>Messages</Text>

      {chats.length === 0 ? (
        <Text style={styles.empty}>No conversations yet. Start one!</Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('StartChat')}
      >
        <Text style={styles.startText}>Start New Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 26,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff5ea',
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e17d27',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#000',
  },
  preview: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#777',
    textAlign: 'center',
    marginTop: 40,
  },
  startButton: {
    backgroundColor: '#e17d27',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  startText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  chatContent: {
    flex: 1,
  },
  unreadDot: {
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: 'red',
  marginLeft: 10,
},
});

export default MessagesScreen;
