// api/activities.js

const express = require("express");
const activitiesRouter = express.Router();
const { requireUser } = require("./utils");
const {
  getAllActivities,
  createActivity,
  getActivityById,
  updateActivity,
  getAllPublicRoutines,
  getPublicRoutinesByActivity,
} = require("../db");

activitiesRouter.get("/", async (req, res, next) => {
  try {
    const activities = await getAllActivities();
    // console.log("activities===>", activities);
    res.send(activities);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.post("/", async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const activities = await createActivity({ name, description });
    // console.log("activities===>", activities);
    if (!activities) {
      next({ error: "Could not make post." });
    }
    res.send(activities);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.patch("/:activityId", requireUser, async (req, res, next) => {
  const { activityId } = req.params;
  const { name, description } = req.body;
  // console.log("req.body==============>", req.body);
  // console.log("req.params==============>", req.params);
  // console.log("req.name==============>", req.body.name);
  // console.log("req.description==============>", req.body.description);

  let authToken = req.headers.authorization.split(" ")[1];

  // console.log("req head==============>", authToken);
  // const updateFields = {};

  // if (name) {
  //   updateFields.name = req.body.name;
  // }

  // if (description) {
  //   updateFields.description = req.body.name;
  // }

  try {
    const originalPost = await getActivityById(activityId);
    // console.log("originalPost==============>", originalPost);
    const updatedPost = await updateActivity({
      id: activityId,
      name,
      description,
    });
    res.send(updatedPost);

    // console.log("originalPost.author.id==============>", originalPost.id);
    // console.log("req.user.id==============>", req.user.id);

    // const updatedPost = await updateActivity(activityId, updateFields);
    // console.log("updatedPost==============>", updatedPost);

    // if (originalPost.id === req.user.id) {
    //   const updatedPost = await updateActivity(activityId, updateFields);
    //   res.send({ post: updatedPost });
    // } else {
    //   next({
    //     name: "UnauthorizedUserError",
    //     message: "You cannot update a post that is not yours",
    //   });
    // }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

activitiesRouter.get("/:activityId/routines", async (req, res, next) => {
  const { activityId } = req.params;

  try {
    const activities = await getAllPublicRoutines();

    // console.log("activities===>", activities);

    const routines = await getPublicRoutinesByActivity(activityId);
    // console.log("routines===>", routines);

    res.send(routines);
  } catch (error) {
    next(error);
  }
});

module.exports = activitiesRouter;
