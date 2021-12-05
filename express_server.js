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

const generateRandomString = () => {
  const char = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
  let result = "";
  while (result.length < 6) {
    result += char.charAt(Math.floor(Math.random() * char.length));
  }
  return result;
};

const emailLookup = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
};

const passLookup = (pass, users) => {
  for (const user in users) {
    if (users[user].password === pass) {
      return true;
    }
  }
};

const findUser = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};

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
    password: "purple-monkey-dinosaur"
  },
  "tumblrite": {
    id: "tumblrite",
    email: "tumblrite@tumblr.com",
    password: "dishwasher-funk"
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
    userID: users[req.cookies["user_id"]],
    urls: urlsForUser(req.cookies["user_id"], urlDatabase)
  };
  res.render("urls_index", templateVars);
});

// GET looking at page to create new short URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    userID: users[req.cookies["user_id"]],
  };
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    userID: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    userID: users[req.cookies["user_id"]],
  };
  res.render("login", templateVars);
});


// GET redirecting to tinyapp page for shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    userID: users[req.cookies["user_id"]],
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
  if (req.cookies["user_id"] !== urlDatabase[req.params.shortURL].userID) {
    res.status(400).send("Invalid short URL");
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

// POST delete requested short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["user_id"] !== urlDatabase[req.params.shortURL].userID) {
    res.status(400).send("Invalid short URL");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
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
    }
    const login = findUser(userEmail, users);
    res.cookie("user_id", login);
    res.redirect("/urls");
  }
});

// POST set logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
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
    users[newUser] = { id: newUser, email: newEmail, password: newPass };
    res.cookie("user_id", newUser);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});