const bcrypt = require("bcrypt");

// generate new string for user IDs
const generateRandomString = () => {
  const char = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
  let result = "";
  while (result.length < 6) {
    result += char.charAt(Math.floor(Math.random() * char.length));
  }
  return result;
};

// function to check if the e-mail is on file
const emailLookup = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

// function checking for hashed password
const passLookup = (email, pass, users) => {
  let userID;
  for (const user in users) {
    if (users[user].email === email) {
      userID = users[user];
    }
  }
  if (bcrypt.compareSync(pass, userID.password)) {
    return true;
  }
  return false;
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

// function checking for users in database
const getUserByEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
};

module.exports = {
  generateRandomString,
  emailLookup,
  passLookup,
  urlsForUser,
  getUserByEmail
};