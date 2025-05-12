import React, { useEffect, useState, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons, Feather, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserContext } from '../utils/UserContext'; // 👈 Adjust path as needed

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(UserContext); // 👈 Access user from context
  const [role, setRole] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);


  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role); // 'junior' or 'senior'
        }
      } catch (error) {
        console.error('Error fetching role:', error);
      }
    };

    fetchUserRole();
    checkUnreadNotifications();
  }, [user]);

  useFocusEffect(
  React.useCallback(() => {
    checkUnreadNotifications();
  }, [])
);

  const checkUnreadNotifications = async () => {
  if (!user) return;
  try {
    const notifCollection = collection(db, 'users', user.uid, 'notifications');
    const notifSnapshot = await getDocs(notifCollection);
    const hasUnread = notifSnapshot.docs.some(
      (doc) => doc.data().read === false
    );
    setHasUnreadNotifications(hasUnread);
  } catch (error) {
    console.error('Error checking notifications:', error);
  }
};

  const fetchPosts = async (userRole) => {
    try {
      const collectionName = userRole === 'senior' ? 'juniorsPosts' : 'seniorsPosts';
      const q = query(collection(db, collectionName), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
  
      const postsWithComments = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const postData = { id: docSnap.id, ...docSnap.data() };
  
          const commentsSnapshot = await getDocs(
            collection(db, collectionName, docSnap.id, 'comments')
          );
  
          return {
            ...postData,
            commentCount: commentsSnapshot.size, // 👈 Add comment count here
          };
        })
      );
  
      setPosts(postsWithComments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts: ', error);
      setLoading(false);
    }
  };  

  useEffect(() => {
    if (role) fetchPosts(role);
  }, [role]);

  const handleLike = async (postId, likedBy = []) => {
    if (!user || !role) return;

    const collectionName = role === 'senior' ? 'juniorsPosts' : 'seniorsPosts';
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

  const formatTimestamp = (timestamp) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    return '';
  };

  const renderItem = ({ item }) => {
    const isLiked = item.likedBy?.includes(user?.uid);
    const likeCount = item.likedBy?.length || 0;

    return (
      <LinearGradient
        colors={['#fff5ea', 'transparent']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.tweetCard}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ViewProfile', {
                userId: item.authorId,
              })
            }
          >
            <Text style={styles.author}>{item.authorName}</Text>
          </TouchableOpacity>
          <View style={styles.labelsContainer}>
            {item.labels?.map((label, index) => (
              <View key={index} style={styles.labelBadge}>
                <Text style={styles.labelText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.date}>{formatTimestamp(item.timestamp)}</Text>
        <Text style={styles.content}>{item.content}</Text>

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

        <View style={styles.actions}>
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

          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="share" size={20} color="#e17d27" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  if (!role) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 100, fontSize: 16 }}>
          Loading your role...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>ShareSpace</Text>
        <View style={styles.topIcons}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Settings')
            }
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Notifications')
            }
            style={{ marginLeft: 16 }}
          >
            {hasUnreadNotifications ? (
                <Ionicons name="notifications" size={24} color="#e17d27" />
              ) : (
                <Ionicons name="notifications-outline" size={24} color="#333" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.feed}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshing={loading}
          onRefresh={() => fetchPosts(role)}
        />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5ea',
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e17d27',
  },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feed: {
    flex: 1,
    paddingHorizontal: 16,
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
  author: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  content: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
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
  likeCountContainer: {
    marginTop: -4,
    marginBottom: 8,
  },
  likeCountText: {
    fontSize: 13,
    color: '#e17d27',
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelBadge: {
    backgroundColor: '#e17d27',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  labelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
});
