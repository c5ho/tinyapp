const getUserByEmail = require("./helpers");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["To act is to be committed, and to be committed is to be in danger."],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
const PORT = 8080; //default port 8080

//RANDOM ALPHANUMERIC GENERATOR
const generateRandomString = function(n) {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < n; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

//CREATES PERSONAL URL DATABASE BASED ON USER
const filterUrlsForUser = function(id) {
  let newUrlDatabase = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      newUrlDatabase[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return newUrlDatabase;
};

//URL DATABASE
const urlDatabase = {
  b2xVn2:
  {
    longURL: "https://www.tsn.ca",
    userID: "u1RdmID1"
  },
  i3BoGr:
  {
    longURL: "https://www.google.ca",
    userID: "u2RdmID2"
  },
  i8Bf45:
  {
    longURL: "http://www.lighthouselabs.ca",
    userID: "u1RdmID1"
  }
};

//USER DATABASE
const users = {
  "u1RdmID1":
  {
    id: "u1RdmID1",
    email: "user@example.com",
    password: "$2a$10$4w5VgV0mTR0/mO5vujFMGuUrGMErEdrz4.OS2LZ7sHOzegfZ99bzi"
  },
  
  "u2RdmID2":
 {
   id: "u2RdmID1",
   email: "user2@example.com",
   password: "$2a$10$HYnQDWO8BqYMoJBGOZoEIuADcM5fmKVwktF7c4aSusfi96qW/ho9u"
 }
};

//GET /MAIN
app.get("/", (request, response) => {
  if (!request.session.user_id) {
    return response.redirect('/login');
  }
  response.redirect("/urls");
});

//GET LOGIN (get email and password from login form)
app.get("/login", (request, response) => {
  
  const templateVars = {
    user: users[request.session.user_id]
  };

  if (!request.session.user_id) {
    return response.render("login_form", templateVars);
  }
  response.redirect("/urls");
});

//POST LOGIN (log the email with user ID and password)
app.post("/login", (request, response) => {
  
  const user_idFound = getUserByEmail(request.body.email, users);

  //If the email entered is not existing in database
  if (!user_idFound) {
    return response.status(403).send('Email cannot be found.');
  }

  //If the password matches what's on record
  if (!bcrypt.compareSync(request.body.password, users[user_idFound].password)) {
    return response.status(403).send('Invalid password entered.');
  }
  
  request.session.user_id = user_idFound;
  response.redirect("/urls");
});

//GET REGISTER (get email and password form reg form)
app.get("/register", (request, response) => {
  
  const templateVars = {
    user: users[request.session.user_id]
  };

  if (!request.session.user_id) {
    return response.render("reg_form", templateVars);
  }
  response.redirect("/urls");
});

//POST REGISTER (register the user with email and password)
app.post("/register", (request, response) => {
  
  console.log("Registering:", request.body);
  
  //If blank email or password is entered
  if (request.body.email === '' || request.body.password === '') {
    return response.status(400).send('Email or password cannot be blank.');
  }
  
  //If email entered is of an existing user
  if (getUserByEmail(request.body.email, users)) {
    return response.status(400).send('Email already exists.');
  }
  
  //Set user IDs to be a random generated string of 8 characters with prefix 'u'
  const rdmUserIDLength = 7;
  const rdmUserID = 'u' + generateRandomString(rdmUserIDLength);
  
  //Hash incoming password with bcrypt
  const hashedPassword = bcrypt.hashSync(request.body.password, 10);
  
  users[rdmUserID] = {
    id: rdmUserID,
    email: request.body.email,
    password: hashedPassword
  };

  request.session.user_id = rdmUserID;
  response.redirect("/urls");
});

//GET /URLS (list of all short and long URLS)
app.get("/urls", (request, response) => {

  let userUrlDatabase = filterUrlsForUser(request.session.user_id);
  //variables sent to an EJS template must be inside an object so that data within the template can be accessed by the key
  const templateVars = {
    urls: userUrlDatabase,
    user: users[request.session.user_id]
  };

  response.render("urls_index", templateVars);
});

//GET /URLS/NEW (request for new shortURL)
app.get("/urls/new", (request, response) => {

  if (!request.session.user_id) {
    return response.redirect('/login');
  }

  const templateVars = {
    user: users[request.session.user_id]
  };
  
  response.render("urls_new", templateVars);
});

//GET /URLS/NEW/:SHORTURL (request to see particular shortURL)
app.get("/urls/:shortURL", (request, response) => {

  if (!request.session.user_id) {
    return response.status(403).send('Please register or login to access Short URLs.');
  }
  
  if (!Object.keys(urlDatabase).includes(request.params.shortURL)) {
    return response.status(403).send('Invalid short URL.');
  }
  
  if (!Object.keys(filterUrlsForUser(request.session.user_id)).includes(request.params.shortURL)) {
    return response.status(403).send('Invalid short URL for current account.');
  }
  const templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL].longURL,
    user: users[request.session.user_id]
  };
  response.render("urls_show", templateVars);
});

//GET /U/SHORTURL (redirect to the long URL page)
app.get("/u/:shortURL", (request, response) => {
  
  if (Object.keys(urlDatabase).includes(request.params.shortURL)) {
    const longURL = urlDatabase[request.params.shortURL].longURL;
    return response.redirect(longURL);
  }
  response.status(403).send('Invalid short URL specified.');
});

//POST /URLS (add new shortURL to the list)
app.post("/urls", (request, response) => {

  if (!request.session.user_id) {
    return response.send('Error, not logged in');
  }
  console.log(request.body);  // Log the POST request body to the console
  
  const shortURLLength = 6;
  const alphaNumeric = generateRandomString(shortURLLength);
  
  urlDatabase[alphaNumeric] = {
    longURL: request.body.longURL,
    userID: request.session.user_id
  };
  
  response.redirect("/urls/" + alphaNumeric);
});

//POST /URSL/:SHORTURL/DELETE (delete existing shortURL)
app.post("/urls/:shortURL/delete", (request, response) => {

  if (!request.session.user_id) {
    return response.send('Error, not logged in');
  }
  
  delete urlDatabase[request.params.shortURL];
  response.redirect("/urls");
});

//POST /URLS/:SHORTURL (edit and update existing shortURL)
app.post("/urls/:shortURL", (request, response) => {

  if (!request.session.user_id) {
    return response.send('Error, not logged in');
  }

  urlDatabase[request.params.shortURL].longURL = request.body.longURL;
  response.redirect("/urls/" + request.params.shortURL);
});

//POST /LOGOUT (log user out and clear cookies)
app.post("/logout", (request, response) => {
  request.session.user_id = null;
  response.redirect("/urls");
});

//LISTEN FOR REQUESTS
app.listen(PORT, () => {
  console.log(`Tiny URL app listening on port ${PORT}!`);
});