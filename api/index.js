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
  // apiRouter.get("/me", async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");
  // console.log("auth===>", auth);
  if (!auth) {
    // nothing to see here
    next();
  } else if (auth.startsWith(prefix)) {
    // const token = auth.slice(prefix.length);
    const [, token] = auth.split(" ");
    // console.log("(auth.startsWith(prefix)auth===>", auth.startsWith(prefix));
    // console.log("[, token]===>", [, token]);
    try {
      //decrypting the token back to a user object and grabbing the user id
      const { id } = jwt.verify(token, JWT_SECRET);
      // console.log("(id===>", id, username);
      if (id) {
        req.user = await getUserById(id);

        // console.log("(req.user===>", req.user);
        // res.send(req.user);
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

// app.use(async (req, res, next) => {
//   if (!req.headers.authorization) {
//     return next();
//   }
//   const auth = req.headers.authorization.split(" ")[1];
//   const _user = jwt.decode(auth, process.env.JWT_SECRET);
//   if (!_user) {
//     return next();
//   }
//   const user = await getUserById(_user.id);
//   req.user = user;
//   next();
// });

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

// all routers attached ABOVE here
// apiRouter.use((error, req, res, next) => {
//   res.send({
//     name: error.name,
//     message: error.message,
//   });
// });

module.exports = apiRouter;
