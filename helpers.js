//CHECK FOR EMAIL (Helper function that checks for email in the user database and returns true if found)
const getUserByEmail = function(email, users) {
  for (let user_id in users) {
    if (users[user_id].email === email) {
      return user_id;
    }
  }
}

//RANDOM ALPHANUMERIC GENERATOR
const generateRandomString = function(n) {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < n; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

//CREATES PERSONAL URL DATABASE BASED ON URLs CREATED BY LOGGED-IN USER
const filterUrlsForUser = function(id, urlDatabase) {
  let newUrlDatabase = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      newUrlDatabase[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return newUrlDatabase;
};

const checkShortURLExist = function(url, urlDatabase) {
  if (Object.keys(urlDatabase).includes(url)) {
    return true;
  }
}

module.exports = { 
  getUserByEmail,
  generateRandomString,
  filterUrlsForUser,
  checkShortURLExist
};

