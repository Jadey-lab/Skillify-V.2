// firebaseconfig.js
import { initializeApp } from "firebase/app";

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

export default app;
