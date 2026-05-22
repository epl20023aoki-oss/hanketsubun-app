import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC2by3xBDYSsoZMIbY2qehUMDT2G9bipwo",
  authDomain: "hanketsubun-app-18d10.firebaseapp.com",
  projectId: "hanketsubun-app-18d10",
  storageBucket: "hanketsubun-app-18d10.firebasestorage.app",
  messagingSenderId: "130369967034",
  appId: "1:130369967034:web:6314e5f808055437cd0383",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);
