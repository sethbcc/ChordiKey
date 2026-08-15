<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAHYAFwNWJRQJHo2un3di6FAf6s2sAyUMY",
    authDomain: "chordikey.firebaseapp.com",
    projectId: "chordikey",
    storageBucket: "chordikey.firebasestorage.app",
    messagingSenderId: "200443484160",
    appId: "1:200443484160:web:8c0e892f9811caea5620e5",
    measurementId: "G-B8DKLCTZ9C"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
