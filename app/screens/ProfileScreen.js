import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, Image } from 'react-native';
import { UserContext } from '../utils/UserContext';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome } from '@expo/vector-icons';
import AlertModal from '../components/AlertModal';
import { MotiView, AnimatePresence } from 'moti';

const ProfileScreen = () => {
  const { user, firstName, lastName, role, avatar, bio, username } = useContext(UserContext);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    if (user && user.uid) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const roleBasedCollection = role === 'senior' ? 'seniorsPosts' : 'juniorsPosts';
      const q = query(collection(db, roleBasedCollection), where('authorId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const userPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(userPosts);
    } catch (err) {
      console.error('Error fetching posts: ', err);
    }
  };

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

  const handleLike = async (postId, likedBy = []) => {
    if (!user || !role) return;

    const collectionName = role === 'senior' ? 'seniorsPosts' : 'juniorsPosts';
    const postRef = doc(db, collectionName, postId);
    const hasLiked = likedBy.includes(user.uid);
    const updatedLikes = hasLiked
      ? likedBy.filter((uid) => uid !== user.uid)
      : [...likedBy, user.uid];

    try {
      await updateDoc(postRef, { likedBy: updatedLikes });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likedBy: updatedLikes } : post
        )
      );
    } catch (error) {
      console.error('Error updating likes: ', error);
      Alert.alert('Error', 'Could not update like. Try again.');
    }
  };

  const handleDelete = (postId) => {
    setSelectedPostId(postId);
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const roleBasedCollection = role === 'senior' ? 'seniorsPosts' : 'juniorsPosts';
      await deleteDoc(doc(db, roleBasedCollection, selectedPostId));
      fetchUserPosts();
    } catch (err) {
      console.error('Error deleting post: ', err);
      Alert.alert('Error', 'Something went wrong while deleting.');
    } finally {
      setModalVisible(false);
    }
  };

  const startEditing = (post) => {
    setEditingPostId(post.id);
    setEditedContent(post.content);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditedContent('');
  };

  const saveEditedPost = async (postId) => {
    const collectionName = role === 'senior' ? 'seniorsPosts' : 'juniorsPosts';
    try {
      await updateDoc(doc(db, collectionName, postId), {
        content: editedContent,
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, content: editedContent } : post
        )
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to update post.');
    } finally {
      cancelEditing();
    }
  };

  const renderItem = ({ item }) => {
    const isLiked = item.likedBy?.includes(user?.uid);
    const likeCount = item.likedBy?.length || 0;
    const isEditing = editingPostId === item.id;

    return (
          <LinearGradient
            colors={['#fff5ea', 'transparent']}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.tweetCard}
          >
            <View style={styles.headerRow}>
              <Text style={styles.author}>{firstName} {lastName}</Text>
              <View style={styles.labelsContainer}>
                {item.labels?.map((label, index) => (
                  <View key={index} style={styles.labelBadge}>
                    <Text style={styles.labelText}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
    
            <Text style={styles.date}>
              {item.timestamp?.toDate
                ? item.timestamp.toDate().toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : ''}
            </Text>
    
            <AnimatePresence>
                {isEditing ? (
                    <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 120 }}
                  >              
                    <TextInput
                        value={editedContent}
                        onChangeText={setEditedContent}
                        multiline
                        style={[styles.content, styles.editInput]}
                    />
                    <View style={styles.editActions}>
                        <TouchableOpacity onPress={() => saveEditedPost(item.id)}>
                        <Text style={styles.saveButton}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={cancelEditing}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    </MotiView>
                ) : (
                    <Text style={styles.content}>{item.content}</Text>
                )}
            </AnimatePresence>
    
    
            {(likeCount > 0 || item.commentCount > 0) && (
              <View style={styles.metaRow}>
                {likeCount > 0 && (
                  <Text style={styles.likeCountText}>
                    {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                  </Text>
                )}
                {likeCount > 0 && item.commentCount > 0 && (
                  <Text style={styles.dotSeparator}>•</Text>
                )}
                {item.commentCount > 0 && (
                  <Text style={styles.likeCountText}>
                    {item.commentCount} {item.commentCount === 1 ? 'comment' : 'comments'}
                  </Text>
                )}
              </View>
            )}
    
            <View style={[styles.actions, { flexWrap: 'wrap', justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', gap: 20 }}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLike(item.id, item.likedBy)}
                >
                  {isLiked ? (
                    <FontAwesome name="heart" size={20} color="red" />
                  ) : (
                    <Feather name="heart" size={20} color="#e17d27" />
                  )}
                  <Text style={styles.actionText}>Like</Text>
                </TouchableOpacity>
    
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate('Comments', {
                      postId: item.id,
                      postData: item,
                    })
                  }
                >
                  <Ionicons name="chatbubble-outline" size={20} color="#e17d27" />
                  <Text style={styles.actionText}>Comment</Text>
                </TouchableOpacity>
              </View>
    
              <View style={{ flexDirection: 'row', gap: 20 }}>
                {isEditing ? null : (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => startEditing(item)}
                  >
                    <Ionicons name="pencil" size={20} color="#e17d27" />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                )}
    
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash" size={20} color="#e53935" />
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Profile</Text>
      <View style={styles.profileCard}>
        {avatar && avatarOptions[avatar] ? (
          <Image source={avatarOptions[avatar]} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle" size={50} color="#000" />
        )}
        <View style={styles.profileText}>
          <Text style={styles.name}>{firstName} {lastName}</Text>
          <Text style={styles.username}> {username ? '@' + username : user?.email} </Text>
          {bio ? <Text style={styles.bio}>{bio}</Text> : <Text style={styles.bio}>Add bio</Text>}
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>My posts</Text>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No posts yet</Text>}
      />
      <AlertModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={confirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#fff', 
    paddingTop: 50 
},
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10 
},
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcc80',
  },
  profileText: { 
    marginLeft: 8 
},
  name: { 
    fontSize: 18, 
    fontWeight: 'bold' 
},
  username: { 
    fontSize: 14, 
    color: '#757575' 
},
  postCard: {
    backgroundColor: '#fffaf0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderColor: '#ffe0b2',
    borderWidth: 1,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  tweetCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  author: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  content: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#e17d27',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 4,
  },  
  labelBadge: {
    backgroundColor: '#ffe0b2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 6,
    marginBottom: 4,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d17b15',
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    maxWidth: '60%',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },  
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  dotSeparator: {
    fontSize: 13,
    color: '#e17d27',
    marginHorizontal: 4,
  }, 
  likeCountContainer: {
    marginTop: -4,
    marginBottom: 8,
  },
  likeCountText: {
    fontSize: 13,
    color: '#e17d27',
    fontWeight: '600',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    marginTop: 8,
  },
  saveButton: {
    color: 'green',
    fontWeight: 'bold',
  },
  cancelButton: {
    color: '#e53935',
    fontWeight: 'bold',
  },
  bio: {
    marginTop: 4,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
    marginTop: 4,
    flexWrap: 'wrap',
    maxWidth: '85%',
    flexShrink: 1,
  },  
  editProfileButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#e17d27',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 10,
  marginTop: 20,
  alignSelf: 'flex-start',
  gap: 6,
},
editProfileButtonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 14,
},
avatar: {
  width: 100,
  height: 100,
  borderRadius: 50,
  marginBottom: 55
},
});

export default ProfileScreen;
