
// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmv3HQkT0PFg_66im4vSbna4oQu29dTkc",
  authDomain: "earnovalogin.firebaseapp.com",
  projectId: "earnovalogin",
  storageBucket: "earnovalogin.firebasestorage.app",
  messagingSenderId: "488267724180",
  appId: "1:488267724180:web:b2a3376a94735bca6e8b81",
  measurementId: "G-G550NREEB5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
