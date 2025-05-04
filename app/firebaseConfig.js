// app/firebaseConfig.js
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAYJNqa7R7jMx4li-zPDwV-G9UV-f0A6I4",
    authDomain: "sharespace-dc3ac.firebaseapp.com",
    projectId: "sharespace-dc3ac",
    storageBucket: "sharespace-dc3ac.firebasestorage.app",
    messagingSenderId: "392135825370",
    appId: "1:392135825370:web:5fdc6dead12aa9c7f052e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
