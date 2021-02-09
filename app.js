require("dotenv").config();

const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");

const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// require database configuration
require("./configs/db.config");

// Middleware Setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

app.use(
  session({
    secret: "randomExcercise", // this should be in the env file as SESSION_SECRET=randomasdfgh and accessed as process.env.SESSION_SECRET
    cookie: { maxAge: 3600000 * 3 }, // 3 hours alive
    resave: true, // refresh the session
    saveUninitialized: false,
    store: new MongoStore({
      //this will create a new collection
      mongooseConnection: mongoose.connection,
      ttl: 60 * 60 * 24 * 7, //time to live in the database (14 days - Default)
    }),
  })
);

// default value for title local
app.locals.title = "Express - Generated with IronGenerator";

const index = require("./routes/index.routes");
app.use("/", index);

module.exports = app;
