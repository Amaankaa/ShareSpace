import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { UserContext } from '../utils/UserContext';

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

const ViewProfile = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params;
  const [posts, setPosts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, role } = useContext(UserContext);
  const currentUserId = user.uid; 

  const fetchUserProfile = async () => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const roleBasedCollection = userProfile.role === 'senior' ? 'seniorsPosts' : 'juniorsPosts';
      const q = query(
        collection(db, roleBasedCollection),
        where('authorId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const userPosts = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const postId = docSnap.id;
          const postData = docSnap.data();
          const likedBy = postData.likedBy || [];
          const isLikedByCurrentUser = likedBy.includes(currentUserId);

          const likeCount = likedBy.length;

          // Fetch comments collection count
          const commentsQuery = collection(db, roleBasedCollection, postId, 'comments');
          const commentsSnap = await getDocs(commentsQuery);
          const commentCount = commentsSnap.size;

          return {
            id: postId,
            ...postData,
            likeCount,
            commentCount,
            isLikedByCurrentUser,
          };
        })
      );
      setPosts(userPosts);
    } catch (err) {
      console.error('Error fetching user posts: ', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchUserPosts();
    }
  }, [userProfile]);

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
  const handleLikeToggle = async (postId, role, isLiked) => {
  try {
    const collectionName = role === 'senior' ? 'juniorsPosts' : 'seniorsPosts';
    const postRef = doc(db, collectionName, postId);

    await updateDoc(postRef, {
      likedBy: isLiked
        ? arrayRemove(currentUserId)
        : arrayUnion(currentUserId),
    });

    // Update local state
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLikedByCurrentUser: !isLiked,
              likeCount: post.likeCount + (isLiked ? -1 : 1),
            }
          : post
      )
    );
  } catch (err) {
    console.error('Error updating like:', err);
  }
};

  const renderPostItem = ({ item }) => {
    const likeCount = item.likeCount || 0;
    const commentCount = item.commentCount || 0;

    return (
      <LinearGradient
        colors={['#fff5ea', 'transparent']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.tweetCard}
      >
        <View style={styles.headerRow}>
          <Text style={styles.author}>{userProfile?.firstName} {userProfile?.lastName}</Text>
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

        {(likeCount > 0 || commentCount > 0) && (
          <View style={styles.metaRow}>
            {likeCount > 0 && (
              <Text style={styles.likeCountText}>
                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
              </Text>
            )}
            {likeCount > 0 && commentCount > 0 && (
              <Text style={styles.dotSeparator}>•</Text>
            )}
            {commentCount > 0 && (
              <Text style={styles.likeCountText}>
                {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
              </Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
                handleLikeToggle(item.id, role, item.isLikedByCurrentUser)
            }
            >
            <FontAwesome
                name={item.isLikedByCurrentUser ? 'heart' : 'heart-o'}
                size={20}
                color={item.isLikedByCurrentUser ? 'red' : '#e17d27'}
            />
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('Comments', {
                postId: item.id,
                postRole: userProfile.role,
                postData: item
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#e17d27" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>User Profile</Text>
      <View style={styles.profileCard}>
        {userProfile?.avatar && avatarOptions[userProfile.avatar] ? (
          <Image source={avatarOptions[userProfile.avatar]} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle" size={50} color="#000" />
        )}
        <View style={styles.profileText}>
          <Text style={styles.name}>
            {userProfile?.firstName} {userProfile?.lastName}
          </Text>
          <Text style={styles.username}>
            {userProfile?.username ? '@' + userProfile.username : userProfile?.email}
          </Text>
          {userProfile?.bio ? <Text style={styles.bio}>{userProfile.bio}</Text> : null}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Posts</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPostItem}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No posts yet</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    padding: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 14,
    color: '#777',
  },
  bio: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  tweetCard: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff5ea',
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  author: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  labelBadge: {
    backgroundColor: '#e17d27',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  labelText: {
    color: '#fff',
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  likeCountText: {
    fontSize: 13,
    color: '#e17d27',
    fontWeight: '600',
  },
  dotSeparator: {
    fontSize: 13,
    color: '#e17d27',
    marginHorizontal: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#e17d27',
  },
});


export default ViewProfile;