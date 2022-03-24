// create an api router
// attach other routers from files in this api directory (users, activities...)
// export the api router

// Build an apiRouter using express Router
const express = require("express");
const apiRouter = express.Router();

apiRouter.get("/health", (req, res, next) => {
  console.log("All is well");
  res.send({ message: "all is well" });
  next();
});

// const usersRouter = require("./usersR");

/* start-juicebox********************/
const jwt = require("jsonwebtoken");
const { getUserById } = require("../db");
const { JWT_SECRET } = process.env;

// set `req.user` if possible
apiRouter.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");

  if (!auth) {
    // nothing to see here
    next();
  } else if (auth.startsWith(prefix)) {
    // const token = auth.slice(prefix.length);
    const [, token] = auth.split(" ");

    try {
      //decrypting the token back to a user object and grabbing the user id
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

apiRouter.use((req, res, next) => {
  if (req.user) {
    console.log("User is set:", req.user);
  }

  console.log("I am in the api routes");
  console.log(req.user);
  // res.send({ message: 'hello from /api!' })
  next();
});
/* end-juicebox********************/

// Attach routers below here
const usersRouter = require("./users");
apiRouter.use("/users", usersRouter);

const activitiesRouter = require("./activities");
apiRouter.use("/activities", activitiesRouter);

const routinesRouter = require("./routines");
apiRouter.use("/routines", routinesRouter);

const routine_activitiesRouter = require("./routine_activities");
apiRouter.use("/routine_activities", routine_activitiesRouter);

module.exports = apiRouter;
