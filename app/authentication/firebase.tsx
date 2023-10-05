// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKg8-Bbyoxuz4aTMCDHBEDfjz01MaexRc",
  authDomain: "trekhaven-dffe3.firebaseapp.com",
  projectId: "trekhaven-dffe3",
  storageBucket: "trekhaven-dffe3.appspot.com",
  messagingSenderId: "105828320732",
  appId: "1:105828320732:web:7ec0a154034213793a7b19",
  measurementId: "G-XR2042PMP8"
};

// Initialize Firebase
const app = getApps.length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

export { app, auth, db }
