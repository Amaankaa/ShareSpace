import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const redirectToHomeByRole = async (user, navigation) => {
  if (!user) return;

  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const role = userDoc.data().role;
    if (role === 'senior') {
      navigation.replace('SeniorHome'); // route name for senior home screen
    } else if (role === 'junior') {
      navigation.replace('JuniorHome'); // route name for junior home screen
    } else {
      console.warn('No matching role found:', role);
    }
  } else {
    console.warn('User document not found.');
  }
};
