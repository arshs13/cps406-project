// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBtS85Hb2pdrUzDsPDyEUon77GGYuZdKMY",
    authDomain: "cypress-f8776.firebaseapp.com",
    projectId: "cypress-f8776",
    storageBucket: "cypress-f8776.firebasestorage.app",
    messagingSenderId: "215921012591",
    appId: "1:215921012591:web:7523e1cb7ef1cb1124c29a",
    measurementId: "G-0FZ380TMQK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
// const analytics = getAnalytics(app);