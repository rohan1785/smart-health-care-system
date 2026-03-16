// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3ei6PchbpDRkF4mQ3L6m-O1vNwf7SZFo",
  authDomain: "smart-health-system-e3411.firebaseapp.com",
  projectId: "smart-health-system-e3411",
  storageBucket: "smart-health-system-e3411.firebasestorage.app",
  messagingSenderId: "405646575043",
  appId: "1:405646575043:web:6ee5034511361ff950a976",
  measurementId: "G-K3QJM6KNLB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth and Firestore
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();