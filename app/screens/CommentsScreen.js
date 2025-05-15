import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserContext } from '../utils/UserContext';
import { Ionicons, Feather, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CommentsScreen = ({ route }) => {
  const { postId, postData } = route.params;
  const { user, role, firstName, lastName } = useContext(UserContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const collectionName = role === 'senior' ? 'juniorsPosts' : 'seniorsPosts';
    try {
      const q = query(
        collection(db, collectionName, postId, 'comments'),
        orderBy('timestamp', 'asc')
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(fetched);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
  
    try {
      const fullName = `${firstName} ${lastName}`.trim();
  
      const commentRef = collection(
        db,
        role === 'senior' ? 'juniorsPosts' : 'seniorsPosts',
        postId,
        'comments'
      );
  
      await addDoc(commentRef, {
        userId: user.uid,
        authorName: fullName,
        content: newComment.trim(),
        timestamp: new Date(),
      });
  
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
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

  const likeCount = postData.likedBy?.length || 0;
  const commentCount = comments.length;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <LinearGradient
          colors={['#fff5ea', 'transparent']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.tweetCard}
        >
          <View style={styles.headerRow}>
            <Text style={styles.author}>{postData.authorName}</Text>
            <View style={styles.labelsContainer}>
              {postData.labels?.map((label, index) => (
                <View key={index} style={styles.labelBadge}>
                  <Text style={styles.labelText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.date}>{formatTimestamp(postData.timestamp)}</Text>
          <Text style={styles.content}>{postData.content}</Text>

          {(likeCount > 0 || commentCount > 0) && (
            <View style={styles.likeCountContainer}>
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
            <View style={styles.actionButton}>
              {postData.likedBy?.includes(user?.uid) ? (
                <FontAwesome name="heart" size={20} color="red" />
              ) : (
                <Feather name="heart" size={20} color="#e17d27" />
              )}
              <Text style={styles.actionText}>Like</Text>
            </View>
            <View style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#e17d27" />
              <Text style={styles.actionText}>Comment</Text>
            </View>
            <View style={styles.actionButton}>
              <FontAwesome name="share" size={20} color="#e17d27" />
              <Text style={styles.actionText}>Share</Text>
            </View>
          </View>
        </LinearGradient>

        {comments.length > 0 && (
            <>
                <Text style={styles.sectionTitle}>Comments</Text>
                {comments.map((item) => (
                <View key={item.id} style={styles.commentBox}>
                    <Text style={styles.commentAuthor}>{item.authorName}</Text>
                    <Text>{item.content}</Text>
                </View>
                ))}
            </>
        )}
        
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Write a comment..."
          value={newComment}
          onChangeText={setNewComment}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleAddComment}>
          <Ionicons name="send" size={24} color="#e17d27" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5ea',
    paddingTop: 50
  },
  tweetCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
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
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    maxWidth: '60%',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
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
  likeCountContainer: {
    marginTop: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e17d27',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  commentBox: {
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  commentAuthor: {
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 10,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
});
