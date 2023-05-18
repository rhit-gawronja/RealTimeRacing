const functions = require("firebase-functions");
const express = require("express");
const serviceAccount = require("../creds.json");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const csrf = require("csurf");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://real-time-racing-d2164-default-rtdb.firebaseio.com",
});

app.get("/", (req, res) => {
  const date = new Date();
  const hours = (date.getHours() % 12) + 1; // London is UTC + 1hr;
  res.send(`
      <!doctype html>
      <head>
        <title>Time</title>
        <link rel="stylesheet" href="/style.css">
        <script src="/script.js"></script>
      </head>
      <body>
        <p>In London, the clock strikes:
          <span id="bongs">${"BONG ".repeat(hours)}</span></p>
        <button onClick="refresh(this)">Refresh</button>
      </body>
    </html>`);
});

exports.app = functions.https.onRequest(app);
