// ChatScreen.js
import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserContext } from '../utils/UserContext';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';


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

const ChatScreen = () => {
  const { user } = useContext(UserContext);
  const route = useRoute();
  const { chatId, receiverName, receiverAvatar } = route.params;
  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [text, setText] = useState('');
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
  const chatDocRef = doc(db, 'chats', chatId);

  const unsubscribeChat = onSnapshot(chatDocRef, (docSnap) => {
    const chatData = docSnap.data();
    setChatInfo(chatData);

    if (chatData?.readStatus && chatData.readStatus[user.uid] === false) {
      updateDoc(chatDocRef, {
        [`readStatus.${user.uid}`]: true,
      }).catch((error) => console.error('Error updating readStatus:', error));
    }
  });

  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
    const msgs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMessages(msgs.reverse());
  });

  return () => {
    unsubscribeChat();
    unsubscribeMessages();
  };
}, [chatId]);


  const handleSend = async () => {
  if (!text.trim()) return;

  const receiverId = chatInfo?.users?.find(uid => uid !== user.uid); // find the other user

  try {
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: text.trim(),
      senderId: user.uid,
      senderName: `${user.firstName} ${user.lastName}`,
      senderAvatar: user.avatar || null,
      createdAt: serverTimestamp(),
    });

    const chatRef = doc(db, 'chats', chatId);

    await updateDoc(chatRef, {
      lastMessage: text.trim(),
      lastMessageTimestamp: serverTimestamp(),
      [`readStatus.${receiverId}`]: false, // receiver sees it as unread
      [`readStatus.${user.uid}`]: true,    // sender sees it as read (optional)
    });

    setText('');
  } catch (error) {
    console.error('Error sending message:', error);
  }
};


  const renderItem = ({ item }) => {
    const isMe = item.senderId === user.uid;
    const avatarSource = avatarOptions[item.senderAvatar] || null;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMe && avatarSource && (
          <Image source={avatarSource} style={styles.avatar} />
        )}
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        {isMe && avatarSource && (
          <Image source={avatarSource} style={styles.avatar} />
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#e17d27" />
        </TouchableOpacity>
        {receiverAvatar && (
          <Image
            source={avatarOptions[receiverAvatar]}
            style={styles.headerAvatar}
          />
        )}
        <Text style={styles.headerTitle}>
          {receiverName || 'Chat'}
        </Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        inverted={true}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type your message..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  messages: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 14,
  },
  myBubble: {
    backgroundColor: '#e17d27',
  },
  theirBubble: {
    backgroundColor: '#f2f2f2',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#e17d27',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  backgroundColor: '#fff',
},
backButton: {
  paddingRight: 10,
  paddingVertical: 4,
},
backText: {
  fontSize: 24,
  color: '#e17d27',
},
headerAvatar: {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 10,
},
headerTitle: {
  fontSize: 18,
  fontFamily: 'Poppins-SemiBold',
  color: '#000',
},
});

export default ChatScreen;
