// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyB-wNAvNipBAcf6RehRuyLGsgE1ajVNdss",
    authDomain: "shadow-a-scientist.firebaseapp.com",
    projectId: "shadow-a-scientist",
    storageBucket: "shadow-a-scientist.appspot.com",
    messagingSenderId: "323474486768",
    appId: "1:323474486768:web:ff1125708832539c88d935",
    measurementId: "G-JNW44K0YN3"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); 

export { db, addDoc, collection, auth, app, storage };
