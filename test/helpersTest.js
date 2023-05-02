const { assert } = require('chai');

const { findEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe("findEmail", () => {
  it("should return a user with a valid email", () => {
    assert.equal(findEmail(testUsers, "user@example.com"), true);
  });
  it("test that a non-existent email returns undefined", () => {
    assert.equal(findEmail(testUsers, "user@examplee.com"), undefined);
  });
});