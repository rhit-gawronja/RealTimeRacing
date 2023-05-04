// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfSU66fXVMvROCcoHEEGB9TV0ElCp1dbo",
  authDomain: "real-time-racing-d2164.firebaseapp.com",
  projectId: "real-time-racing-d2164",
  storageBucket: "real-time-racing-d2164.appspot.com",
  messagingSenderId: "371648213477",
  appId: "1:371648213477:web:594dc5a501712f16657f0c",
  measurementId: "G-DNHWYZ96DS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
