import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { GoogleAuthProvider, signInWithCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error) {
    return { error: error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error) {
    return { error: error.message };
  }
};

// ✅ Google Sign-In Hook
export const useGoogleSignIn = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '392135825370-e0r4bdj984c3lh5bu37cehslntfvd38b.apps.googleusercontent.com',
    androidClientId: '392135825370-sh95e0usnlt8vhc7kd2evil2guh26iel.apps.googleusercontent.com',
    expoClientId: '392135825370-bfpd6001n8fqn7a8egs32nm32ofqn60u.apps.googleusercontent.com',
  });

  useEffect(() => {
    const authenticate = async () => {
      if (response?.type === 'success') {
        const { id_token } = response.authentication;
        const credential = GoogleAuthProvider.credential(id_token);
        await signInWithCredential(auth, credential);
      }
    };
    authenticate();
  }, [response]);

  return { request, promptAsync };
};
