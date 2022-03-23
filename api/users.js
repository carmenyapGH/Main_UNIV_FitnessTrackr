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
  // console.log("register==============>", req.body);

  try {
    const _user = await getUserByUsername(username);
    // console.log("getUserByUsernam--->", _user);
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
    // console.log("createUseruser--->");
    // console.log(user, password);
    res.send({ user });
    // } catch ({ name, message }) {
    //   console.log("Error");
    //   next({ name, message });
    // }
  } catch (error) {
    // console.log("Error");
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  // console.log("login==============>", req.body, hashedPassword);
  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUser({ username, password });

    // console.log("user ====>", user);
    // console.log("user.password ====>", user.password);
    // console.log("hashedPassword====>", hashedPassword);
    // const valpassword = await bcrypt.compare(password, user.password);
    // console.log("valpassword====>", hashedPassword);

    if (user) {
      // create token & return to user
      const token = jwt.sign(user, process.env.JWT_SECRET);
      // res.send({ message: "you're logged in!", token: token })
      // console.log("token====>", token);
      res.send({ token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    // console.log(Object.keys(error));
    next(error);
  }
});

usersRouter.get("/me", async (req, res, next) => {
  // console.log("/me=========>", req.user);
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

    // console.log("req.params.username===>", req.params.username);
    // console.log("user===>", user);

    const routines = await getPublicRoutinesByUser({ username: user.username });
    // console.log("username: user.username===>", { username: user.username });
    // console.log("routines===>", routines);

    res.send(routines);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
