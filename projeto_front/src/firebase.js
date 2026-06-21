import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDMlxO8A147eRSXIrFGTH6IalkkfCJGId0",
  authDomain: "tcc-playon.firebaseapp.com",
  projectId: "tcc-playon",
  storageBucket: "tcc-playon.firebasestorage.app",
  messagingSenderId: "24486987902",
  appId: "1:24486987902:web:21a8ab67038d1ea1bdb02f",
  measurementId: "G-HFY2FV33PF",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
