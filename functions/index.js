const functions = require("firebase-functions");
const express = require("express");
const creds = require("./creds.json");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const csrf = require("csurf");
const firebase = require("firebase/app");
const auth = require("firebase/auth");

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

app.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.get("/", csrfProtection, (req, res) => {
  if (req.session.user) {
    res.render("home", { user: req.session.user, csrfToken: req.csrfToken() });
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

app.get("/racepage", (req, res) => {
  res.render("racePage");
});

exports.app = functions.https.onRequest(app);
