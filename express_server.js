const express = require("express");
const app = express();
const PORT = 8080;

// adding parser to convert request to string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// adding parser to create cookies
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.set("view engine", "ejs");

function generateRandomString() {
  const char = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
  let result = "";
  while (result.length < 6) {
    result += char.charAt(Math.floor(Math.random() * char.length));
  }
  return result;
  }

const emailLookup = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    };
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "redditor": {
    id: "redditor", 
    email: "redditor@reddit.com", 
    password: "purple-monkey-dinosaur"
  },
 "tumblrite": {
    id: "tumblrite", 
    email: "tumblrite@tumblr.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user_id: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user_id: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars);
});

// GET redirecting to tinyapp page for shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user_id: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// GET redirecting to long URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// POST edit requested short URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls/");
});

// POST delete requested short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
});

// POST generating new short URL
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// POST set login
app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.user_id);
  res.redirect("/");
});

// POST set login
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/");
});

// POST to register new users
app.post("/register", (req, res) => {
  const newEmail = req.body.email;
  const newPass = req.body.password;
  const emailCheck = emailLookup(newEmail, users)
  if (newEmail === "" || newPass === "") {
    res.status(400).send("Invalid e-mail or password");
  } else if (emailCheck) {
    res.status(400).send("User already found at e-mail submitted");
  }
  const newUser = generateRandomString();
  users[newUser] = { id: newUser, email: newEmail, password: newPass }
  res.cookie("user_id", newUser);
  console.log(users[newUser])
  console.log(users)
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});