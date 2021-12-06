const { assert } = require('chai');
const bcrypt = require("bcrypt");
const saltRounds = 10;

const {
  generateRandomString,
  emailLookup,
  passLookup,
  urlsForUser,
  getUserByEmail
} = require('../helpers.js');

const testUsers = {
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

const testUrlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "redditor" },
  sgq3y6: { longURL: "https://www.google.ca", userID: "redditor" }
};

describe('generateRandomString', function() {
  it('should return a random string with a length of 6 characters', function() {
    const randomString = generateRandomString().length;
    const expectedOutput = 6;
    assert.strictEqual(randomString, expectedOutput);
  });
});

describe('emailLookup', function() {
  it('should return true if the email is found in the user database', function() {
    const email = emailLookup("redditor@reddit.com", testUsers);
    assert.strictEqual(email, true);
  });

  it('should return false if given an e-mail that does not exist in the database', function() {
    const email = emailLookup("asdasd@asdasd.com", testUsers);
    assert.strictEqual(email, false);
  });
});

describe('passLookup', function() {
  it('should return true if passwords match for email given', function() {
    const password = passLookup("redditor@reddit.com", "purple-monkey-dinosaur", testUsers);
    assert.strictEqual(password, true);
  });

  it('should return false if passwords do not match for email given', function() {
    const password = passLookup("redditor@reddit.com", "dishwasher-funk", testUsers);
    assert.strictEqual(password, false);
  });
});

describe('urlsForUser', function() {
  it('should return saved URLs for a saved user ID', function() {
    const database = urlsForUser("redditor", testUrlDatabase);
    const expectedOutput  = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "redditor" },
      sgq3y6: { longURL: "https://www.google.ca", userID: "redditor" }
    };
    assert.deepEqual(database, expectedOutput);
  });

  it('should return nothing instead of any URLs for an unknown user ID', function() {
    const database = urlsForUser("asdasd", testUrlDatabase);
    const expectedOutput  = {};
    assert.deepEqual(database, expectedOutput);
  });
});


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("redditor@reddit.com", testUsers);
    const expectedOutput = "redditor";
    assert.strictEqual(user, expectedOutput);
  });

  it('should return undefined if given an e-mail that does not exist in the database', function() {
    const user = getUserByEmail("asdasd@asdasd.com", testUsers);
    assert.strictEqual(user, undefined);
  });
});