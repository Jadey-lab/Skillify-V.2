// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ Add this

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-wNAvNipBAcf6RehRuyLGsgE1ajVNdss",
  authDomain: "shadow-a-scientist.firebaseapp.com",
  projectId: "shadow-a-scientist",
  storageBucket: "shadow-a-scientist.appspot.com",
  messagingSenderId: "323474486768",
  appId: "1:323474486768:web:ff1125708832539c88d935",
  measurementId: "G-JNW44K0YN3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth & Firestore
const auth = getAuth(app);
const db = getFirestore(app); // ✅ Initialize Firestore

export { auth, db }; // ✅ Export both
