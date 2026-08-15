// firebase.js

const firebaseConfig = {
  apiKey: "AIzaSyAHYAFwNWJRQJHo2un3di6FAf6s2sAyUMY",
  authDomain: "chordikey.firebaseapp.com",
  projectId: "chordikey",
  storageBucket: "chordikey.firebasestorage.app",
  messagingSenderId: "200443484160",
  appId: "1:200443484160:web:8c0e892f9811caea5620e5",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Declare auth and provider globally so script.js can use them
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
