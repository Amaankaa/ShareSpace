import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const FeedbackScreen = () => {
  const [feedback, setFeedback] = useState('');
  const navigation = useNavigation();

  const handleSendFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert('Feedback is empty', 'Please type your feedback before sending.');
      return;
    }

    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      await MailComposer.composeAsync({
        recipients: ['amaanumararaa@gmail.com'],
        subject: 'App Feedback',
        body: feedback,
      });
      Alert.alert('Sent!', 'Thanks for your feedback!');
      setFeedback('');
      navigation.goBack();
    } else {
      Alert.alert('Email is not available on this device.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back-outline" size={24} color="#e17d27" />
      </TouchableOpacity>

      <Text style={styles.title}>Send Feedback</Text>

      <TextInput
        style={styles.input}
        placeholder="Type your feedback here..."
        placeholderTextColor="#aaa"
        multiline
        numberOfLines={6}
        value={feedback}
        onChangeText={setFeedback}
      />

      <TouchableOpacity style={styles.button} onPress={handleSendFeedback}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e17d27',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff5ea',
    borderColor: '#e17d27',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#e17d27',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FeedbackScreen;
