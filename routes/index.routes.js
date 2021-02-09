const express = require("express");
const indexRouter = express.Router();
const User = require("./../models/User.model");

const bcrypt = require("bcrypt");
const saltRounds = 10;

/* GET home page */
indexRouter.get("/", (req, res, next) => res.render("index"));

indexRouter.get("/signup", (req, res, next) => res.render("signup"));

indexRouter.post("/signup", (req, res, next) => {
  const { username, password } = req.body;
  if (username === "" || password === "") {
    res.render("/signup", { errorMessage: "Username and password are needed" });
    return;
  }

  // check if username is taken
  User.findOne({ username: username }).then((user) => {
    // if username is taken, display error message
    if (user !== null) {
      res.render("auth-views/signup-form", {
        errorMessage: "Provide correct data",
      });
      return; // we terminate the process
    }

    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    User.create({ username: username, password: hashedPassword })
      .then((user) => {
        req.session.currentUser = user;
        res.redirect("/main");
      })
      .catch((err) => {
        res.render("signup", {
          errorMessage: "Username and password are needed",
        });
      });
  });
});

indexRouter.get("/login", (req, res, next) => res.render("login"));

indexRouter.post("/login", (req, res, next) => {
  const { username, password } = req.body;
  if (username === "" || password === "") {
    res.render("/login", { errorMessage: "Username and password are needed" });
    return;
  }

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        res.render("/login", { errorMessage: "Enter a valid username" });
        return;
      }

      const passwordCorrect = bcrypt.compareSync(password, user.password);

      if (passwordCorrect) {
        req.session.currentUser = user;
        res.redirect("/main");
      } else {
        res.render("/login", {
          errorMessage: "Indicate username and password",
        });
      }
    })
    .catch((err) => {
      res.redirect("/login");
    });
});

indexRouter.get("/main", (req, res, next) => {
  if (req.session.currentUser) {
    const data = {
      username: req.session.currentUser.username,
      password: req.session.currentUser.password,
    };
    res.render("main", data);
  } else {
    res.redirect("/");
  }
});

indexRouter.get("/private", (req, res, next) => {
  if (req.session.currentUser) {
    res.render("private");
  } else {
    res.redirect("/");
  }
});

module.exports = indexRouter;
