// components/AlertModal.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const AlertModal = ({ visible, onClose, onConfirm, title, message, confirmText = 'Yes', cancelText = 'Cancel' }) => {
  return (
    <Modal isVisible={visible} onBackdropPress={onClose}>
      <LinearGradient colors={['#fff5ea', '#ffe0b2']} style={styles.container}>
        <Ionicons name="alert-circle" size={40} color="#e17d27" style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e17d27',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  cancelText: {
    color: '#888',
    fontWeight: 'bold',
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#e17d27',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AlertModal;