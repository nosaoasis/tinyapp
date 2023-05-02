const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const {
  findEmail,
  generateRandomString,
  authenticateLogin,
  fetchUserUrls,
} = require("./helpers");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  const userId = req.session["user_id"];

  if (!userId) return res.redirect("/register");

  let userUrls = fetchUserUrls(urlDatabase, userId);

  const user = users[userId];
  const templateVars = {
    user,
    urls: userUrls,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) return res.redirect("/login");
  const user = users[userId];
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  const userId = req.session["user_id"];
  if (!userId) return res.redirect("/register");
  if (!urlDatabase[id])
    return res
      .status(400)
      .send(
        "<div><h2 style='text-align:center;'>404 Error</h2><p style='text-align:center;'>The page you're trying to access could not be found. Please check the url and try again</p><p style='text-align:center;'><a href='/urls'><button>Home</button></a></p>"
      );

  if (urlDatabase[id].userID !== userId) {
    return res
      .status(400)
      .send(
        "<div><h2 style='text-align:center;'>Permission Error</h2><p style='text-align:center;'>You have not been granted access to the page you seek.</p><p style='text-align:center;'><a href='/urls'><button>Home</button></a></p>"
      );
  }

  const user = users[userId];
  const templateVars = {
    id,
    longURL: urlDatabase[id].longURL,
    user,
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.session["user_id"];
  if (userId) return res.redirect("/urls");

  const user = users[userId];
  const templateVars = {
    user,
  };
  res.status(200).render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session["user_id"];
  if (userId) return res.redirect("/urls");

  const user = users[userId];
  const templateVars = {
    user,
  };
  res.status(200).render("login", templateVars);
});

app.get("/u/:id", (req, res) => {
  const { id } = req.params;
  if (!id || !urlDatabase[id])
    return res
      .status(400)
      .send(
        "<div><h2 style='text-align:center;'>404 Error</h2><p style='text-align:center;'>The page you are trying to access cannot be found. Please check your url address and try again.</p><p style='text-align:center;'><a href='urls'><button>Home</button></a></p>"
      );

  let longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId)
    return res
      .status(400)
      .send(
        "<div><h2 style='text-align:center;'>Permission Denied</h2><p style='text-align:center;'>You must be logged in to shorten a url.</p><p style='text-align:center;'><a href='login'><button>Login</button></a></p>"
      );

  const { longURL } = req.body;
  if (!longURL) {
    return res.redirect("/urls/new");
  }

  const id = generateRandomString();
  urlDatabase[id] = {
    longURL,
    userID: userId,
  };

  res.redirect(`/urls/${id}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) return res.redirect("/register");

  const { shortURL } = req.params;
  if (!shortURL) return res.redirect("/urls");

  if (!urlDatabase[shortURL] || urlDatabase[shortURL].userID !== userId) {
    return res
      .status(400)
      .send(
        "<div><h2 style='text-align:center;'>Permission Error</h2><p style='text-align:center;'>You have not been granted access to the page you seek.</p><p style='text-align:center;'><a href='/urls'><button>Home</button></a></p>"
      );
  }

  delete urlDatabase[shortURL];
  return res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) return res.redirect("/register");

  const { id } = req.params;
  const { newLongURL } = req.body;

  if (!urlDatabase[id] || urlDatabase[id].userID !== userId)
    return res.redirect("/urls");

  urlDatabase[id].longURL = newLongURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email == "" || password == "")
    return res
      .status(400)
      .send(
        "<div><h2 style='text-align:center;'>404 Error</h2><p style='text-align:center;'>An error seem to have occurred with the registration</p><p style='text-align:center;'><a href='register'><button>Register</button></a></p>"
      );
  const findUserInUsers = authenticateLogin(users, email, password);
  if (!findUserInUsers) {
    return res
      .status(400)
      .send(
        "<div><h2 style='text-align:center;'>Login Failure</h2><p style='text-align:center;'>The email and/or password you have attempted to login with has failed. Please check the details and try again.</p><p style='text-align:center;'><a href='login'><button>login</button></a></p>"
      );
  }
  const id = findUserInUsers.id;
  req.session["user_id"] = id;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // confirm inputs are not empty
  if (email == "" || password == "")
    return res
      .status(400)
      .send(
        "<div><h2 style='text-align:center;'>404 Error</h2><p style='text-align:center;'>An error seem to have occurred with the registration process. Please ensure the email and password are correct.</p><p style='text-align:center;'><a href='register'><button>Register</button></a></p>"
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
    password: bcrypt.hashSync(password, 10),
  };
  req.session["user_id"] = id;
  users[id] = newUser;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/login");
});

app.get("*", (req, res) => {
  res
    .status(400)
    .send("Sorry, page not found. <a href='/urls'>Back to home</a>");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
