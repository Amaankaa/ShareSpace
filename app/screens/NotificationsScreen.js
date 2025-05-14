import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);

  const renderItem = ({ item }) => (
  <TouchableOpacity
    style={[
      styles.notificationItem,
      !item.read && styles.unreadNotificationItem, // Highlight if unread
    ]}
    onPress={() => handlePress(item)}
    activeOpacity={0.8}
  >
    <View style={styles.notificationText}>
      <Text style={styles.notificationTitle}>New Post</Text>
      <Text style={styles.notificationBody}>{item.message}</Text>
    </View>
    {!item.read && <View style={styles.redDot} />}
  </TouchableOpacity>
);



  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications yet!</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#fff5ea',
    paddingHorizontal: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e17d27',
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e17d27',
    marginBottom: 6,
  },
  notificationBody: {
    fontSize: 14,
    color: '#333',
  },
  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    marginLeft: 10,
  },
  emptyText: {
    marginTop: 50,
    fontSize: 16,
    textAlign: 'center',
    color: '#999',
  },
  notificationItem: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  padding: 16,
  marginBottom: 12,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#e17d27',
  transitionDuration: '0.3s', // Optional: smooth background transition (works in web, ignored in native)
},
unreadNotificationItem: {
  backgroundColor: '#fff0e0', // Light orange background for unread
},

});
