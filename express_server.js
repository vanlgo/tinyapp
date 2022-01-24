const {
  generateRandomString,
  emailLookup,
  passLookup,
  urlsForUser,
  getUserByEmail
} = require("./helpers");
const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

// adding parser to convert request to string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// adding cookie-session to encrypt cookies
const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: ["super", "secret"],
}));

// using bcrypt 5.0.1 to hash the password
const bcrypt = require("bcrypt");
const saltRounds = 10;


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "redditor" },
  sgq3y6: { longURL: "https://www.google.ca", userID: "redditor" },
  tm8zHu: { longURL: "https://www.youtube.com", userID: "tumblrite" },
  S2pHzQ: { longURL: "https://en.wikipedia.org", userID: "tumblrite" }
};

const users = {
  "redditor": {
    id: "redditor",
    email: "redditor@reddit.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
  "tumblrite": {
    id: "tumblrite",
    email: "tumblrite@tumblr.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds)
  }
};

// redirects user according to if they're logged in or not
app.get("/", (req, res) => {
  if (!req.session["user_id"]) { // GET checks for logged in user
    res.redirect("/login");
  }

  const templateVars = {
    userID: users[req.session["user_id"]],
  };

  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// GET looking at signed in user's saved short URLs
app.get("/urls", (req, res) => {
  if (!req.session["user_id"]) { // GET checks for logged in user
    res.redirect("/");
  }

  const templateVars = {
    userID: users[req.session["user_id"]],
    urls: urlsForUser(req.session["user_id"], urlDatabase)
  };

  res.render("urls_index", templateVars);
});

// GET looking at page to create new short URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    userID: users[req.session["user_id"]],
  };
  if (!req.session["user_id"]) { // GET checks for logged in user
    res.redirect("/");
  }

  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    userID: users[req.session["user_id"]],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    userID: users[req.session["user_id"]],
  };
  res.render("login", templateVars);
});

// GET redirecting to tinyapp page for shortURL
app.get("/urls/:shortURL", (req, res) => {
  if (req.session["user_id"] !== urlDatabase[req.params.shortURL].userID || !req.session["user_id"]) {
    res.redirect("/login");
  }

  const templateVars = {
    userID: users[req.session["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };

  res.render("urls_show", templateVars);
});

// GET redirecting to long URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// POST edit requested short URL
app.post("/urls/:shortURL", (req, res) => {
  if (req.session["user_id"] !== urlDatabase[req.params.shortURL].userID || !req.session["user_id"]) {
    res.redirect("/login");
  }

  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");

});

// POST delete requested short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session["user_id"] !== urlDatabase[req.params.shortURL].userID || !req.session["user_id"]) {
    res.redirect("/login");
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");

});

// POST generating new short URL
app.post("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID };

  if (!req.session["user_id"]) {
    res.redirect("/login");
  }

  res.redirect(`/urls/${shortURL}`);
});

// POST to login users
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;

  if (!emailLookup(userEmail, users)) {
    return res.status(400).send("Invalid e-mail or password");
  }

  if (!passLookup(userEmail, userPass, users)) {
    return res.status(400).send("Invalid e-mail or password");
  }

  const login = getUserByEmail(userEmail, users);
  req.session["user_id"] = login;
  res.redirect("/");

});

// POST set logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

// POST to register new users
app.post("/register", (req, res) => {
  const newEmail = req.body.email;
  const newPass = req.body.password;

  if (newEmail === "" || newPass === "") {
    return res.status(400).send("Invalid e-mail or password");
  }
  if (emailLookup(newEmail, users)) {
    return res.status(400).send("User already found at e-mail submitted");
  }
  const newUser = generateRandomString();
  const hashedPass = bcrypt.hashSync(newPass, saltRounds);
  users[newUser] = { id: newUser, email: newEmail, password: hashedPass };
  req.session["user_id"] = newUser;
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});