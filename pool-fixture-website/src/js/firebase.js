// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);