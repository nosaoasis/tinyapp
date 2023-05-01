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

// random string function ......
const generateRandomString = (len) => {
  let generatedNumber = Math.random()
    .toString(20)
    .substr(2, `${len > 6 ? (len = 6) : (len = 6)}`);
  return generatedNumber;
};

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
  const username = req.cookies["username"];
  const templateVars = {
    urls: urlDatabase,
    username,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = {
    username,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  const username = req.cookies["username"];
  const templateVars = { id, 
    longURL: urlDatabase[id], 
    username 
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = {  
    username 
  };
  res.status(200).render("register", templateVars);
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

app.post("/logout", (req, res) => {
  res.clearCookie('username')
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
