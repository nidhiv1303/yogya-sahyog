import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// ─── Replace these values with your Firebase project config ───
// Firebase Console → Project Settings → Your Apps → Web App → SDK setup
const firebaseConfig = {
  apiKey: "AIzaSyC5mjHoGLN9XJ0UrWW-kmipv18avI2WMlQ",
  authDomain: "yogya-92b89.firebaseapp.com",
  projectId: "yogya-92b89",
  storageBucket: "yogya-92b89.firebasestorage.app",
  messagingSenderId: "207674880219",
  appId: "1:207674880219:web:70c24f6a4464b2d2ac5cfe"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
