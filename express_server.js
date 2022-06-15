const express = require("express");
const app = express();
const PORT = 8080; //default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

function generateRandomString(n) {
    let randomString = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    for ( let i = 0; i < n; i++ ) {
      randomString += characters.charAt(Math.floor(Math.random()*characters.length));
   }
   return randomString
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": 
  {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  
 "user2RandomID": 
 {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
//  const templateVars = { greeting: 'Hello World!' };
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user_id: req.cookies.user_id };
  res.render("reg_form", templateVars);
});

app.post("/register", (req, res) => {
  console.log(req.body);
  const userRandomIDLength = 8;
  const userRandomIDGen = generateRandomString(userRandomIDLength);
  users[userRandomIDGen] = { 
    id: userRandomIDGen, 
    email: req.body.email, 
    pasword: req.body.password };
  console.log(users);
  res.cookie("user_id", req.body.email);
  res.redirect("/urls");

 
});


app.get("/urls", (req, res) => {
  //variables sent to an EJS template must be inside an object so that data within the template can be accessed by the key
  const templateVars = { 
    urls: urlDatabase,
    user_id: req.cookies.user_id
  }; 
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.cookies.user_id };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies.user_id
  }; 
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURLLength = 6;
  const alphaNumeric = generateRandomString(shortURLLength);
  urlDatabase[alphaNumeric] = req.body.longURL;
  res.redirect("/urls");
  // res.redirect("/urls/"+alphaNumeric)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls");
  // res.redirect("/urls/"+req.params.shortURL);
});

app.post("/login", (req, res) => {
  console.log('Logging in:', req.body.user_id);
  res.cookie("user_id", req.body.user_id);
  res.redirect("/urls")
});

app.post("/logout", (req, res) => { 
  res.clearCookie("user_id");
  console.log(req.cookies);
  console.log('Logging out:', req.cookies.user_id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tiny URL app listening on port ${PORT}!`);
});