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
  // console.log("3 fields============>", isPublic, name, goal);
  // console.log("req.body==============>", req.body);
  // console.log("req.params==============>", routineId);
  let authToken = req.headers.authorization.split(" ")[1];
  // console.log("typeof(isPublic)", typeof isPublic);

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
  // console.log("routineToUpdate =====>", routineToUpdate);

  // console.log("=======================isPublic", routineToUpdate.isPublic);
  // console.log(
  //   "===============type of isPublic",
  //   typeof routineToUpdate.isPublic
  // );
  // xisPublic = !isPublic;
  // xif (!isPublic) {
  // x  isPublic = true;
  // x} else {
  // x  isPublic = false;
  // x}

  try {
    const updatedPost = await updateRoutine(routineToUpdate);

    console.log("updatedPost==============>", updatedPost);
    res.send(updatedPost);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

routinesRouter.post(
  "/:routineId/activities",
  requireUser,
  async (req, res, next) => {
    const { activityId, count, duration } = req.body;
    const { routineId } = req.params;
    console.log("POST request ****************==============>", req.body);
    console.log("POST routineId ****************==============>", routineId);
    // let authToken = req.headers.authorization.split(" ")[1];
    // console.log("req head==============>", authToken);
    // console.log("req user.id ==============>", req.user.id);
    console.log("routineId****************==============>", routineId);
    try {
      const chkRoutineAct = await getRoutineActivitiesByRoutine({
        id: routineId,
      });
      console.log("POST chkRoutineAct ******=============>", chkRoutineAct);
      // if (chkRoutineAct) {
      //   next({ error: "Already exist!." });
      // }
      if (!chkRoutineAct) {
        const respondedRoutineActivity = await addActivityToRoutine({
          routineId,
          activityId,
          count,
          duration,
        });
        console.log(
          "POST respondedRoutineActivity =============>",
          respondedRoutineActivity,
          respondedRoutineActivity.routineId,
          respondedRoutineActivity.activityId
        );

        res.send(respondedRoutineActivity);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = routinesRouter;
