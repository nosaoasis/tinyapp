const findEmail = (users, email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return undefined;
};

const generateRandomString = (len) => {
  let generatedNumber = Math.random()
    .toString(20)
    .substr(2, `${len > 6 ? (len = 6) : (len = 6)}`);
  return generatedNumber;
};
const authenticateLogin = (users, email, password) => {
  for (let user in users) {
    const userEmailFound = findEmail(users, email);
    if (userEmailFound && bcrypt.compareSync(password, users[user].password))
      return users[user];
  }
  return false;
};

const fetchUserUrls = (urlDatabase, userId) => {
  let userUrls = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID == userId) {
      userUrls[shortUrl] = urlDatabase[shortUrl].longURL;
    }
  }
  return userUrls;
};

module.exports = {
  findEmail,
  generateRandomString,
  authenticateLogin,
  fetchUserUrls,
};
