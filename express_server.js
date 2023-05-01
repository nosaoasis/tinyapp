const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// random string function ......
const generateRandomString = (len) => {
  let generatedNumber = Math.random()
    .toString(20)
    .substr(2, `${len > 6 ? (len = 6) : (len = 6)}`);
  return generatedNumber;
};

const findEmail = (users, email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

// ========================================================================
// ========================================================================

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];

  if (!userId) return res.redirect("/register");
  const user = users[userId];
  const templateVars = {
    urls: urlDatabase,
    user,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) return res.redirect("/register");
  const user = users[userId];
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.cookies["user_id"];
  if (!userId) return res.redirect("/register");

  const user = users[userId];
  const templateVars = {
    id,
    longURL: urlDatabase[id],
    user,
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) return res.redirect("/urls");

  const user = users[userId];
  const templateVars = {
    user,
  };
  res.status(200).render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) return res.redirect("/urls");

  const user = users[userId];
  const templateVars = {
    user,
  };
  res.status(200).render("login", templateVars);
});

app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  if (!longURL) {
    res.redirect("/urls/new");
  }
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;
  if (!shortURL) {
    return res.redirect("/urls");
  }
  for (let shorturl in urlDatabase) {
    if (shorturl == shortURL) {
      delete urlDatabase[shortURL];
      return res.redirect("/urls");
    }
  }
});

app.post("/urls/:id", (req, res) => {
  const { id } = req.params;
  const { newLongURL } = req.body;
  if (!urlDatabase[id]) return res.redirect("/urls");
  urlDatabase[id] = newLongURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.redirect("/urls");

  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // confirm inputs are not empty
  if (email == "" || password == "")
    return res
      .status(400)
      .send(
        "<div><h2 style='text-align:center;'>404 Error</h2><p style='text-align:center;'>An error seem to have occurred with the registration</p><p style='text-align:center;'><a href='register'><button>Register</button></a></p>"
      );

  // confirm that the email does not exist in the users object
  const queryEmail = findEmail(users, email);
  if (queryEmail)
    return res
      .status(400)
      .send(
        "<div><h2 style='text-align:center;'>404 Error</h2><p style='text-align:center;'>An error seem to have occurred with the registration</p><p style='text-align:center;'><a href='register'><button>Register</button></a></p>"
      );

  const id = generateRandomString(email.length);
  const newUser = {
    id,
    email,
    password,
  };
  res.cookie("user_id", id);
  users[id] = newUser;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("*", (req, res) => {
  res
    .status(400)
    .send("Sorry, page not found. <a href='/urls'>Back to home</a>");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
