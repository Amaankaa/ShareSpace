import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserContext } from '../utils/UserContext';

const PostsScreen = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('Loading...');
  const [labelsSelected, setLabelsSelected] = useState(['General']);
  const [posting, setPosting] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;
  const { user: userFromContext, avatar } = useContext(UserContext);

  const labels = ['General', 'Relationship', 'Academics', 'Fitness', 'Finance', 'Tips', 'Others'];
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

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setAuthorName(`${data.firstName} ${data.lastName}`);
        } else {
          setAuthorName('User');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setAuthorName('User');
      }
    };

    fetchUserName();
  }, []);

  const handlePost = async () => {
  if (!content.trim()) {
    Alert.alert('Empty Post', 'Please enter some content before posting.');
    return;
  }

  const role = userFromContext?.role || 'junior'; // fallback to junior
  const collectionName = role === 'senior' ? 'juniorsPosts' : 'seniorsPosts';

  try {
    setPosting(true); // Start loading

    await addDoc(collection(db, collectionName), {
      authorId: user.uid,
      authorName,
      content,
      labels: labelsSelected.length > 0 ? labelsSelected : ['General'],
      timestamp: serverTimestamp(),
    });

    setContent('');
    setLabelsSelected(['General']);
    Alert.alert('Success', 'Your post has been shared!');
    navigation.goBack();
  } catch (error) {
    console.error('Error posting:', error);
    Alert.alert('Error', 'Could not post at this time.');
  } finally {
    setPosting(false); // Always stop loading
  }
};


  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={avatarOptions[avatar]}
          style={styles.avatar}
        />
        <Text style={styles.authorName}>{authorName}</Text>
      </View>

      <Text style={styles.header}>What's on your mind?</Text>
      <TextInput
        style={styles.input}
        placeholder="Write your post here..."
        multiline
        value={content}
        onChangeText={setContent}
      />

      <Text style={styles.labelHeader}>Pick a label for your post:</Text>
      <View style={styles.labelPicker}>
        {labels.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.labelButton,
              labelsSelected.includes(item) && styles.selectedLabel,
            ]}
            onPress={() => {
              if (labelsSelected.includes(item)) {
                setLabelsSelected(labelsSelected.filter(label => label !== item));
              } else {
                setLabelsSelected([...labelsSelected, item]);
              }
            }}
          >
            <Text
              style={[
                styles.labelText,
                labelsSelected.includes(item) && { color: '#fff' },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.postButton,
          (!content.trim() || posting) && styles.disabledPostButton,
        ]}
        onPress={handlePost}
        disabled={!content.trim() || posting}
      >
        {posting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={[
              styles.postText,
              (!content.trim() || posting) && styles.disabledPostText,
            ]}
          >
            Post
          </Text>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
};

export default PostsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5ea',
    padding: 20,
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  authorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e17d27',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#e17d27',
  },
  input: {
    height: 180,
    borderWidth: 1,
    borderColor: '#e17d27',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  labelHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#e17d27',
  },
  labelPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  labelButton: {
    borderWidth: 1,
    borderColor: '#e17d27',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedLabel: {
    backgroundColor: '#e17d27',
  },
  labelText: {
    color: '#e17d27',
    fontSize: 14,
    fontWeight: '500',
  },
  postButton: {
    backgroundColor: '#e17d27',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  postText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledPostButton: {
    backgroundColor: '#f4c29c',
  },
  disabledPostText: {
    color: '#fff',
    opacity: 0.6,
  },
});
