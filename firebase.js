const firebaseConfig = {
  apiKey: "AIzaSyCI5kAkcvXz86r5otl0F4ienyN-R8UTMdo",
  authDomain: "battery-impact.firebaseapp.com",
  projectId: "battery-impact",
  storageBucket: "battery-impact.appspot.com",
  messagingSenderId: "878622005147",
  appId: "1:878622005147:web:c0e9b37b43c7972135333e",
  measurementId: "G-7SEQ1417HJ"
};

// Initialize Firebase using compat syntax
firebase.initializeApp(firebaseConfig);

// Services
window.auth = firebase.auth();
window.db = firebase.firestore();