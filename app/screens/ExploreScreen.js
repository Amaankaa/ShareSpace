import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserContext } from '../utils/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native'; // for navigation

const ExploreScreen = () => {
  const { role } = useContext(UserContext);
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, [role]);

  useEffect(() => {
    handleSearchAndFilter();
  }, [searchQuery, selectedLabels, posts]);

  const fetchPosts = async () => {
    if (!role) return;
    const collectionName = role === 'senior' ? 'juniorsPosts' : 'seniorsPosts';

    try {
      const q = query(collection(db, collectionName), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(fetched);
      extractLabels(fetched);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const extractLabels = (allPosts) => {
    const labelsSet = new Set();
    allPosts.forEach(post => {
      post.labels?.forEach(label => labelsSet.add(label));
    });
    setAvailableLabels(Array.from(labelsSet));
  };

  const handleSearchAndFilter = () => {
    const query = searchQuery.toLowerCase();
    const filtered = posts.filter(post => {
      const matchesSearch =
        post.authorName?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query);
      const matchesLabels = selectedLabels.length === 0
        ? true
        : selectedLabels.every(lbl => post.labels?.includes(lbl));
      return matchesSearch && matchesLabels;
    });
    setFilteredPosts(filtered);
  };

  const toggleLabel = (label) => {
    setSelectedLabels(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('Comments', {
          postId: item.id,
          postData: item,
        })
      }
    >
      <LinearGradient
        colors={['#fff5ea', 'transparent']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.postCard}
      >
        <Text style={styles.author}>{item.authorName}</Text>
        <Text style={styles.content}>{item.content}</Text>
        <View style={styles.labelsRow}>
          {item.labels?.map((label, idx) => (
            <View key={idx} style={styles.labelBadge}>
              <Text style={styles.labelText}>{label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
        <View style={styles.topBar}>
            <Text style={styles.title}>ShareSpace</Text>
        </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search posts..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setSelectedLabels([])}
          style={[
            styles.filterButton,
            selectedLabels.length === 0 && styles.activeFilter,
          ]}
        >
          <Text style={[styles.filterText, selectedLabels.length === 0 && styles.activeText]}>
            All
          </Text>
        </TouchableOpacity>

        {availableLabels.map((label) => {
          const isActive = selectedLabels.includes(label);
          return (
            <TouchableOpacity
              key={label}
              onPress={() => toggleLabel(label)}
              style={[styles.filterButton, isActive && styles.activeFilter]}
            >
              <Text style={[styles.filterText, isActive && styles.activeText]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff5ea',
    paddingHorizontal: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderColor: '#e17d27',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeFilter: {
    backgroundColor: '#e17d27',
  },
  filterText: {
    color: '#e17d27',
    fontWeight: '600',
  },
  activeText: {
    color: '#fff',
  },
  postCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  author: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
  content: {
    fontSize: 14,
    color: '#444',
  },
  labelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  labelBadge: {
    backgroundColor: '#e17d27',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  labelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e17d27',
  },
});
