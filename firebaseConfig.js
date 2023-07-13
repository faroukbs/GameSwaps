import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6SBNB5lGrRMkrnoezUBxx6XJcHPdwpDc",
  authDomain: "gameswaps-cc96c.firebaseapp.com",
  databaseURL: "https://gameswaps-cc96c-default-rtdb.firebaseio.com",
  projectId: "gameswaps-cc96c",
  storageBucket: "gameswaps-cc96c.appspot.com",
  messagingSenderId: "592329901150",
  appId: "1:592329901150:web:8b7aa3e88208f6dd5420cf",
  measurementId: "G-L158BDTR9L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app,  auth, firestore };