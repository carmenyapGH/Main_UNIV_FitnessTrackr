// api/users.js
const express = require("express");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");

const {
  getUser,
  getUserByUsername,
  createUser,
  getPublicRoutinesByUser,
} = require("../db");

usersRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
      return;
    }

    if (password.length < 8) {
      next({
        name: "PasswordLengthError",
        message: "Passwords must be at least 8 characters long!",
      });
      return;
    }

    const user = await createUser({
      username,
      password,
    });

    res.send({ user });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUser({ username, password });

    if (user) {
      const token = jwt.sign(user, process.env.JWT_SECRET);

      res.send({ token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(400).send("no user");
    }
    console.log("/me", req.user);
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:username/routines", async (req, res, next) => {
  try {
    const user = await getUserByUsername(req.params.username);

    const routines = await getPublicRoutinesByUser({ username: user.username });

    res.send(routines);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
