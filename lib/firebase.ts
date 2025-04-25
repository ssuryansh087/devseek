import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBchUGLh_JKB2TFJhirovxaTWcrf5ZQncg",
  authDomain: "devseek-c9f2c.firebaseapp.com",
  projectId: "devseek-c9f2c",
  storageBucket: "devseek-c9f2c.firebasestorage.app",
  messagingSenderId: "262924049710",
  appId: "1:262924049710:web:6b4b8318ec9cafca0eeebf",
  measurementId: "G-E4DMJXQHGS",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
