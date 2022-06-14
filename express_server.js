const express = require("express");
const app = express();
const PORT = 8080; //default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  //variables sent to an EJS template must be inside an object so that data within the template can be accessed by the key
  const templateVars = { urls: urlDatabase }; 
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }; 
  res.render("urls_show", templateVars);
});

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}\n`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}\n`);
 });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});