import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAd7ff3KGVjIfIYwDKYTgMg9_twIrS0z9M",
  authDomain: "ds-pool-league.firebaseapp.com",
  projectId: "ds-pool-league",
  storageBucket: "ds-pool-league.firebasestorage.app",
  messagingSenderId: "867170576531",
  appId: "1:867170576531:web:9fff8eb5d6abfdf2d3c566",
  measurementId: "G-4XHHJ01GZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
