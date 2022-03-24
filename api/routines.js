// api/routine.js

const express = require("express");
const routinesRouter = express.Router();
const { requireUser } = require("./utils");

const {
  getAllPublicRoutines,
  createRoutine,
  getRoutineById,
  updateRoutine,
  destroyRoutine,
  getPublicRoutinesByActivity,
  getRoutineActivityById,
  getRoutineActivitiesByRoutine,
  addActivityToRoutine,
} = require("../db");

routinesRouter.get("/", async (req, res, next) => {
  // const { activityId } = req.params;

  try {
    const activities = await getAllPublicRoutines();

    // console.log("activities===>", activities);

    res.send(activities);
  } catch (error) {
    next(error);
  }
});

routinesRouter.post("/", requireUser, async (req, res, next) => {
  const { isPublic, name, goal } = req.body;

  // console.log("request==============>", req);
  // console.log("req.body==============>", req.body);
  let authToken = req.headers.authorization.split(" ")[1];

  // console.log("req head==============>", authToken);

  // console.log("req user.id ==============>", req.user.id);

  const routineToCreateAndUpdate = {};
  routineToCreateAndUpdate.creatorId = req.user.id;
  routineToCreateAndUpdate.isPublic = req.body.isPublic;
  routineToCreateAndUpdate.name = req.body.name;
  routineToCreateAndUpdate.goal = req.body.goal;

  try {
    const routines = await createRoutine(routineToCreateAndUpdate);
    // console.log("routines===>", routines);

    if (!routines) {
      next({ error: "Could not make post." });
    }
    res.send(routines);
  } catch (error) {
    next(error);
  }
});

routinesRouter.delete("/:routineId", async (req, res, next) => {
  const { routineId } = req.params;
  try {
    const post = await getRoutineById(routineId);
    // console.log("post Tobe DELETED=======>", post);
    if (post) {
      await destroyRoutine(post.id);
      // console.log("DELETED Post id =======>", post.id);
      // console.log("DELETED Post =======>", post);
      res.send(post);
    } else {
      // throw an error when no routine id was found.
      next({
        name: "PostNotFoundError",
        message: "That routine id does not exist",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

routinesRouter.patch("/:routineId", requireUser, async (req, res, next) => {
  const { routineId } = req.params;
  const { isPublic, name, goal } = req.body;

  let authToken = req.headers.authorization.split(" ")[1];

  let routineToUpdate = {};
  if (routineId) {
    routineToUpdate.id = routineId;
  }

  if (isPublic !== undefined) {
    routineToUpdate.isPublic = isPublic;
  }
  if (name) {
    routineToUpdate.name = name;
  }
  if (goal) {
    routineToUpdate.goal = goal;
  }

  try {
    const updatedPost = await updateRoutine(routineToUpdate);
    res.send(updatedPost);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

routinesRouter.post(
  "/:routineId/activities",

  async (req, res, next) => {
    const { activityId, count, duration } = req.body;
    const { routineId } = req.params;
    console.log(req.body, req.params);

    try {
      const chkRoutineAct = await getRoutineActivitiesByRoutine({
        id: routineId,
      });

      const existingRA =
        chkRoutineAct &&
        chkRoutineAct.filter(
          (routineActivity) => routineActivity.activityId === activityId
        );
      if (existingRA && existingRA.length) {
        next({
          name: "AlreadyExistError",
          message: "Already Exist, please try again",
        });
      } else {
        let respondedRoutineActivity = await addActivityToRoutine({
          routineId,
          activityId,
          count,
          duration,
        });

        if (respondedRoutineActivity) {
          res.send(respondedRoutineActivity);
        } else {
          next({
            name: "CreateFailedError",
            message: "Create failed, please try again",
          });
        }
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

module.exports = routinesRouter;
