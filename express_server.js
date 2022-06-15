const express = require("express");
const app = express();
const PORT = 8080; //default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

function generateRandomString() {
    let randomString = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const stringLength = 6

    for ( let i = 0; i < stringLength; i++ ) {
      randomString += characters.charAt(Math.floor(Math.random()*characters.length));
   }
   return randomString
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  //variables sent to an EJS template must be inside an object so that data within the template can be accessed by the key
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies.username
  }; 
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies.username };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  }; 
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const alphaNumeric = generateRandomString()
  urlDatabase[alphaNumeric] = req.body.longURL;
  res.redirect("/urls/");
  // res.redirect("/urls/"+alphaNumeric)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls/");
  // res.redirect("/urls/"+req.params.shortURL);
});

app.post("/login", (req, res) => {
  console.log('Logging in:', req.body.username);
  res.cookie("username", req.body.username);
  res.redirect("/urls/")
});

app.post("/logout", (req, res) => { 
  res.clearCookie("username", req.cookies.username);
  console.log('Logging out:', req.cookies.username);
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Tiny URL app listening on port ${PORT}!`);
});