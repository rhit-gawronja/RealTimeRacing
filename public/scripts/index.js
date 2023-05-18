// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { signInWithEmailAndPassword } from "firebase/auth";
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
  measurementId: "G-DNHWYZ96DS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const x = document.getElementById("demo");
const startButton = document.getElementById("raceStart");
const watchID = navigator.geolocation.watchPosition((position) => {
  updateFirebase(position.coords.latitude, position.coords.longitude);
});
function updateFirebase(lat, lon) {}
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  x.innerHTML =
    "Latitude: " +
    position.coords.latitude +
    "<br>Longitude: " +
    position.coords.longitude;
}
pos0 = {
  long: 0,
  lat: 0,
};
function getSpeed(position) {
  longitude0 = position.coords.longitude;
  latitude0 = position.coords.latitude;
  // postition updater
  setInterval(() => {
    pos2 = navigator.getCurrentPosition();
    longitude1 = pos2.coords.longitude;
    latitude1 = pos2.coords.latitude;
    speed =
      sqrt((longitude1 - longitude0) ** 2 + (latitude1 - latitude0) ** 2) /
      1000;
    x.innerHTML = "<br>Speed: " + speed.toString();
    pos1 = pos2;
  }, 1000);
}

document.querySelector("#submitlogin").onclick = () => {
  let email = document.querySelector("#email").value;
  let password = document.querySelector("#password").value;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User logged in:", user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Login error:", errorCode, errorMessage);
    });
};
