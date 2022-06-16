const express = require("express");
const app = express();
const PORT = 8080; //default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

//RANDOM ALPHANUMERIC GENERATOR
function generateRandomString(n) {
    let randomString = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( let i = 0; i < n; i++ ) {
      randomString += characters.charAt(Math.floor(Math.random()*characters.length));
    }
  return randomString;
}

//CHECK FOR EMAIL (Helper function that checks for email in the user database and returns true if found)
function checkForEmail(email) {
  for (let id in users) {
    if (users[id].email === email) {
      return id;
    }
  }
  return false;
}
    
//URL DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//USER DATABASE
const users = { 
  "userRandomID": 
  {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "asd098"
  },
  
 "user2RandomID": 
 {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//GET /MAIN
app.get("/", (req, res) => {
//  const templateVars = { greeting: 'Hello World!' };
  res.redirect("/urls");
});

//GET LOGIN (get user ID and password form login form)
app.get("/login", (req, res) => {
  const templateVars = { user_id: req.cookies.user_id };
  res.render("login_form", templateVars);
});

//POST LOGIN (log the user in with user ID and password)
app.post("/login", (req, res) => {
  console.log('Logging in:', req.body.user_id);
  
  //If the email entered is not existing in database
  if (!checkForEmail(req.body.user_id)) {
    console.log('password entered', req.body.password);
    console.log('email not in database')
    return res.status(403).send('Email cannot be found.')
  };

  const user_idFound = checkForEmail(req.body.user_id);
  console.log('email in database', users[user_idFound].email);
  console.log('password should be:', users[user_idFound].password);
  console.log('password entered', req.body.password);

  if (users[user_idFound].password !== req.body.password) {
    return res.status(403).send('Invalid password entered.')
  }

  res.cookie("user_id", req.body.user_id);
  res.redirect("/urls")
});

//GET REGISTER (get user ID and password form reg form)
app.get("/register", (req, res) => {
  const templateVars = { user_id: req.cookies.user_id };
  res.render("reg_form", templateVars);
});

//POST REGISTER (register the user with user ID and password)
app.post("/register", (req, res) => {
  console.log("Registering:", req.body);
  if (req.body.user_id === '' || req.body.password === '') {
      return res.status(400).send('Invalid email or password.')
  };
 
  if (checkForEmail(req.body.user_id)) {
    return res.status(400).send('Email already exists.')
  };
 
  const userRandomIDLength = 8;
  const userRandomIDGen = generateRandomString(userRandomIDLength);
  users[userRandomIDGen] = { 
    id: userRandomIDGen, 
    email: req.body.email, 
    pasword: req.body.password 
  };
  
  // console.log(users);
  res.cookie("user_id", req.body.user_id);
  res.redirect("/urls");
});

//GET /URLS (list of all short and long URLS)
app.get("/urls", (req, res) => {
  //variables sent to an EJS template must be inside an object so that data within the template can be accessed by the key
  const templateVars = { 
    urls: urlDatabase,
    user_id: req.cookies.user_id
  }; 
  res.render("urls_index", templateVars);
});

//GET /URLS/NEW (request for new shortURL)
app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.cookies.user_id };
  res.render("urls_new", templateVars);
});

//GET /URLS/NEW/:SHORTURL (request to see particular shortURL)
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies.user_id
  }; 
  res.render("urls_show", templateVars);
});

//GET /U/SHORTURL (redirect to the long URL page)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//POST /URLS (add new shortURL to the list)
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURLLength = 6;
  const alphaNumeric = generateRandomString(shortURLLength);
  urlDatabase[alphaNumeric] = req.body.longURL;
  res.redirect("/urls");
  // res.redirect("/urls/"+alphaNumeric)
});

//POST /URSL/:SHORTURL/DELETE (delete existing shortURL)
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//POST /URLS/:SHORTURL (edit and update existing shortURL)
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls");
  // res.redirect("/urls/"+req.params.shortURL);
});

//POST /LOGOUT (log user out and clear cookies)
app.post("/logout", (req, res) => { 
  res.clearCookie("user_id");
  console.log(req.cookies);
  console.log('Logging out:', req.cookies.user_id);
  res.redirect("/urls");
});

//LISTEN FOR REQUESTS
app.listen(PORT, () => {
  console.log(`Tiny URL app listening on port ${PORT}!`);
});