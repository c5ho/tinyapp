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
  b6UTxQ: 
  {
      longURL: "https://www.tsn.ca",
      userID: "u1RdmID1"
  },
  i3BoGr: 
  {
      longURL: "https://www.google.ca",
      userID: "u2RdmID1"
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
    email: "user1@example.com", 
    password: "asd123"
  },
  
 "u2RdmID2": 
 {
    id: "u2RdmID1", 
    email: "user2@example.com", 
    password: "asd098"
  }
}

//GET /MAIN
app.get("/", (request, response) => {
//  const templateVars = { greeting: 'Hello World!' };
  response.redirect("/urls");
});

//GET LOGIN (get email and password from login form)
app.get("/login", (request, response) => {
  console.log(request.cookies);

  const templateVars = {
    user_id: request.cookies.user_id
  };
  response.render("login_form", templateVars);
});

//POST LOGIN (log the email with user ID and password)
app.post("/login", (request, response) => {
  
  console.log(request.body);
  console.log('Logging in:', request.body.user_id);
  
  //If the email entered is not existing in database
  if (!checkForEmail(request.body.user_id)) {
    console.log('password entered', request.body.password);
    console.log('email not in database')
    return response.status(403).send('Email cannot be found.')
  };

  const user_idFound = checkForEmail(request.body.user_id);
  console.log('email in database', users[user_idFound].email);
  console.log('password should be:', users[user_idFound].password);
  console.log('password entered', request.body.password);

  //If the password matches what's on record
  if (users[user_idFound].password !== request.body.password) {
    return response.status(403).send('Invalid password entered.')
  }

  response.cookie("user_id", request.body.user_id);
  response.redirect("/urls")
});

//GET REGISTER (get email and password form reg form)
app.get("/register", (request, response) => {
  console.log(request.cookies);
  const templateVars = {
    user_id: request.cookies.user_id
  };
  response.render("reg_form", templateVars);
});

//POST REGISTER (register the user with email and password)
app.post("/register", (request, response) => {
  console.log("Registering:", request.body);
  
  //If blank email or password is entered
  if (request.body.email === '' || request.body.password === '') {
      return response.status(400).send('Invalid email or password.')
  };
  
  //If email entered is of an existing user
  if (checkForEmail(request.body.email)) {
    return response.status(400).send('Email already exists.')
  };
 
  const rdmUserIDLength = 7;
  const rdmUserID = 'u' + generateRandomString(rdmUserIDLength);
  users[rdmUserID] = { 
    id: rdmUserID, 
    email: request.body.email, 
    pasword: request.body.password 
  };

    
  console.log(users);
  console.log(request.body);

  response.cookie("user_id", users[rdmUserID]);
  response.redirect("/urls");
});

//GET /URLS (list of all short and long URLS)
app.get("/urls", (request, response) => {
  //variables sent to an EJS template must be inside an object so that data within the template can be accessed by the key
  const templateVars = { 
    urls: urlDatabase,
    user_id: request.cookies.user_id
  };
  
  if (Object.keys(request.cookies).length !== 0) {
    return response.render("urls_index", templateVars);
  }

  response.send('Please login or register to create or view your short URLs.');
  //response.redirect('login');


});

//GET /URLS/NEW (request for new shortURL)
app.get("/urls/new", (request, response) => {
  const templateVars = { user_id: request.cookies.user_id };

  if (Object.keys(request.cookies).length !== 0) {
    return response.render("urls_new", templateVars);
  }
  response.redirect('/login');
});

//GET /URLS/NEW/:SHORTURL (request to see particular shortURL)
app.get("/urls/:shortURL", (request, response) => {
  const templateVars = { 
    shortURL: request.params.shortURL, 
    longURL: urlDatabase[request.params.shortURL].longURL,
    user_id: request.cookies.user_id
  }; 
  response.render("urls_show", templateVars);
});

//GET /U/SHORTURL (redirect to the long URL page)
app.get("/u/:shortURL", (request, response) => {
  if (Object.keys(urlDatabase).includes(request.params.shortURL)) {
    const longURL = urlDatabase[request.params.shortURL].longURL;
    return response.redirect(longURL);
  }
  response.status(403).send('Invalid short URL specified.')
});

//POST /URLS (add new shortURL to the list)
app.post("/urls", (request, response) => {
  console.log(request.body);  // Log the POST request body to the console
  
  if (Object.keys(request.cookies).length !== 0) {
    const shortURLLength = 6;
    const alphaNumeric = generateRandomString(shortURLLength);
    urlDatabase[alphaNumeric] = {
      longURL: request.body.longURL,
      userID: request.cookies.user_id };
    return response.redirect("/urls");
  }
  response.send('Error, not logged in');
});

//POST /URSL/:SHORTURL/DELETE (delete existing shortURL)
app.post("/urls/:shortURL/delete", (request, response) => {
  delete urlDatabase[request.params.shortURL];
  response.redirect("/urls");
});

//POST /URLS/:SHORTURL (edit and update existing shortURL)
app.post("/urls/:shortURL", (request, response) => {
  urlDatabase[request.params.shortURL].longURL = request.body.longURL
  response.redirect("/urls");
  // response.redirect("/urls/"+request.params.shortURL);
});

//POST /LOGOUT (log user out and clear cookies)
app.post("/logout", (request, response) => { 
  response.clearCookie("user_id");
  console.log(request.cookies);
  console.log('Logging out:', request.cookies.user_id);
  response.redirect("/urls");
});

//LISTEN FOR REQUESTS
app.listen(PORT, () => {
  console.log(`Tiny URL app listening on port ${PORT}!`);
});