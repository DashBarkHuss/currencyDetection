const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const countryData = require("country-data");
const session = require("express-session");

const cors = require("cors");
const { resolve } = require("path");

app.use(bodyParser.json());
app.use(cors());

var sess = {
  secret: "keyboard cat",
  cookie: {},
  resave: false, // I'm not actually sure...
  saveUninitialized: true, // what these two should be set to
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}
app.use(session(sess));

const countryCurrency = (countryCode) =>
  countryData.callingCountries[countryCode].currencies[0];

const displayPrice = (price, languageCode, currency) =>
  new Intl.NumberFormat(languageCode, {
    style: "currency",
    currency,
  }).format(price);

app.post("/locale", (req, res, next) => {
  const countryCode = req.body.countryCode;
  const languageCode = req.acceptsLanguages()[0];
  const currency = countryCurrency(countryCode);
  req.session.currency = currency;
  req.session.language = languageCode;
  res.send();
});

app.get("/displayPriceExample", (req, res, next) => {
  const price = displayPrice(
    "9000",
    req.session.language,
    req.session.currency
  );
  res.send(price);
});
app.get("/locale", (req, res, next) => {
  res.send(
    `Currency: ${req.session.currency} \nLanguage: ${req.session.language}`
  );
});

app.get("/", async (req, res) => {
  const path = resolve(__dirname + "/index.html");
  res.sendFile(path);
});

app.listen(3000, () => {
  console.log("Running on port 3000");
});
