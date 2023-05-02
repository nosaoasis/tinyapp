const findEmail = (users, email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return undefined;
};

module.exports = {findEmail}