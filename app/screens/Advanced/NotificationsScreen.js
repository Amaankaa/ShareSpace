import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, Trash, RefreshCw } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, update, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  databaseURL: 'YOUR_DATABASE_URL',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setLoading(true);
    const notificationsRef = ref(database, 'notifications');
    onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedNotifications = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setNotifications(loadedNotifications.reverse());
      } else {
        setNotifications([]);
      }
      setLoading(false);
    });
  };

  const markAsRead = (id) => update(ref(database, `notifications/${id}`), { read: true });
  const deleteNotification = (id) => remove(ref(database, `notifications/${id}`));

  const renderItem = ({ item }) => (
    <Card style={styles.notificationCard}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>{item.message}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
      <View style={styles.actionButtons}>
        {!item.read && <TouchableOpacity onPress={() => markAsRead(item.id)}><CheckCircle className="w-6 h-6 text-green-500" /></TouchableOpacity>}
        <TouchableOpacity onPress={() => deleteNotification(item.id)}><Trash className="w-6 h-6 text-red-500" /></TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>

      {loading ? <Text style={styles.loadingText}>Loading...</Text> : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No notifications yet</Text>}
        />
      )}

      <Button onPress={fetchNotifications} style={styles.refreshButton}>
        <RefreshCw className="w-5 h-5 mr-2" /> Refresh Notifications
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F0F4FF'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A4D8F',
    marginBottom: 16
  },
  notificationCard: {
    backgroundColor: '#FFF',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  notificationContent: {
    flex: 1
  },
  notificationText: {
    fontSize: 16,
    color: '#333'
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 4
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12
  },
  loadingText: {
    textAlign: 'center',
    color: '#888'
  },
  emptyText: {
    textAlign: 'center',
    color: '#AAA',
    marginTop: 20
  },
  refreshButton: {
    marginTop: 20
  }
});

export default NotificationsScreen;
