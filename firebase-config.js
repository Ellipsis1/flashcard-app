// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD43v1VfixSeEPGmiANS_X7S-gBJ13QOVI",
    authDomain: "flashcard-app-e2c14.firebaseapp.com",
    projectId: "flashcard-app-e2c14",
    storageBucket: "flashcard-app-e2c14.firebasestorage.app",
    messagingSenderId: "430840907886",
    appId: "1:430840907886:web:2274a7c6ae6b07e1637e7f"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();