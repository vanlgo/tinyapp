const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

// adding parser to convert request to string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// adding cookie-session to encrypt cookies
const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: ["super", "secret"],
}));

// using bcrypt 5.0.1 to hash the password
const bcrypt = require('bcrypt');
const saltRounds = 10;

const generateRandomString = () => {
  const char = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
  let result = "";
  while (result.length < 6) {
    result += char.charAt(Math.floor(Math.random() * char.length));
  }
  return result;
};

// function to check for emails on file
const emailLookup = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

// function checking for hashed password
const passLookup = (pass, users) => {
  for (const user in users) {
    if (bcrypt.compareSync(pass, users[user].password)) {
      return true;
    }
  }
  return false;
};

// function checking for users in database
const getUserByEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};

// function checking for URLs saved for user
const urlsForUser = (id, urls) => {
  let shortList = {};
  for (const url in urls) {
    if (urls[url].userID === id) {
      shortList[url] = urls[url];
    }
  }
  return shortList;
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "redditor" },
  sgq3y6: { longURL: "https://www.google.ca", userID: "redditor" }
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


app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// GET looking at signed in user's saved short URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    userID: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

// GET looking at page to create new short URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    userID: users[req.session.user_id],
  };
  if (!req.session.user_id) { // GET only allows those who are logged in to add new URLs
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }

});

app.get("/register", (req, res) => {
  const templateVars = {
    userID: users[req.session.user_id],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    userID: users[req.session.user_id],
  };
  res.render("login", templateVars);
});

// GET redirecting to tinyapp page for shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    userID: users[req.session.user_id],
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
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.status(400).send("Invalid short URL");
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

// POST delete requested short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.status(400).send("Invalid short URL");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

// POST generating new short URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// POST to login users
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;

  if (!emailLookup(userEmail, users)) {
    res.status(400).send("Invalid e-mail or password");
  } else {
    if (!passLookup(userPass, users)) {
      res.status(400).send("Invalid e-mail or password");
    } else {
      const login = getUserByEmail(userEmail, users);
      req.session.user_id = login;
      res.redirect("/urls");
    }
  }
});

// POST set logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

// POST to register new users
app.post("/register", (req, res) => {
  const newEmail = req.body.email;
  const newPass = req.body.password;

  if (newEmail === "" || newPass === "") {
    res.status(400).send("Invalid e-mail or password");
  } else if (emailLookup(newEmail, users)) {
    res.status(400).send("User already found at e-mail submitted");
  } else {
    const newUser = generateRandomString();
    const hashedPass = bcrypt.hashSync(newPass, saltRounds);
    users[newUser] = { id: newUser, email: newEmail, password: hashedPass };
    req.session.user_id = newUser;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});