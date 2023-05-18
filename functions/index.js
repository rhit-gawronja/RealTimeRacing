const functions = require("firebase-functions");
const express = require("express");
const creds = require("./creds.json");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const csrf = require("csurf");
const firebase = require("firebase/app");
const auth = require("firebase/auth");
const firestore = require("firebase/firestore");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret:
      "oidsafjOAIJksmdrOWAIEZvnJV*&932843284jdsnfLJZFusdf324njsdn3j4nk234biy8",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(csrf({ cookie: true }));
const csrfProtection = csrf({ cookie: true });
app.set("view engine", "ejs");
app.use(express.static("public"));

firebase.initializeApp(creds);
const db = firestore.getFirestore();
const statsRef = firestore.collection(db, "stats");
const racesRef = firestore.collection(db, "races");

const verifyUserInRace = async (req, res, next) => {
  if (!req.session.user) {
    res.status(403).send("Unauthorized: No User");
    return;
  }
  const uid = req.session.user.uid;
  let query = firestore.query(racesRef);
  let querySnapshot = await firestore.getDocs(query);
  for (let doc of querySnapshot.docs) {
    let data = doc.data();
    if (data.user1 == uid || data.user2 == uid) {
      next();
      return;
    }
  }
  res.status(403).send("Unauthorized: Not in Race");
};

app.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.get("/", csrfProtection, (req, res) => {
  if (req.session.user) {
    res.render("racePage", {
      user: req.session.user,
      csrfToken: req.csrfToken(),
    });
  } else {
    res.render("login", { error: null, csrfToken: req.csrfToken() });
  }
});

app.put("/login", csrfProtection, (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  auth
    .signInWithEmailAndPassword(auth.getAuth(), email, password)
    .then((userCredential) => {
      req.session.user = userCredential.user;
      res.status(200).json({ message: "Login successful" });
    })
    .catch((error) => {
      console.log(error);
      res.status(401).json({ message: "Invalid email or password" });
    });
});

app.put("/updateLocation", csrfProtection, async (req, res) => {
  let { latitude, longitude } = req.body;

  let userID = req.session.user;
  if (!userID) {
    res.sendStatus(500);
  }
  const query = firestore.query(
    statsRef,
    firestore.where("userid", "==", userID.uid)
  );
  const querySnapshot = await firestore.getDocs(query);

  querySnapshot.forEach((doc) => {
    let loc = new firestore.GeoPoint(latitude, longitude);
    firestore.updateDoc(doc.ref, { location: loc });
    res.status(200).json({ message: "location updated" });
    return;
  });
});

function generateRandomPoint(latitude, longitude, distance) {
  const earthRadius = 3959; // Radius of the Earth in miles

  // Convert latitude and longitude to radians
  const lat1 = toRadians(latitude);
  const lon1 = toRadians(longitude);

  // Convert distance to radians (1 mile = 0.0144927536 radians)
  const angularDistance = distance / earthRadius;

  // Generate a random angle in radians (between 0 and 2π)
  const randomAngle = Math.random() * 2 * Math.PI;

  // Calculate the new latitude using the Haversine formula
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(randomAngle)
  );

  // Calculate the new longitude using the Haversine formula
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(randomAngle) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  // Convert the new latitude and longitude back to degrees
  const newLatitude = toDegrees(lat2);
  const newLongitude = toDegrees(lon2);

  return { latitude: newLatitude, longitude: newLongitude };
}

function areCoordinatesWithinDistance(lat1, lon1, lat2, lon2, distance) {
  const earthRadius = 3959; // Radius of the Earth in miles

  // Convert latitude and longitude to radians
  const latRad1 = toRadians(lat1);
  const lonRad1 = toRadians(lon1);
  const latRad2 = toRadians(lat2);
  const lonRad2 = toRadians(lon2);

  // Calculate the differences between coordinates
  const deltaLat = latRad2 - latRad1;
  const deltaLon = lonRad2 - lonRad1;

  // Calculate the distance using the Haversine formula
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(latRad1) * Math.cos(latRad2) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const calculatedDistance = earthRadius * c;

  // Check if the calculated distance is within the given distance threshold
  return calculatedDistance <= distance;
}

// Helper function to convert degrees to radians
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

async function startNewRace(user1id, user2id, latitude, longitude) {
  console.log("CREATING RACE\n");
  let query1 = firestore.query(
    statsRef,
    firestore.where("userid", "==", user1id)
  );
  let query1Snapshot = await firestore.getDocs(query1);
  query1Snapshot.forEach((doc) => {
    firestore.updateDoc(doc.ref, { inrace: true });
  });

  let query2 = firestore.query(
    statsRef,
    firestore.where("userid", "==", user2id)
  );
  let query2Snapshot = await firestore.getDocs(query2);
  query2Snapshot.forEach((doc) => {
    firestore.updateDoc(doc.ref, { inrace: true });
  });

  // 1 mile apart? change later
  let raceDestination = generateRandomPoint(latitude, longitude, 1);

  firestore.addDoc(racesRef, {
    user1: user1id,
    user2: user2id,
    location: new firestore.GeoPoint(
      raceDestination.latitude,
      raceDestination.longitude
    ),
    winner: null,
    expiration: new Date(new Date().getTime() + 10 * 60 * 1000),
  });
}

async function removeUsersFromRace(user1id, user2id) {
  let query1 = firestore.query(
    statsRef,
    firestore.where("userid", "==", user1id)
  );
  let query1Snapshot = await firestore.getDocs(query1);
  query1Snapshot.forEach((doc) => {
    firestore.updateDoc(doc.ref, { inrace: false });
  });

  let query2 = firestore.query(
    statsRef,
    firestore.where("userid", "==", user2id)
  );
  let query2Snapshot = await firestore.getDocs(query2);
  query2Snapshot.forEach((doc) => {
    firestore.updateDoc(doc.ref, { inrace: false });
  });
}

app.get("/racelobby", csrfProtection, verifyUserInRace, (req, res) => {
  res.render("racelobby");
});

app.put("/findNearbyRacer", csrfProtection, async (req, res) => {
  let userID = req.session.user.uid;
  let qv = firestore.query(racesRef);
  let qvsnap = await firestore.getDocs(qv);
  let alreadyInRace = false;
  qvsnap.forEach(async (doc) => {
    let data = doc.data();
    let expiration = data.expiration.toDate();
    if (new Date() > expiration) {
      console.log("RACE EXPIRED");
      await firestore.deleteDoc(doc.ref);
      await removeUsersFromRace(data.user1, data.user2);
      return;
    }
    if (data.user1 == userID || data.user2 == userID) {
      alreadyInRace = true;
    }
  });
  if (alreadyInRace) {
    console.log("ALREADY IN RACE");
    res.status(200).json({ message: "race started" });
    return;
  }

  let { latitude, longitude } = req.body;

  let query = firestore.query(statsRef);
  let querySnapshot = await firestore.getDocs(query);
  if (!req.session.user) {
    res.status(401).json({ message: "invalid user" });
    return;
  }

  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    if (data.userid === userID || data.inrace === true) {
      continue; // Skip this document and proceed to the next one
    }

    if (
      areCoordinatesWithinDistance(
        latitude,
        longitude,
        data.location.latitude,
        data.location.longitude,
        0.25
      )
    ) {
      await startNewRace(userID, data.userid, latitude, longitude);
      res.status(200).json({ message: "race started" });
      return;
    }
  }
  res.status(404).json({ message: "no racers found" });
});

exports.app = functions.https.onRequest(app);
