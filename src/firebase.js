import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBcSH0ponOoBRmoIRuNFFUIh4EV8UInB2w",
  authDomain: "classvault-it1.firebaseapp.com",
  projectId: "classvault-it1",
  storageBucket: "classvault-it1.firebasestorage.app",
  messagingSenderId: "148678942275",
  appId: "1:148678942275:web:2b9478a5ea0eb84641bef6",
  measurementId: "G-5M88NY9P7E"
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);  // Firestore — all profile data
export const storage = getStorage(app);    // Storage — all images/photos
